import {
  ButtonItem,
  definePlugin,
  Menu,
  MenuItem,
  PanelSection,
  PanelSectionRow,
  ServerAPI,
  showContextMenu,
  staticClasses,
  FilePickerRes,
  DialogBody,
} from "decky-frontend-lib";
import { VFC, useState } from "react";
import { FaWrench } from "react-icons/fa";

import logger from "./utils";
import contextMenuPatch, { LibraryContextMenu } from './contextMenuPatch';
import PageRouter from "./component/PageRouter";
import openFilePicker from "./openFilePicker";

const Content: VFC<{ serverAPI: ServerAPI }> = ({ serverAPI }) => {

  const [filepath, setFilepath] = useState<FilePickerRes>({
    path: 'initialPath',
    realpath: 'initialRealpath',
  });

  const handleBrowse = async () => {
    const selectedPath = await openFilePicker('/home/deck/Games', true, undefined, {
      validFileExtensions: ['exe'],
    }, serverAPI);
    logger.info("Now selectedPath is: " + selectedPath.path); 
    setFilepath(prevState => ({
      ...prevState,
      path: selectedPath.path,
      realpath: selectedPath.realpath
    }));
  };

  return (
    <PanelSection title="setting">

      <PanelSectionRow>
        <ButtonItem
        layout="below"
        onClick={handleBrowse}
        >
          Select
        </ButtonItem>
        <DialogBody>
          <p>Path: {filepath.path}</p>
        </DialogBody>

      </PanelSectionRow>

      <PanelSectionRow>
        <ButtonItem
          layout="below"
          onClick={(e: { currentTarget: any; }) =>
            showContextMenu(
              <Menu label="Menu" cancelText="CAAAANCEL" onCancel={() => { }}>
                <MenuItem onSelected={() => { }}>Item #1</MenuItem>
                <MenuItem onSelected={() => { }}>Item #2</MenuItem>
                <MenuItem onSelected={() => { }}>Item #3</MenuItem>
              </Menu>,
              e.currentTarget ?? window
            )
          }
        >
          Menu
        </ButtonItem>
      </PanelSectionRow>

    </PanelSection>
  );
};

export default definePlugin((serverApi: ServerAPI) => {

  logger.info("Plugin cheatdeck loaded");

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
