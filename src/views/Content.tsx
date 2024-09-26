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
} from "@decky/ui";
import { HiQrCode } from 'react-icons/hi2';
import { QRCodeSVG } from "qrcode.react";


const Content = () => {

  const navLink = (url: string) => {
    Navigation.CloseSideMenus();
    Navigation.NavigateToExternalWeb(url);
  };
  
  const showQrModal = (url: string) => {
    showModal(
      <ModalRoot>
        <QRCodeSVG
          style={{ margin: '0 auto 1.5em auto' }}
          value={url}
          includeMargin
          size={256}
        />
        <span style={{ textAlign: 'center', wordBreak: 'break-word' }}>{url}</span>
      </ModalRoot>,
      window
    );
  };

  return (
    <PanelSection title="informatin">
      <Focusable
        focusWithinClassName="gpfocuswithin"
        onActivate={() => {}}
        style={{
          width: "100%",
          margin: 0,
          padding: 0,
        }}
      >
        <DialogBodyText>
          <p><b>CheatDeck only support the normal steam launcher for now.</b></p>
          <li>Please enable developer mode in the steam system settings.</li>
          <li>You can find the cheat settings in the game details menu.</li>
          <li>Use the steam key to switch between game and cheat windows.</li>
          <li>If you are unable to click the selected cheat panel, please turn the game to window mode.</li>
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
          description="For more information, check the GitHub page."
        >
          <Focusable style={{ display: 'flex' }}>
            <DialogButton
              onClick={() => navLink("https://github.com/SheffeyG/CheatDeck")}
              onSecondaryButton={() => showQrModal("https://github.com/SheffeyG/CheatDeck")}
              onSecondaryActionDescription='Show Link QR'
              style={{
                padding: '10px',
                fontSize: '14px',
              }}
            >
              GitHub
            </DialogButton>
            <DialogButton
              onOKActionDescription='Show Link QR'
              onClick={() => showQrModal("https://github.com/SheffeyG/CheatDeck")}
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '10px',
                maxWidth: '40px',
                minWidth: 'auto',
                marginLeft: '.5em',
              }}
            >
              <HiQrCode />
            </DialogButton>
          </Focusable>
        </Field>
      </PanelSectionRow>
    </PanelSection>
  );
};


export default Content
