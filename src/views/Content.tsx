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
import type { CSSProperties, FC } from "react";
import { HiQrCode } from "react-icons/hi2";

import { useSettings } from "../hooks";
import { QrCode } from "../modals";
import { t } from "../utils/translate";

const GITHUB = "https://github.com/SheffeyG/CheatDeck";

const contentStyle = {
  display: "flex",
  flexDirection: "column",
} satisfies CSSProperties;

const informationStyle = {
  margin: 0,
  padding: 0,
  width: "100%",
} satisfies CSSProperties;

const linksStyle = {
  display: "flex",
} satisfies CSSProperties;

const githubButtonStyle = {
  fontSize: "14px",
  padding: "10px",
} satisfies CSSProperties;

const qrButtonStyle = {
  alignItems: "center",
  display: "flex",
  justifyContent: "center",
  marginLeft: ".5em",
  maxWidth: "40px",
  minWidth: "auto",
  padding: "10px",
} satisfies CSSProperties;

const Content: FC = () => {
  const translator = t("CREDIT", "");
  const { showPreview, skipWineCheck, saveShowPreview, saveSkipWineCheck } = useSettings();

  const navLink = (url: string) => {
    Navigation.CloseSideMenus();
    Navigation.NavigateToExternalWeb(url);
  };

  return (
    <Focusable style={contentStyle}>
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
        <Focusable focusWithinClassName="gpfocuswithin" onActivate={() => {}} style={informationStyle}>
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
            <Focusable style={linksStyle}>
              <DialogButton
                onClick={() => navLink(GITHUB)}
                onSecondaryButton={() => showModal(<QrCode url={GITHUB} />, window)}
                onSecondaryActionDescription={t("CONTENT_QR_DESC", "Show Link QR")}
                style={githubButtonStyle}
              >
                GitHub
              </DialogButton>
              <DialogButton
                onOKActionDescription={t("CONTENT_QR_DESC", "Show Link QR")}
                onClick={() => showModal(<QrCode url={GITHUB} />, window)}
                style={qrButtonStyle}
              >
                <HiQrCode />
              </DialogButton>
            </Focusable>
          </Field>
        </PanelSectionRow>

        {translator.length > 0 && (
          <DialogBodyText>
            <p>
              <b>{`${t("TRANSLATION", "Translator")}: `}</b>
              {translator}
            </p>
          </DialogBodyText>
        )}
      </PanelSection>
    </Focusable>
  );
};

export default Content;
