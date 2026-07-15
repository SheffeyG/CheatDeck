import { v4 as uuid } from "uuid";

import type { OptionType } from "../domain/launchOptions";
import type { CustomOption, SettingsSnapshot } from "../domain/settings";
import { backendClient } from "./backendClient";

type StoredCustomOption = Omit<CustomOption, "id">;

const settingKeys = {
  customOptions: "CustomOptions",
  showPreview: "ShowPreview",
  skipWineCheck: "SkipWineCheck",
} as const;

const optionTypes: OptionType[] = ["env", "pre_cmd", "flag_args"];

const isStoredCustomOption = (value: unknown): value is StoredCustomOption => {
  if (!value || typeof value !== "object") return false;

  const option = value as Record<string, unknown>;
  return (
    typeof option.label === "string" &&
    typeof option.key === "string" &&
    optionTypes.includes(option.type as OptionType) &&
    (option.value === undefined || typeof option.value === "string")
  );
};

export const settingsStorage = {
  async load(): Promise<SettingsSnapshot> {
    const [storedShowPreview, storedSkipWineCheck, storedOptions] = await Promise.all([
      backendClient.getSetting<unknown>(settingKeys.showPreview, false),
      backendClient.getSetting<unknown>(settingKeys.skipWineCheck, false),
      backendClient.getSetting<unknown>(settingKeys.customOptions, []),
    ]);

    return {
      showPreview: typeof storedShowPreview === "boolean" ? storedShowPreview : false,
      skipWineCheck: typeof storedSkipWineCheck === "boolean" ? storedSkipWineCheck : false,
      customOptions: Array.isArray(storedOptions)
        ? storedOptions.filter(isStoredCustomOption).map((option) => ({ ...option, id: uuid() }))
        : [],
    };
  },

  saveShowPreview(value: boolean): Promise<void> {
    return backendClient.setSetting(settingKeys.showPreview, value);
  },

  saveSkipWineCheck(value: boolean): Promise<void> {
    return backendClient.setSetting(settingKeys.skipWineCheck, value);
  },

  saveCustomOptions(options: CustomOption[]): Promise<void> {
    const storedOptions = options.map(({ id: _id, ...option }) => option);
    return backendClient.setSetting(settingKeys.customOptions, storedOptions);
  },
};
