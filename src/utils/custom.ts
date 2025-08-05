import { v4 as uuidv4 } from "uuid";

import { Backend } from "./backend";
import logger from "./logger";

// Simplified CustomOption interface
export interface CustomOption {
  id: string;
  label: string;
  position: "before" | "after";
  value: string; // Complete parameter like "DXVK_HUD=1" or "--windowed"
}

// Smart migration function for different data formats
function migrateCustomOption(option: Record<string, unknown>): CustomOption {
  let newValue: string;
  let position: "before" | "after" = "before";

  // Legacy format: has field property
  if (option.field !== undefined) {
    if (option.field && option.value) {
      newValue = `${option.field}=${option.value}`;
    }
    else {
      newValue = (option.field as string) || (option.value as string) || "";
    }
  }
  else if (option.key !== undefined) {
    // Typed format: has key property
    position = (option.position as "before" | "after") || "before";

    if (option.key && option.value) {
      // Smart combination: use space for dash-prefixed keys, equals for others
      if ((option.key as string).startsWith("-")) {
        newValue = `${option.key} ${option.value}`;
      }
      else {
        newValue = `${option.key}=${option.value}`;
      }
    }
    else {
      newValue = (option.key as string) || "";
    }
  }
  else {
    // New format: use as-is
    newValue = (option.value as string) || "";
    position = (option.position as "before" | "after") || "before";
  }

  return {
    id: (option.id as string) || uuidv4(),
    label: (option.label as string) || "",
    position,
    value: newValue.trim(),
  };
}

export const getCustomOptions = async (): Promise<CustomOption[]> => {
  const savedOpt = await Backend.getSetting("CustomOptions", []) as Record<string, unknown>[];

  // Check if migration is needed
  const needsMigration = savedOpt.some(opt =>
    Object.prototype.hasOwnProperty.call(opt, "field") || Object.prototype.hasOwnProperty.call(opt, "key"),
  );

  // Migrate all data to new format
  const migratedOpts = savedOpt.map(option => migrateCustomOption(option));

  // Auto-save migrated data if needed
  if (needsMigration && migratedOpts.length > 0) {
    logger.info("Migrating custom options to simplified format");
    await setCustomOptions(migratedOpts);
  }

  logger.info(`Loaded ${migratedOpts.length} custom options`);
  return migratedOpts;
};

export const setCustomOptions = async (data: CustomOption[]): Promise<void> => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const optsWithoutId = data.map(({ id, ...rest }) => rest);
  await Backend.setSetting("CustomOptions", optsWithoutId);
  logger.info(`Saved user settings:\n${JSON.stringify(optsWithoutId, null, 2)}`);
};

export const getEmptyCustomOption = (): CustomOption => {
  return {
    id: uuidv4(),
    label: "",
    position: "before",
    value: "",
  };
};
