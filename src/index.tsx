import {
  definePlugin,
  staticClasses,
} from "@decky/ui";
import {
  routerHook,
} from "@decky/api";
import { FaWrench } from "react-icons/fa";

import Content from "./views/Content";
import PageRouter from "./views/PageRouter";
import contextMenuPatch, { LibraryContextMenu } from './utils/Patch';


export default definePlugin(() => {
  routerHook.addRoute("/cheatdeck/:appid", PageRouter, {
    exact: true,
  });

  const menuPatches = contextMenuPatch(LibraryContextMenu);

  return {
    title: <div className={staticClasses.Title}>CheatDeck</div>,
    content: <Content />,
    icon: <FaWrench />,
    onDismount() {
      routerHook.removeRoute("/cheatdeck/:appid");
      menuPatches?.unpatch();
    },
  };
});
