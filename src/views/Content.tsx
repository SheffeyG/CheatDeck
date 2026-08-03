import { DialogButton, Field, Navigation, PanelSection, PanelSectionRow, showModal, ToggleField } from "@decky/ui";
import type { FC } from "react";
import { FaGithub } from "react-icons/fa";

import { useSettings } from "../hooks";
import { QrCode } from "../modals";
import { t } from "../utils/translate";

const GITHUB = "https://github.com/SheffeyG/CheatDeck";

const Content: FC = () => {
  const translator = t("CREDIT");
  const { showPreview, skipWineCheck, saveShowPreview, saveSkipWineCheck } = useSettings();

  const navLink = (url: string) => {
    Navigation.CloseSideMenus();
    Navigation.NavigateToExternalWeb(url);
  };

  return (
    <>
      <PanelSection title={t("CONTENT_SETTINGS")}>
        <PanelSectionRow>
          <ToggleField
            label={t("CONTENT_PREVIEW_LABEL")}
            description={t("CONTENT_PREVIEW_DESC")}
            bottomSeparator="standard"
            checked={showPreview}
            onChange={(enable: boolean) => saveShowPreview(enable)}
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <ToggleField
            label={t("CONTENT_CHECK_WINE_LABEL")}
            description={t("CONTENT_CHECK_WINE_DESC")}
            bottomSeparator="standard"
            checked={skipWineCheck}
            onChange={(enable: boolean) => saveSkipWineCheck(enable)}
          />
        </PanelSectionRow>
      </PanelSection>

      <PanelSection title={t("CONTENT_INFORMATION")}>
        <PanelSectionRow>
          <Field description={t("CONTENT_GH_DESC")} padding="standard" bottomSeparator="none" childrenLayout="below">
            <DialogButton
              onClick={() => navLink(GITHUB)}
              onSecondaryButton={() => showModal(<QrCode url={GITHUB} />, window)}
              onSecondaryActionDescription={t("CONTENT_QR_DESC")}
            >
              <FaGithub /> GitHub
            </DialogButton>
          </Field>
        </PanelSectionRow>

        {translator.length > 0 && (
          <PanelSectionRow>
            <Field label={t("TRANSLATION")} description={translator} padding="standard" bottomSeparator="none" />
          </PanelSectionRow>
        )}
      </PanelSection>
    </>
  );
};

export default Content;
