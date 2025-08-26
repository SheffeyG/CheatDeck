import {
  DialogBodyText,
  DialogButton,
  Field,
  Focusable,
  ModalRoot,
  Navigation,
  PanelSection,
  PanelSectionRow,
  showModal,
  ToggleField,
} from "@decky/ui";
import { QRCodeSVG } from "qrcode.react";
import { FC, useEffect, useState } from "react";
import { HiQrCode } from "react-icons/hi2";

import {
  getShowPreview as loadShowPreview,
  setShowPreview as saveShowPreview,
} from "../utils/backend";
import logger from "../utils/logger";
import t from "../utils/translate";

const Content: FC = () => {
  const translator = t("CREDIT", "");
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    loadShowPreview().then(setShowPreview).catch((error) => {
      logger.error("Failed to load preview setting", error);
    });
  }, []);

  useEffect(() => {
    saveShowPreview(showPreview).catch((error) => {
      logger.error("Failed to save preview setting", error);
    });
  }, [showPreview]);

  const navLink = (url: string) => {
    Navigation.CloseSideMenus();
    Navigation.NavigateToExternalWeb(url);
  };

  const showQrModal = (url: string) => {
    showModal(
      <ModalRoot>
        <QRCodeSVG
          style={{ margin: "0 auto 1.5em auto" }}
          value={url}
          includeMargin
          size={256}
        />
        <span style={{ textAlign: "center", wordBreak: "break-word" }}>{url}</span>
      </ModalRoot>,
      window,
    );
  };

  return (
    <Focusable style={{ display: "flex", flexDirection: "column" }}>
      <PanelSection title={t("CONTENT_SETTINGS", "settings")}>
        <PanelSectionRow>
          <ToggleField
            label={t("CONTENT_PREVIEW_LABEL", "Enable Preview")}
            description={t("CONTENT_PREVIEW_DESC", "Enable launch options preview")}
            bottomSeparator="thick"
            checked={showPreview}
            onChange={(enable: boolean) => setShowPreview(enable)}
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
            <p><b>{t("CONTENT_NOTE0", "CheatDeck only support the normal steam launcher for now.")}</b></p>
            <li>{t("CONTENT_NOTE1", "Please enable developer mode in the steam system settings.")}</li>
            <li>{t("CONTENT_NOTE2", "You can find the cheat settings in the game details menu.")}</li>
            <li>{t("CONTENT_NOTE3", "Use the steam key to switch between game and cheat windows.")}</li>
            <li>{t("CONTENT_NOTE4", "Turn the game to window mode if unable to click the cheat panel.")}</li>
          </DialogBodyText>
        </Focusable>

        {translator.length > 0 && (
          <DialogBodyText>
            <p>
              <b>{t("TRANSLATION", "Translator") + ": "}</b>
              {translator}
            </p>
          </DialogBodyText>
        )}

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
            // TODO: translate
            description={t(
              "CONTENT_GH_DESC",
              "For bug report, translation and more other informations, check the GitHub page.",
            )}
          >
            <Focusable style={{ display: "flex" }}>
              <DialogButton
                onClick={() => navLink("https://github.com/SheffeyG/CheatDeck")}
                onSecondaryButton={() => showQrModal("https://github.com/SheffeyG/CheatDeck")}
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
                onClick={() => showQrModal("https://github.com/SheffeyG/CheatDeck")}
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
      </PanelSection>
    </Focusable>
  );
};

export default Content;
