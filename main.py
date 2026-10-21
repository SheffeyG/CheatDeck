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
SIDECAR_POLL_INTERVAL = 0.1


def _read_process_cmdline(pid: int, proc_root: str = "/proc") -> typing.List[str]:
    try:
        with open(os.path.join(proc_root, str(pid), "cmdline"), "rb") as handle:
            raw = handle.read()
    except OSError:
        return []
    return [part.decode("utf-8", "replace") for part in raw.split(b"\0") if part]


def _read_process_state(pid: int, proc_root: str = "/proc") -> typing.Optional[str]:
    """Return the single letter process state from /proc/<pid>/stat (Z = zombie)."""
    try:
        with open(os.path.join(proc_root, str(pid), "stat"), "rb") as handle:
            raw = handle.read()
    except OSError:
        return None
    # The second field is the command name in parentheses and may contain spaces,
    # so split after the last closing parenthesis.
    try:
        rest = raw[raw.rindex(b")") + 2:]
        return rest.split(b" ", 1)[0].decode("ascii", "replace")
    except (ValueError, IndexError):
        return None


def _is_running(pid: int, proc_root: str = "/proc") -> bool:
    state = _read_process_state(pid, proc_root)
    return state is not None and state not in ("Z", "X", "x")


def _sidecar_targets(path: str) -> typing.Set[str]:
    """Unix paths a trainer may be started with, including symlink resolution."""
    targets = {os.path.normpath(path)}
    try:
        targets.add(os.path.realpath(path))
    except OSError:
        pass
    return targets


def _windows_targets(unix_targets: typing.Set[str]) -> typing.Set[str]:
    """Wine exposes the filesystem root as drive Z:, so the same file can show up
    as `Z:\\home\\deck\\trainer.exe` in a process command line."""
    return {"z:" + target.replace("/", "\\").lower() for target in unix_targets}


def _normalize_argument(argument: str) -> typing.Optional[typing.Tuple[str, str]]:
    """Map a command line word to its comparable (kind, value) form."""
    if argument.startswith("/"):
        return ("unix", os.path.normpath(argument))
    # Wine/Windows paths use drive letters and accept both separators.
    if ":" in argument or "\\" in argument:
        return ("windows", argument.replace("/", "\\").lower())
    return None


def _matches_sidecar(
    argv: typing.List[str],
    unix_targets: typing.Set[str],
    windows_targets: typing.Set[str],
) -> bool:
    for argument in argv:
        if not argument:
            continue
        normalized = _normalize_argument(argument)
        if normalized is None:
            continue
        kind, value = normalized
        if kind == "unix" and value in unix_targets:
            return True
        if kind == "windows" and value in windows_targets:
            return True
    return False


def find_sidecar_pids(path: str, proc_root: str = "/proc") -> typing.List[int]:
    """Return the PIDs whose command line references `path` exactly.

    Matching is exact (full path, Unix or Wine/Z: form): a trainer must never
    take out an unrelated process that happens to share a file name.
    """
    if not path or not os.path.isabs(path):
        return []
    unix_targets = _sidecar_targets(path)
    windows_targets = _windows_targets(unix_targets)
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
        if _matches_sidecar(_read_process_cmdline(pid, proc_root), unix_targets, windows_targets):
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
        unix_targets = _sidecar_targets(path) if path else set()
        windows_targets = _windows_targets(unix_targets) if unix_targets else set()
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
        while time.monotonic() < deadline:
            if not any(_is_running(pid) for pid in terminated):
                break
            time.sleep(SIDECAR_POLL_INTERVAL)

        # Escalate for trainers that ignore SIGTERM. Re-check the command line
        # first so a recycled PID belonging to another program is never killed.
        for pid in list(terminated):
            if not _is_running(pid):
                continue
            if not _matches_sidecar(_read_process_cmdline(pid), unix_targets, windows_targets):
                terminated.remove(pid)
                continue
            try:
                os.kill(pid, signal.SIGKILL)
            except OSError:
                terminated.remove(pid)
                failed.append(pid)

        logger.info(
            "[backend] Terminate sidecar {}: found={} terminated={} failed={}".format(path, pids, terminated, failed)
        )
        return {"path": path, "found": pids, "terminated": terminated, "failed": failed}

    @classmethod
    async def get_env(cls, env: str):
        return getattr(decky, env)
