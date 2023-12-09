import {
  DialogButton,
  DropdownItem,
  Field,
  PanelSection,
  PanelSectionRow,
  ServerAPI,
  TextField
} from "decky-frontend-lib";
import { VFC, useEffect, useState } from "react";

import logger from "../utils/logger";
import { SettingsManager, SettingsProps, defaultSettings } from "../utils/settings";
import { Backend } from "../utils/backend";
import { FaFolder, FaLanguage, FaSatellite } from "react-icons/fa";

const Content: VFC<{ serverAPI: ServerAPI }> = () => {
  const [settings, setSettings] = useState<SettingsProps>(defaultSettings)

  useEffect(() => {
    (async () => {
      const savedSettings = await SettingsManager.loadFromFile();
      setSettings(savedSettings);
    })();
  }, []);

  useEffect(() => {
    logger.info("Noticed settings changes to: " + JSON.stringify(settings));
  }, [settings]);

  const handleBrowse = async () => {
    const filePickerResult = await Backend.openFilePicker("/home/deck/Games", ["exe"]);
    const currentSettings = { ...settings };
    currentSettings.defaultCheatPath = filePickerResult.path;
    logger.info("Noticed settings changes to: " + JSON.stringify(settings));
    setSettings(currentSettings);
    await SettingsManager.saveToFile(currentSettings);
  };


  return (
    <PanelSection title="global settings">

      <PanelSectionRow>
        <Field
          label={"Default Cheat Path"}
          icon={<FaSatellite />}
          bottomSeparator={"none"}
        />
        <div style={{
          display: "flex",
          justifyContent: "right",
          // justifyContent: "space-between",
          gap: "8px",
          marginBottom: "4px"
        }}>
          <TextField
            style={{ width: "180px" }}
            disabled={true}
            value={settings.defaultCheatPath.match(/\/([^\/]+)$/)?.[1]}
          />
          <DialogButton
            onClick={handleBrowse}
            style={{ minWidth: 0, width: "15%", padding: 0 }}
          >
            <FaFolder />
          </DialogButton>
        </div>
      </PanelSectionRow>

      <PanelSectionRow>
        {/* <Field
          label={"Language"}
          icon={<FaLanguage />}
          bottomSeparator={"none"}
        /> */}

        <DropdownItem
          label={<><FaLanguage />Default Language Code</>}
          // icon={<FaLanguage />}
          // description="Number of times to repeat notification"
          rgOptions={settings.langCodeSet}
          selectedOption={settings.defaultLangCode}
          onChange={async (value) => {
            logger.info(`sele code: ${JSON.stringify(settings)}`);
            const currentSettings = { ...settings };
            currentSettings.defaultLangCode = value;
            setSettings(currentSettings);
            await SettingsManager.saveToFile(currentSettings);
          }}
          bottomSeparator="standard"
          renderButtonValue={() => settings.defaultLangCode.label}
          // strDefaultLabel="Empty"
        />
      </PanelSectionRow>

    </PanelSection>
  );
};


export default Content
