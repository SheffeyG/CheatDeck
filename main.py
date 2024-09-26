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
logger.setLevel(logging.DEBUG)  # can be changed to logging.DEBUG for debugging issues
logger.info('[backend] Settings path: {}'.format(settingsDir))
settings = SettingsManager(name="settings", settings_directory=settingsDir)
settings.read()


class Plugin:
    @classmethod
    async def plugin_info(cls):
        # Call plugin_info only once preferably
        logger.debug('[backend] PluginInfo:\n\tPluginName: {}\n\tPluginVersion: {}\n\tDeckyVersion: {}'.format(
            decky.DECKY_PLUGIN_NAME,
            decky.DECKY_PLUGIN_VERSION,
            decky.DECKY_VERSION,
        ))
        pluginInfo = {
            "name": decky.DECKY_PLUGIN_NAME,
            "version": decky.DECKY_PLUGIN_VERSION
        }
        return pluginInfo

    @classmethod
    async def logger(cls, logLevel: str, msg: str):
        msg = '[frontend] {}'.format(msg)
        match logLevel.lower():
            case 'info':      logger.info(msg)
            case 'debug':     logger.debug(msg)
            case 'warning':   logger.warning(msg)
            case 'error':     logger.error(msg)
            case 'critical':  logger.critical(msg)

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
