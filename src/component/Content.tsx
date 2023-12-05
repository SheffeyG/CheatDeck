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
import { VFC, useEffect, useState } from "react";

import logger from "../utils/logger";
import { SettingsManager } from "../utils/settings";
import { Backend } from "../utils/backend";

const Content: VFC<{ serverAPI: ServerAPI }> = ({ serverAPI }) => {

  Backend.initialize(serverAPI)
  var initPath = '/'
  SettingsManager.loadFromFile().then(
    (res) => { ({ initPath } = res) }
    )
  const [showPath, setShowPath] = useState(initPath);

  const handleBrowse = async () => {
    logger.info("Original showpath is: " + showPath);
    await Backend.openFilePicker("/home/deck/Games", ["exe"]).then(
      (res) => {
        logger.info("Selected path is: " + res.path);
        setShowPath(res.path)
        logger.info("Updated showpath is: " + showPath);
        SettingsManager.saveToFile({ cheatPath: res.path })
      }
    )
  };
  
  useEffect(() => {
    logger.info("Noticed showpath changes to: " + showPath);
  }, [showPath]);

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

