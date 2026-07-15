import type { AppDetails } from "@decky/ui/dist/globals/steam-client/App";

export const registerForAppDetails = (appid: number, onDetails: (details: AppDetails) => void) =>
  SteamClient.Apps.RegisterForAppDetails(appid, onDetails);

export const setAppLaunchOptions = (appid: number, options: string): void => {
  SteamClient.Apps.SetAppLaunchOptions(appid, options);
};
