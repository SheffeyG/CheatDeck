#!/usr/bin/env python

import logging
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
    async def get_env(cls, env: str):
        return getattr(decky, env)
