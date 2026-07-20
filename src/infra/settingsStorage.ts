import { type CustomOption, decodeStoredCustomOptions, type SettingsSnapshot } from "../domain/settings";
import { deckyBackend } from "./decky";

const settingKeys = {
  customOptions: "CustomOptionsV6",
  showPreview: "ShowPreview",
  skipWineCheck: "SkipWineCheck",
} as const;

export const settingsStorage = {
  async load(): Promise<SettingsSnapshot> {
    const [storedShowPreview, storedSkipWineCheck, storedOptions] = await Promise.all([
      deckyBackend.getSetting<unknown>(settingKeys.showPreview, false),
      deckyBackend.getSetting<unknown>(settingKeys.skipWineCheck, false),
      deckyBackend.getSetting<unknown>(settingKeys.customOptions, []),
    ]);

    return {
      showPreview: typeof storedShowPreview === "boolean" ? storedShowPreview : false,
      skipWineCheck: typeof storedSkipWineCheck === "boolean" ? storedSkipWineCheck : false,
      customOptions: decodeStoredCustomOptions(storedOptions),
    };
  },

  saveShowPreview(value: boolean): Promise<void> {
    return deckyBackend.setSetting(settingKeys.showPreview, value);
  },

  saveSkipWineCheck(value: boolean): Promise<void> {
    return deckyBackend.setSetting(settingKeys.skipWineCheck, value);
  },

  saveCustomOptions(options: CustomOption[]): Promise<void> {
    return deckyBackend.setSetting(settingKeys.customOptions, options);
  },
};
