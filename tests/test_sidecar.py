"""Tests for the sidecar process helpers in main.py (issue #46).

The Decky runtime (`decky`, `settings`) is not available outside the plugin
sandbox, so both modules are stubbed before importing the plugin entry point.
"""

import os
import sys
import tempfile
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


def _write_process(proc_root: str, pid: int, argv: list[str]) -> None:
    directory = os.path.join(proc_root, str(pid))
    os.makedirs(directory, exist_ok=True)
    with open(os.path.join(directory, "cmdline"), "wb") as handle:
        handle.write(b"\0".join(argument.encode() for argument in argv) + b"\0")


class FindSidecarPidsTest(unittest.TestCase):
    def setUp(self) -> None:
        self.proc_root = tempfile.mkdtemp()
        self.trainer = "/home/deck/Trainers/My Game Trainer.exe"
        self.other = "/home/deck/Trainers/Other Trainer.exe"

    def test_matches_exact_wine_invocation(self) -> None:
        _write_process(self.proc_root, 4242, ["/usr/bin/wine", self.trainer])
        self.assertEqual(main.find_sidecar_pids(self.trainer, self.proc_root), [4242])

    def test_ignores_similar_names(self) -> None:
        _write_process(self.proc_root, 4242, ["/usr/bin/wine", self.other])
        _write_process(self.proc_root, 4243, ["/usr/bin/wine", f"{self.trainer}.bak"])
        self.assertEqual(main.find_sidecar_pids(self.trainer, self.proc_root), [])

    def test_normalizes_dot_segments(self) -> None:
        _write_process(self.proc_root, 4242, ["/usr/bin/wine", "/home/deck/Trainers/./My Game Trainer.exe"])
        self.assertEqual(main.find_sidecar_pids(self.trainer, self.proc_root), [4242])

    def test_ignores_windows_path_argument(self) -> None:
        _write_process(self.proc_root, 4242, ["/usr/bin/wine", "Z:\\home\\deck\\Trainers\\My Game Trainer.exe"])
        self.assertEqual(main.find_sidecar_pids(self.trainer, self.proc_root), [])

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


if __name__ == "__main__":
    unittest.main()
