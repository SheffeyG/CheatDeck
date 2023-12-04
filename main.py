#!/usr/bin/env python
import logging, os
from settings import SettingsManager # type: ignore
import decky_plugin # type: ignore

# Setup environment variables
deckyHomeDir = decky_plugin.DECKY_HOME
settingsDir = decky_plugin.DECKY_PLUGIN_SETTINGS_DIR
loggingDir = decky_plugin.DECKY_PLUGIN_LOG_DIR
logger = decky_plugin.logger

# Setup backend logger
logger.setLevel(logging.DEBUG) # can be changed to logging.DEBUG for debugging issues
logger.info('[backend] Settings path: {}'.format(settingsDir))
settings = SettingsManager(name="settings", settings_directory=settingsDir)
settings.read()

class Plugin:
  async def plugin_info(self):
    # Call plugin_info only once preferably
    logger.debug('[backend] PluginInfo:\n\tPluginName: {}\n\tPluginVersion: {}\n\tDeckyVersion: {}'.format(
      decky_plugin.DECKY_PLUGIN_NAME,
      decky_plugin.DECKY_PLUGIN_VERSION,
      decky_plugin.DECKY_VERSION
    ))
    pluginInfo = {
      "name": decky_plugin.DECKY_PLUGIN_NAME,
      "version": decky_plugin.DECKY_PLUGIN_VERSION
    }
    return pluginInfo
  
  async def logger(self, logLevel:str, msg:str):
    msg = '[frontend] {}'.format(msg)
    match logLevel.lower():
      case 'info':      logger.info(msg)
      case 'debug':     logger.debug(msg)
      case 'warning':   logger.warning(msg)
      case 'error':     logger.error(msg)
      case 'critical':  logger.critical(msg)

  async def settings_read(self):
    logger.info('[backend] Reading settings')
    return settings.read()
  async def settings_commit(self):
    logger.info('[backend] Saving settings')
    return settings.commit()
  async def settings_getSetting(self, key: str, defaults):
    logger.info('[backend] Get {}'.format(key))
    return settings.getSetting(key, defaults)
  async def settings_setSetting(self, key: str, value):
    logger.info('[backend] Set {}: {}'.format(key, value))
    return settings.setSetting(key, value)
