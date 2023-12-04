import {
  definePlugin,
  ServerAPI,
  staticClasses,
} from "decky-frontend-lib";
import { FaWrench } from "react-icons/fa";

import Content from "./component/Content";
import PageRouter from "./component/PageRouter";
import contextMenuPatch, { LibraryContextMenu } from './utils/patch';


export default definePlugin((serverApi: ServerAPI) => {

  serverApi.routerHook.addRoute("/cheat-settings/:appid", PageRouter, {
    exact: true,
  });

  const menuPatches = contextMenuPatch(LibraryContextMenu);

  return {
    title: <div className={staticClasses.Title}>CheatDeck</div>,
    content: <Content serverAPI={serverApi} />,
    icon: <FaWrench />,
    onDismount() {
      serverApi.routerHook.removeRoute("/cheat-settings/:appid");
      menuPatches?.unpatch();
    },
  };
});
