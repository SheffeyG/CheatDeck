import { routerHook } from "@decky/api";
import { definePlugin, staticClasses } from "@decky/ui";
import { FaWrench as PluginIcon } from "react-icons/fa";

import { SettingsProvider } from "./hooks";
import contextMenuPatch, { LibraryContextMenu } from "./patch";
import Content from "./views/Content";
import PageRouter from "./views/PageRouter";

export default definePlugin(() => {
  const menuPatches = contextMenuPatch(LibraryContextMenu);

  routerHook.addRoute(
    "/cheatdeck/:appid",
    PageRouter,
    { exact: true },
  );

  return {
    title: <div className={staticClasses.Title}>CheatDeck</div>,
    content: <SettingsProvider><Content /></SettingsProvider>,
    icon: <PluginIcon />,
    onDismount() {
      routerHook.removeRoute("/cheatdeck/:appid");
      menuPatches?.unpatch();
    },
  };
});
