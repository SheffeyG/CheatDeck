import { ButtonItem, Field, Navigation, PanelSection, PanelSectionRow, showModal, ToggleField } from "@decky/ui";
import type { FC } from "react";
import { FaGithub } from "react-icons/fa";
import { HiQrCode } from "react-icons/hi2";

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
            bottomSeparator="none"
            checked={skipWineCheck}
            onChange={(enable: boolean) => saveSkipWineCheck(enable)}
          />
        </PanelSectionRow>
      </PanelSection>

      <PanelSection title={t("CONTENT_INFORMATION")}>
        <PanelSectionRow>
          <Field description={t("CONTENT_NOTE0")} padding="standard" bottomSeparator="standard" />
        </PanelSectionRow>
        <PanelSectionRow>
          <Field description={t("CONTENT_NOTE1")} padding="standard" bottomSeparator="standard" />
        </PanelSectionRow>
        <PanelSectionRow>
          <Field description={t("CONTENT_NOTE2")} padding="standard" bottomSeparator="standard" />
        </PanelSectionRow>
        <PanelSectionRow>
          <ButtonItem
            label="GitHub"
            description={t("CONTENT_GH_DESC")}
            bottomSeparator="standard"
            onClick={() => navLink(GITHUB)}
          >
            <FaGithub />
          </ButtonItem>
        </PanelSectionRow>
        <PanelSectionRow>
          <ButtonItem
            label={t("CONTENT_QR_DESC")}
            bottomSeparator={translator.length > 0 ? "standard" : "none"}
            onClick={() => showModal(<QrCode url={GITHUB} />, window)}
          >
            <HiQrCode />
          </ButtonItem>
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
