"""Tests for the sidecar process helpers in main.py (issue #46).

The Decky runtime (`decky`, `settings`) is not available outside the plugin
sandbox, so both modules are stubbed before importing the plugin entry point.
"""

import asyncio
import os
import subprocess
import sys
import tempfile
import time
import types
import unittest


def _install_decky_stubs() -> None:
    decky = types.ModuleType("decky")
    decky.DECKY_PLUGIN_SETTINGS_DIR = tempfile.mkdtemp()
    decky.DECKY_PLUGIN_LOG_DIR = tempfile.mkdtemp()
    decky.DECKY_USER_HOME = "/home/deck"
    decky.logger = __import__("logging").getLogger("decky-test")
    sys.modules["decky"] = decky

    settings = types.ModuleType("settings")

    class SettingsManager:
        def __init__(self, name: str, settings_directory: str) -> None:
            self.values: dict = {}

        def read(self):
            return self.values

        def commit(self):
            return True

        def getSetting(self, key, defaults=None):
            return self.values.get(key, defaults)

        def setSetting(self, key, value):
            self.values[key] = value
            return value

    settings.SettingsManager = SettingsManager
    sys.modules["settings"] = settings


_install_decky_stubs()
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import main  # noqa: E402


def _write_process(proc_root: str, pid: int, argv: list[str], state: str = "S") -> None:
    directory = os.path.join(proc_root, str(pid))
    os.makedirs(directory, exist_ok=True)
    with open(os.path.join(directory, "cmdline"), "wb") as handle:
        handle.write(b"\0".join(argument.encode() for argument in argv) + b"\0")
    with open(os.path.join(directory, "stat"), "w", encoding="utf-8") as handle:
        handle.write(f"{pid} (trainer) {state} 1 1 0 -1 4194304 0 0 0 0 0 0 0 0 0 0 0 0 0 0\n")


def _spawn_with_argv0(argv0: str) -> subprocess.Popen:
    """Start a long-running process whose argv[0] is exactly `argv0`."""
    return subprocess.Popen(["/bin/bash", "-c", 'exec -a "$0" sleep 60', argv0])


class FindSidecarPidsTest(unittest.TestCase):
    def setUp(self) -> None:
        self.proc_root = tempfile.mkdtemp()
        self.trainer = "/home/deck/Trainers/My Game Trainer.exe"
        self.other = "/home/deck/Trainers/Other Trainer.exe"

    def test_matches_exact_wine_invocation(self) -> None:
        _write_process(self.proc_root, 4242, ["/usr/bin/wine", self.trainer])
        self.assertEqual(main.find_sidecar_pids(self.trainer, self.proc_root), [4242])

    def test_matches_windows_drive_z_form(self) -> None:
        # Wine maps the filesystem root to drive Z:, so a process may carry
        # Z:\home\deck\... instead of the Unix path.
        _write_process(self.proc_root, 4242, ["/usr/bin/wine", "Z:\\home\\deck\\Trainers\\My Game Trainer.exe"])
        self.assertEqual(main.find_sidecar_pids(self.trainer, self.proc_root), [4242])

    def test_matches_windows_form_with_forward_slashes(self) -> None:
        _write_process(self.proc_root, 4242, ["/usr/bin/wine", "Z:/home/deck/Trainers/My Game Trainer.exe"])
        self.assertEqual(main.find_sidecar_pids(self.trainer, self.proc_root), [4242])

    def test_ignores_similar_names(self) -> None:
        _write_process(self.proc_root, 4242, ["/usr/bin/wine", self.other])
        _write_process(self.proc_root, 4243, ["/usr/bin/wine", f"{self.trainer}.bak"])
        _write_process(self.proc_root, 4244, ["/usr/bin/wine", "/home/deck/Trainers/My Game Trainer.exe.new"])
        self.assertEqual(main.find_sidecar_pids(self.trainer, self.proc_root), [])

    def test_ignores_bare_filename(self) -> None:
        _write_process(self.proc_root, 4242, ["/usr/bin/wine", "My Game Trainer.exe"])
        self.assertEqual(main.find_sidecar_pids(self.trainer, self.proc_root), [])

    def test_normalizes_dot_segments(self) -> None:
        _write_process(self.proc_root, 4242, ["/usr/bin/wine", "/home/deck/Trainers/./My Game Trainer.exe"])
        self.assertEqual(main.find_sidecar_pids(self.trainer, self.proc_root), [4242])

    def test_skips_own_process(self) -> None:
        _write_process(self.proc_root, os.getpid(), ["/usr/bin/wine", self.trainer])
        self.assertEqual(main.find_sidecar_pids(self.trainer, self.proc_root), [])

    def test_requires_absolute_path(self) -> None:
        _write_process(self.proc_root, 4242, ["/usr/bin/wine", "My Game Trainer.exe"])
        self.assertEqual(main.find_sidecar_pids("My Game Trainer.exe", self.proc_root), [])
        self.assertEqual(main.find_sidecar_pids("", self.proc_root), [])

    def test_returns_sorted_pids(self) -> None:
        _write_process(self.proc_root, 500, ["/usr/bin/wine", self.trainer])
        _write_process(self.proc_root, 120, ["/usr/bin/wine", self.trainer])
        self.assertEqual(main.find_sidecar_pids(self.trainer, self.proc_root), [120, 500])

    def test_zombie_is_not_running(self) -> None:
        _write_process(self.proc_root, 4242, ["/usr/bin/wine", self.trainer], state="Z")
        self.assertFalse(main._is_running(4242, self.proc_root))
        _write_process(self.proc_root, 4243, ["/usr/bin/wine", self.trainer], state="S")
        self.assertTrue(main._is_running(4243, self.proc_root))


