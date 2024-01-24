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
          <p><b>CheatDeck is NOT for emulators.</b></p>
          <p>CheatDeck only support the normal game launcher for now.</p>
          <li>You can find the cheat settings in the game details menu.</li>
          <li>Please enable developer mode in the steam system settings.</li>
          <li>If you are unable to click the selected cheat panel, please turn the game to window mode.</li>
          <p>For more information, check the GitHub page blow. If you wanna add more launch options for CheatDeck, feel free to open an issue or pr, or just star the project to support it.</p>
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
