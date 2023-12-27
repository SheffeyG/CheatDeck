import {
  DialogBodyText,
  DialogButton,
  Field,
  Focusable,
  PanelSection,
  PanelSectionRow,
  ServerAPI,
} from "decky-frontend-lib";
import { VFC } from "react";
import { HiQrCode } from 'react-icons/hi2';
import { SiGithub } from 'react-icons/si';

import { showQrModal, navLink } from "../utils/utils";

const Content: VFC<{ serverAPI: ServerAPI }> = () => {
  return (
    <PanelSection title="informatin">
      <DialogBodyText>
        <p><b>CheatDeck is NOT for emulators.</b> Please do Not use it on emulator games to avoid damage!</p>
        <p>You can find the cheat settings in the game details menu.</p>
        <li>Please enable developer mode in the steam system settings.</li>
        <li>If you are unable to click on the selected cheat, please switch to windowed mode in the game settings.</li>
      </DialogBodyText>

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
        >
          <Focusable style={{ display: 'flex' }}>
            <div
              style={{
                display: 'flex',
                fontSize: '1.5em',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: '.5em',
              }}
            >
              <SiGithub />
            </div>
            <DialogButton
              onClick={() => navLink("https://github.com/SheffeyG/CheatDeck")}
              onSecondaryButton={() => showQrModal("https://github.com/SheffeyG/CheatDeck")}
              onSecondaryActionDescription='Show Link QR'
              style={{
                padding: '10px',
                fontSize: '14px',
              }}
            >
              Docs and Issue
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
