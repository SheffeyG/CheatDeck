import {
  DialogBodyText,
  PanelSection,
  PanelSectionRow,
  ServerAPI
} from "decky-frontend-lib";
import { VFC } from "react";

const Content: VFC<{ serverAPI: ServerAPI }> = () => {
  return (
    <PanelSection title="informatin">
      <PanelSectionRow>
        <DialogBodyText>
          <p><b>CheatDeck is NOT for emulators</b>, please do Not use it on emulator games to avoid damage!</p>
          <p>You can find the cheat settings in the game details menu.</p>
          <li>Please enable developer mode in the steam system settings.</li>
          <li>If you are unable to click on the selected cheat, please switch to windowed mode in the game settings.</li>
        </DialogBodyText>
      </PanelSectionRow>
    </PanelSection>
  );
};


export default Content
