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
    async def _migration(cls):
        logger.info("[backend] Starting data migration")
        
        try:
            custom_options = settings.getSetting("CustomOptions", [])
            
            # Check if migration is needed
            if not custom_options or not isinstance(custom_options, list):
                logger.info("[backend] No CustomOptions found, migration not needed")
                return
                
            needs_migration = any(
                isinstance(opt, dict) and (opt.get("field") is not None or opt.get("key") is not None)
                for opt in custom_options
            )
            
            if not needs_migration:
                logger.info("[backend] CustomOptions already in current format")
                return
                
            logger.info("[backend] Migrating CustomOptions to current format")
            migrated_options = []
            
            for option in custom_options:
                if not isinstance(option, dict):
                    continue
                    
                migrated = cls._migrate_option(option)
                if migrated:
                    migrated_options.append(migrated)
            
            settings.setSetting("CustomOptions", migrated_options)
            logger.info(f"[backend] Successfully migrated {len(migrated_options)} options")
                        
        except Exception as e:
            logger.error(f"[backend] Migration failed: {e}", exc_info=True)
    
    @classmethod
    def _migrate_option(cls, option: dict) -> dict:
        """Migrate a single option using simple field-based detection"""
        try:
            migrated = {
                "label": option.get("label", ""),
                "position": option.get("position", "before"),
                "value": ""
            }
            
            # Simple field-based detection
            if option.get("field") is not None:
                # Old format: field + value
                field = option.get("field", "")
                value = option.get("value", "")
                migrated["value"] = f"{field}={value}" if field and value else field or value
                
            elif option.get("key") is not None:
                # Intermediate format: key + value with smart combination
                key = option.get("key", "")
                value = option.get("value", "")
                
                if key and value:
                    # Smart combination: space for dash-prefixed, equals for others
                    migrated["value"] = f"{key} {value}" if key.startswith("-") else f"{key}={value}"
                else:
                    migrated["value"] = key
            else:
                # Already new format or unknown
                migrated["value"] = option.get("value", "")
            
            return migrated
            
        except Exception as e:
            logger.error(f"[backend] Failed to migrate option {option}: {e}")
            return None

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
