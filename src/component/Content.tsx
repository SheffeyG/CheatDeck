import {
  ButtonItem,
  DialogBody,
  Menu,
  MenuItem,
  PanelSection,
  PanelSectionRow,
  ServerAPI,
  showContextMenu
} from "decky-frontend-lib";
import { VFC, useState } from "react";

import openFilePicker from "../utils/filepicker"
import logger from "../utils/logger";
import { BackendCtx, SettingsManager } from "../utils/settings";

const Content: VFC<{ serverAPI: ServerAPI }> = ({ serverAPI }) => {

  var initPath = '/'
  BackendCtx.initialize(serverAPI)
  SettingsManager.loadFromFile().then(
    (res) => {({initPath} = res)}
  )
  const [showPath, setShowPath] = useState(initPath);

  // useEffect(() => {
  //   logger.info("Noticed showpath changes to: " + showPath);
  // }, [showPath]);

  const handleBrowse = async () => {
    logger.info("Original showpath is: " + showPath);
    const selectedPath = await openFilePicker('/home/deck/Games', true, undefined, {
      validFileExtensions: ['exe'],
    }, serverAPI);
    // let selectedPath = {path: "/home"}
    logger.info("Selected path is: " + selectedPath.path);
    setShowPath(selectedPath.path)
    logger.info("Updated showpath is: " + showPath);
    SettingsManager.saveToFile({ cheatPath: selectedPath.path })
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
          <p>path: {showPath}</p>
        </DialogBody>
        {/* <ShowPath path={showPath} /> */}

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


export default Content

