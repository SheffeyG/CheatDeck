#!/usr/bin/env python
import logging
import typing
from settings import SettingsManager  # type: ignore
import decky  # type: ignore

# Setup environment variables
settingsDir = decky.DECKY_PLUGIN_SETTINGS_DIR
loggingDir = decky.DECKY_PLUGIN_LOG_DIR
logger = decky.logger

# Setup backend logger
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
    async def settings_read(cls):
        logger.info("[backend] Reading settings")
        return settings.read()

    @classmethod
    async def settings_commit(cls):
        logger.info("[backend] Saving settings")
        return settings.commit()

    @classmethod
    async def settings_getSetting(cls, data: GetSettingOptions):
        logger.info("[backend] Get {}".format(data["key"]))
        return settings.getSetting(data["key"], data["defaults"])

    @classmethod
    async def settings_setSetting(cls, data: SetSettingOptions):
        logger.info("[backend] Set {}: {}".format(data["key"], data["value"]))
        return settings.setSetting(data["key"], data["value"])

    @classmethod
    async def get_env(cls, env: str):
        return getattr(decky, env)
