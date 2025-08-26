import { routerHook } from "@decky/api";
import { definePlugin, staticClasses } from "@decky/ui";
import { FaWrench as PluginIcon } from "react-icons/fa";

import contextMenuPatch, { LibraryContextMenu } from "./utils/patch";
import Content from "./views/Content";
import PageRouter from "./views/PageRouter";

export default definePlugin(() => {
  routerHook.addRoute("/cheatdeck/:appid", PageRouter, {
    exact: true,
  });

  const menuPatches = contextMenuPatch(LibraryContextMenu);

  return {
    title: <div className={staticClasses.Title}>CheatDeck</div>,
    content: <Content />,
    icon: <PluginIcon />,
    onDismount() {
      routerHook.removeRoute("/cheatdeck/:appid");
      menuPatches?.unpatch();
    },
  };
});
