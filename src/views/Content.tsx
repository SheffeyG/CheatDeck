import {
  DialogBodyText,
  DialogButton,
  Field,
  Focusable,
  Navigation,
  PanelSection,
  PanelSectionRow,
  showModal,
  ToggleField,
} from "@decky/ui";
import { FC } from "react";
import { HiQrCode } from "react-icons/hi2";

import { useSettings } from "../hooks";
import { QrCode } from "../modals";
import { t } from "../utils";

const GITHUB = "https://github.com/SheffeyG/CheatDeck";

const Content: FC = () => {
  const translator = t("CREDIT", "");
  const { showPreview, skipWineCheck, saveShowPreview, saveSkipWineCheck } = useSettings();

  const navLink = (url: string) => {
    Navigation.CloseSideMenus();
    Navigation.NavigateToExternalWeb(url);
  };

  return (
    <Focusable style={{ display: "flex", flexDirection: "column" }}>
      <PanelSection title={t("CONTENT_SETTINGS", "settings")}>
        <PanelSectionRow>
          <ToggleField
            label={t("CONTENT_PREVIEW_LABEL", "Enable Preview")}
            description={t("CONTENT_PREVIEW_DESC", "Enable launch options preview")}
            bottomSeparator="standard"
            checked={showPreview}
            onChange={(enable: boolean) => saveShowPreview(enable)}
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <ToggleField
            label={t("CONTENT_CHECK_WINE_LABEL", "Skip launcher check")}
            description={t("CONTENT_CHECK_WINE_DESC", "Try to apply for all launchers")}
            bottomSeparator="standard"
            checked={skipWineCheck}
            onChange={(enable: boolean) => saveSkipWineCheck(enable)}
          />
        </PanelSectionRow>
      </PanelSection>

      <PanelSection title={t("CONTENT_INFORMATION", "information")}>
        <Focusable
          focusWithinClassName="gpfocuswithin"
          onActivate={() => { }}
          style={{
            width: "100%",
            margin: 0,
            padding: 0,
          }}
        >
          <DialogBodyText>
            <li>{t("CONTENT_NOTE0", "CheatDeck only support the official steam launcher for now.")}</li>
            <li>{t("CONTENT_NOTE1", "CheatDeck game settings are accessible through the game details menu.")}</li>
            <li>{t("CONTENT_NOTE2", "Check the GitHub page for more informations and bug reports.")}</li>
          </DialogBodyText>
        </Focusable>

        <PanelSectionRow>
          <Field
            bottomSeparator="none"
            icon={null}
            label={null}
            childrenLayout={undefined}
            inlineWrap="keep-inline"
            padding="none"
            spacingBetweenLabelAndChild="none"
            childrenContainerWidth="max"
            description={t("CONTENT_GH_DESC", "Star this project on GitHub")}
          >
            <Focusable style={{ display: "flex" }}>
              <DialogButton
                onClick={() => navLink(GITHUB)}
                onSecondaryButton={() => showModal(<QrCode url={GITHUB} />, window)}
                onSecondaryActionDescription={t("CONTENT_QR_DESC", "Show Link QR")}
                style={{
                  padding: "10px",
                  fontSize: "14px",
                }}
              >
                GitHub
              </DialogButton>
              <DialogButton
                onOKActionDescription={t("CONTENT_QR_DESC", "Show Link QR")}
                onClick={() => showModal(<QrCode url={GITHUB} />, window)}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: "10px",
                  maxWidth: "40px",
                  minWidth: "auto",
                  marginLeft: ".5em",
                }}
              >
                <HiQrCode />
              </DialogButton>
            </Focusable>
          </Field>
        </PanelSectionRow>

        {translator.length > 0 && (
          <DialogBodyText>
            <p>
              <b>{t("TRANSLATION", "Translator") + ": "}</b>
              {translator}
            </p>
          </DialogBodyText>
        )}
      </PanelSection>
    </Focusable>
  );
};

export default Content;
