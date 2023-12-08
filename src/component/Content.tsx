import {
  DialogButton,
  Field,
  PanelSection,
  ServerAPI,
  TextField
} from "decky-frontend-lib";
import { VFC, useEffect, useState } from "react";

import logger from "../utils/logger";
import { SettingsManager } from "../utils/settings";
import { Backend } from "../utils/backend";
import { FaSatellite } from "react-icons/fa";

const Content: VFC<{ serverAPI: ServerAPI }> = () => {
  const [showPath, setShowPath] = useState('/');

  useEffect(() => {
    (async () => {
      const settings = await SettingsManager.loadFromFile();
      setShowPath(settings.cheatPath);
    })();
  }, []);

  const handleBrowse = async () => {
    logger.info("Original showpath is: " + showPath);
    const filePickerResult = await Backend.openFilePicker("/home/deck/Games", ["exe"]);

    logger.info("Selected path is: " + filePickerResult.path);
    setShowPath(filePickerResult.path);
    await SettingsManager.saveToFile({ cheatPath: filePickerResult.path });
  };

  useEffect(() => {
    logger.info("Noticed showpath changes to: " + showPath);
  }, [showPath]);

  return (
    <PanelSection title="global setting">

      <Field
        key={1}
        label={"Cheat"}
        icon={<FaSatellite />}
        bottomSeparator={"none"}
        padding={"none"}
      >
        <TextField
          style={{
            // fontSize: "14px",
            width: "160px"
          }}
          value={showPath.match(/\/([^\/]+)$/)?.[1]}
          disabled={true}
        />
      </Field>
      <DialogButton
        style={{ marginTop: "4px" }}
        onClick={handleBrowse}
      >
        Change Cheat Path
      </DialogButton>

      {/* <PanelSectionRow>
        <p>CHEAT: {showPath.match(/\/([^\/]+)$/)?.[1]}</p>
        <ButtonItem
          layout="below"
          onClick={handleBrowse}
        >
          Change
        </ButtonItem>

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
      </PanelSectionRow> */}

    </PanelSection>
  );
};


export default Content
