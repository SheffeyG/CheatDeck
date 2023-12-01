import {
  ButtonItem,
  definePlugin,
  DialogButton,
  Menu,
  MenuItem,
  PanelSection,
  PanelSectionRow,
  Router,
  ServerAPI,
  showContextMenu,
  staticClasses,
} from "decky-frontend-lib";
import { VFC } from "react";
import { FaWrench } from "react-icons/fa";

import contextMenuPatch, { LibraryContextMenu } from './contextMenuPatch';

const Content: VFC<{ serverAPI: ServerAPI }> = ({ }) => {

  return (
    <PanelSection title="Setting">

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
          Version 1
        </ButtonItem>
      </PanelSectionRow>

    </PanelSection>
  );
};

const CheatSettingRouter: VFC = () => {
  return (
    <div style={{ margin: "50px", color: "white" }}>
      Hello World!
      <DialogButton onClick={() => Router.NavigateToLibraryTab()}>
        Go to Library
      </DialogButton>
    </div>
  );
};

export default definePlugin((serverApi: ServerAPI) => {
  serverApi.routerHook.addRoute("/cheat-settings", CheatSettingRouter, {
    exact: true,
  });

  const menuPatches = contextMenuPatch(LibraryContextMenu);

  return {
    title: <div className={staticClasses.Title}>CheatDeck</div>,
    content: <Content serverAPI={serverApi} />,
    icon: <FaWrench />,
    onDismount() {
      serverApi.routerHook.removeRoute("/cheat-settings");
      menuPatches?.unpatch();
    },
  };
});
