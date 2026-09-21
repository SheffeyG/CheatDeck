import { routerHook } from "@decky/api";
import { definePlugin, staticClasses } from "@decky/ui";
import { FaWrench as PluginIcon } from "react-icons/fa";

import { SettingsProvider } from "./hooks";
import contextMenuPatch, { getLibraryContextMenu } from "./patch";
import Content from "./views/Content";
import PageRouter from "./views/PageRouter";

export default definePlugin(() => {
  let menuPatches: { unpatch: () => void } | null = null;
  try {
    const menuComponent = getLibraryContextMenu();
    if (menuComponent) {
      menuPatches = contextMenuPatch(menuComponent);
    }
  } catch (error) {
    console.error("[CheatDeck] Failed to initialize contextMenuPatch:", error);
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
