import { DialogBodyText,  } from 'decky-frontend-lib';

const Information = ({ appid }: { appid: number | string }) => {
  return (
    <DialogBodyText>
      <p>App ID: {appid}</p>
      <li>Please enable developer mode in the steam system settings.</li>
      <li>If you are unable to click on the selected cheat, please switch to windowed mode in the game settings.</li>
      <li>After entering the game, you can press the steam key and open settings to switch cheat and game interface.</li>
      <li>Use the language setting if your game or cheat language not correct (most on non-steam games).</li>
    </DialogBodyText>
  );
};

export default Information;
