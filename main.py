#!/usr/bin/env python
import logging
from settings import SettingsManager  # type: ignore
import decky  # type: ignore

# Setup environment variables
deckyHomeDir = decky.DECKY_HOME
settingsDir = decky.DECKY_PLUGIN_SETTINGS_DIR
loggingDir = decky.DECKY_PLUGIN_LOG_DIR
logger = decky.logger

# Setup backend logger
logger.setLevel(logging.DEBUG)
logger.info('[backend] Settings path: {}'.format(settingsDir))
settings = SettingsManager(name="settings", settings_directory=settingsDir)
settings.read()


class Plugin:
    async def _main(self):
        logger.info("[backend] Loading CheatDeck!")

    async def _unload(self):
        logger.info("[backend] Unloading CheatDeck!")

    async def _uninstall(self):
        logger.info("[backend] Uninstalling CheatDeck!")

    @classmethod
    async def settings_read(cls):
        logger.info('[backend] Reading settings')
        return settings.read()

    @classmethod
    async def settings_commit(cls):
        logger.info('[backend] Saving settings')
        return settings.commit()

    @classmethod
    async def settings_getSetting(cls, key: str, defaults):
        logger.info('[backend] Get {}'.format(key))
        return settings.getSetting(key, defaults)

    @classmethod
    async def settings_setSetting(cls, key: str, value):
        logger.info('[backend] Set {}: {}'.format(key, value))
        return settings.setSetting(key, value)
