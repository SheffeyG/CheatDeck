import { routerHook } from "@decky/api";
import { definePlugin, staticClasses } from "@decky/ui";
import { FaWrench as PluginIcon } from "react-icons/fa";

import { SettingsProvider } from "./hooks";
import contextMenuPatch, { LibraryContextMenu } from "./patch";
import { logger } from "./utils/logger";
import Content from "./views/Content";
import PageRouter from "./views/PageRouter";

export default definePlugin(() => {
  let menuPatches: ReturnType<typeof contextMenuPatch> | undefined;
  try {
    menuPatches = contextMenuPatch(LibraryContextMenu);
  } catch (error) {
    // A Steam client update must never keep the plugin from loading; the
    // context menu entry is optional, the settings page and game route are not.
    logger.error("Failed to patch the library context menu", error);
  }

  routerHook.addRoute("/cheatdeck/:appid", PageRouter, { exact: true });

  return {
    title: <div className={staticClasses.Title}>CheatDeck</div>,
    content: (
      <SettingsProvider>
        <Content />
      </SettingsProvider>
    ),
    icon: <PluginIcon />,
    onDismount() {
      routerHook.removeRoute("/cheatdeck/:appid");
      menuPatches?.unpatch();
    },
  };
});
