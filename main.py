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
    async def _migration(cls):
        logger.info("[backend] Starting data migration")

        try:
            # Use getSetting instead of read() to safely get CustomOptions
            custom_options = settings.getSetting("CustomOptions", [])

            # Check if custom_options is a valid list with content
            if not custom_options or not isinstance(custom_options, list):
                logger.info("[backend] No CustomOptions found, stop migration.")
                return False

            # Check if first_option is a valid dict and missing "type" field
            first_option = custom_options[0]
            if isinstance(first_option, dict) and "type" in first_option:
                logger.info("[backend] CustomOptions already in new format.")
                return False

            logger.info("[backend] Migrating CustomOptions from legacy format")

            migrated_options = []
            for option in custom_options:
                # Skip None or invalid options
                if option is None or not isinstance(option, dict):
                    logger.warning(f"[backend] Skipping invalid option: {option}")
                    continue

                migrated_option = {
                    "label": option.get("label", ""),
                    "type": "env",
                    "key": option.get("field", ""),
                    "value": option.get("value", ""),
                }
                migrated_options.append(migrated_option)

            settings.setSetting("CustomOptions", migrated_options)
            logger.info("[backend] Data migration completed")

            return True

        except Exception as e:
            logger.error(f"[backend] Migration failed: {e}", exc_info=True)
            return False

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
