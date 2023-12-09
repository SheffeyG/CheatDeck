import {
  definePlugin,
  ServerAPI,
  staticClasses,
} from "decky-frontend-lib";
import { FaWrench } from "react-icons/fa";

import Content from "./views/Content";
import PageRouter from "./views/PageRouter";
import contextMenuPatch, { LibraryContextMenu } from './utils/patch';
import { Backend } from "./utils/backend";


export default definePlugin((serverApi: ServerAPI) => {
  
  Backend.initialize(serverApi);

  serverApi.routerHook.addRoute("/cheatdeck/:appid", PageRouter, {
    exact: true,
  });

  const menuPatches = contextMenuPatch(LibraryContextMenu);

  return {
    title: <div className={staticClasses.Title}>CheatDeck</div>,
    content: <Content serverAPI={serverApi} />,
    icon: <FaWrench />,
    onDismount() {
      serverApi.routerHook.removeRoute("/cheatdeck/:appid");
      menuPatches?.unpatch();
    },
  };
});
