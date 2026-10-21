#!/usr/bin/env python

import logging
import os
import signal
import time
import typing

import decky  # type: ignore
from settings import SettingsManager  # type: ignore

# Setup environment variables
settingsDir = decky.DECKY_PLUGIN_SETTINGS_DIR
loggingDir = decky.DECKY_PLUGIN_LOG_DIR

# Setup backend logger
logger = decky.logger
logger.setLevel(logging.DEBUG)
logger.info("[backend] Settings path: {}".format(settingsDir))

settings = SettingsManager(name="settings", settings_directory=settingsDir)
settings.read()


class SetSettingOptions(typing.TypedDict):
    key: str
    value: typing.Any


class GetSettingOptions(typing.TypedDict):
    key: str
    defaults: typing.Any


class SidecarStatus(typing.TypedDict):
    path: str
    exists: bool
    pids: typing.List[int]


class SidecarTerminateResult(typing.TypedDict):
    path: str
    found: typing.List[int]
    terminated: typing.List[int]
    failed: typing.List[int]


# A trainer launched through PROTON_REMOTE_DEBUG_CMD is a child of the Proton
# process. When a game is force-closed or crashes, Proton never reaches the
# cleanup path that kills the sidecar, so the trainer keeps the prefix (and its
# single-instance mutex) occupied and the next launch fails with "another
# instance is running" (issue #46). The helpers below find and stop exactly the
# process whose command line references the configured trainer path.
SIDECAR_TERMINATE_TIMEOUT = 3.0


def _read_process_cmdline(pid: int, proc_root: str = "/proc") -> typing.List[str]:
    try:
        with open(os.path.join(proc_root, str(pid), "cmdline"), "rb") as handle:
            raw = handle.read()
    except OSError:
        return []
    return [part.decode("utf-8", "replace") for part in raw.split(b"\0") if part]


def _sidecar_targets(path: str) -> typing.Set[str]:
    targets = {os.path.normpath(path)}
    try:
        targets.add(os.path.realpath(path))
    except OSError:
        pass
    return targets


def _matches_sidecar(argv: typing.List[str], targets: typing.Set[str]) -> bool:
    for argument in argv:
        if argument in targets:
            return True
        if argument.startswith("/") and os.path.normpath(argument) in targets:
            return True
    return False


def find_sidecar_pids(path: str, proc_root: str = "/proc") -> typing.List[int]:
    """Return the PIDs whose command line references `path` exactly."""
    if not path or not os.path.isabs(path):
        return []
    targets = _sidecar_targets(path)
    skipped = {os.getpid(), os.getppid()}
    try:
        entries = os.listdir(proc_root)
    except OSError:
        return []
    pids: typing.List[int] = []
    for entry in entries:
        if not entry.isdigit():
            continue
        pid = int(entry)
        if pid in skipped or pid <= 1:
            continue
        if _matches_sidecar(_read_process_cmdline(pid, proc_root), targets):
            pids.append(pid)
    return sorted(pids)


class Plugin:
    @classmethod
    async def _main(cls):
        logger.info("[backend] Loading CheatDeck!")

    @classmethod
    async def _unload(cls):
        logger.info("[backend] Unloading CheatDeck!")

    @classmethod
    async def _uninstall(cls):
        logger.info("[backend] Uninstalling CheatDeck!")

    @classmethod
    async def read_settings(cls):
        logger.info("[backend] Reading settings")
        return settings.read()

    @classmethod
    async def commit_settings(cls):
        logger.info("[backend] Saving settings")
        return settings.commit()

    @classmethod
    async def get_setting(cls, data: GetSettingOptions):
        value = settings.getSetting(data["key"], data["defaults"])
        logger.info("[backend] Get {}: {}".format(data["key"], value))
        return value

    @classmethod
    async def set_setting(cls, data: SetSettingOptions):
        logger.info("[backend] Set {}: {}".format(data["key"], data["value"]))
        return settings.setSetting(data["key"], data["value"])

    @classmethod
    async def _migration(cls):
        if settings.getSetting("CustomOptionsV6", None) is not None:
            return

        logger.info("[backend] Initializing custom option presets")
        settings.setSetting("CustomOptionsV6", [
            {
                "id": "preset-lossless-scaling",
                "label": "LSFG-VK Frame Generation",
                "definition": {
                    "kind": "prefix",
                    "command": "~/lsfg",
                    "argv": [],
                },
            },
            {
                "id": "preset-framegen-patch",
                "label": "Enable OptiScaler",
                "definition": {
                    "kind": "prefix",
                    "command": "~/fgmod/fgmod",
                    "argv": [],
                },
            },
            {
                "id": "preset-framegen-unpatch",
                "label": "Disable OptiScaler",
                "definition": {
                    "kind": "prefix",
                    "command": "~/fgmod/fgmod-uninstaller.sh",
                    "argv": [],
                },
            },
        ])

    @classmethod
    async def probe_sidecar(cls, path: str) -> SidecarStatus:
        pids = find_sidecar_pids(path)
        exists = bool(path) and os.path.exists(path)
        logger.info("[backend] Probe sidecar {}: exists={} pids={}".format(path, exists, pids))
        return {"path": path, "exists": exists, "pids": pids}

    @classmethod
    async def terminate_sidecar(cls, path: str) -> SidecarTerminateResult:
        pids = find_sidecar_pids(path)
        terminated: typing.List[int] = []
        failed: typing.List[int] = []
        for pid in pids:
            try:
                os.kill(pid, signal.SIGTERM)
            except OSError:
                failed.append(pid)
                continue
            terminated.append(pid)

        deadline = time.monotonic() + SIDECAR_TERMINATE_TIMEOUT
        while terminated and time.monotonic() < deadline:
            remaining = [pid for pid in terminated if os.path.exists("/proc/{}".format(pid))]
            if not remaining:
                break
            time.sleep(0.1)

        # Escalate for trainers that ignore SIGTERM.
        for pid in list(terminated):
            if not os.path.exists("/proc/{}".format(pid)):
                continue
            try:
                os.kill(pid, signal.SIGKILL)
            except OSError:
                terminated.remove(pid)
                failed.append(pid)

        logger.info("[backend] Terminate sidecar {}: found={} terminated={} failed={}".format(path, pids, terminated, failed))
        return {"path": path, "found": pids, "terminated": terminated, "failed": failed}

    @classmethod
    async def get_env(cls, env: str):
        return getattr(decky, env)
