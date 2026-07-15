import type { LaunchOption } from "./launchOptions";

export interface CustomOption extends LaunchOption {
  id: string;
  label: string;
}

export interface SettingsSnapshot {
  showPreview: boolean;
  skipWineCheck: boolean;
  customOptions: CustomOption[];
}