class SidecarTargetsTest(unittest.TestCase):
    def test_symlink_target_is_included(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            real = os.path.join(directory, "trainer.exe")
            link = os.path.join(directory, "link.exe")
            with open(real, "w", encoding="utf-8") as handle:
                handle.write("")
            os.symlink(real, link)
            targets = main._sidecar_targets(link)
            self.assertIn(real, targets)
            self.assertIn(os.path.normpath(link), targets)

    def test_windows_targets_derived_from_unix(self) -> None:
        windows = main._windows_targets({"/home/deck/Trainers/x.exe"})
        self.assertIn("z:\\home\\deck\\trainers\\x.exe", windows)


@unittest.skipUnless(os.path.isdir("/proc"), "requires /proc")
class LiveProcessTest(unittest.TestCase):
    """End-to-end checks against real processes instead of a fake /proc tree."""

    def setUp(self) -> None:
        self.directory = tempfile.mkdtemp()
        self.trainer = os.path.join(self.directory, "Trainer.exe")
        self.decoy = os.path.join(tempfile.mkdtemp(), "Trainer.exe")
        with open(self.trainer, "w", encoding="utf-8") as handle:
            handle.write("")
        with open(self.decoy, "w", encoding="utf-8") as handle:
            handle.write("")
        self.processes: list[subprocess.Popen] = []

    def tearDown(self) -> None:
        for process in self.processes:
            if process.poll() is None:
                process.kill()
            process.wait()

    def _start(self, argv0: str) -> subprocess.Popen:
        process = _spawn_with_argv0(argv0)
        self.processes.append(process)
        # `exec -a` replaces the shell image, so the cmdline only shows argv0
        # after the kernel has completed the exec. Waiting for the /proc entry
        # alone is not enough: it already exists with the shell's command line,
        # which made this test fail sporadically on a loaded machine.
        deadline = time.monotonic() + 5.0
        while time.monotonic() < deadline:
            argv = main._read_process_cmdline(process.pid)
            if argv and argv[0] == argv0:
                return process
            time.sleep(0.01)
        self.fail(f"process {process.pid} never exposed argv0 {argv0!r}")

    def test_finds_real_process_with_unix_path(self) -> None:
        process = self._start(self.trainer)
        self.assertIn(process.pid, main.find_sidecar_pids(self.trainer))

    def test_finds_real_process_with_windows_path(self) -> None:
        windows_path = "Z:" + self.trainer.replace("/", "\\")
        process = self._start(windows_path)
        self.assertIn(process.pid, main.find_sidecar_pids(self.trainer))

    def test_terminate_stops_the_trainer(self) -> None:
        process = self._start(self.trainer)
        result = asyncio.run(main.Plugin.terminate_sidecar(self.trainer))
        self.assertIn(process.pid, result["found"])
        self.assertIn(process.pid, result["terminated"])
        self.assertEqual(process.wait(timeout=10), -15)  # SIGTERM
        self.assertNotIn(process.pid, main.find_sidecar_pids(self.trainer))

    def test_terminate_leaves_lookalike_untouched(self) -> None:
        decoy = self._start(self.decoy)
        result = asyncio.run(main.Plugin.terminate_sidecar(self.trainer))
        self.assertNotIn(decoy.pid, result["found"])
        self.assertIsNone(decoy.poll())


if __name__ == "__main__":
    unittest.main()
