import {
  ButtonItem,
  DialogBody,
  // SteamClient
} from "decky-frontend-lib"
import { VFC } from "react"

import logger from "../utils/logger"


const GameSettings: VFC<{ appid: number }> = ({ appid }) => {
  if (typeof appid === 'string') { appid = parseInt(appid, 10) }
  const setOptions = () => {
    let options = ''
    let cheatPath = '/home/deck/Games/cheats/HollowKnightTrainer.exe'
    let [enableLang, enableCheat] = [true, true];
    if (enableLang) {
      options += 'LANG=zh_CN.utf8 '
    };
    if (enableCheat) {
      options += `PROTON_REMOTE_DEBUG_CMD="${cheatPath}" PRESSURE_VESSEL_FILESYSTEMS_RW="$STEAM_COMPAT_DATA_PATH/pfx/drive_c:${cheatPath.replace(/\/[^/]+$/, '')}" `;
    }
    if (enableLang || enableCheat) {
      options += `%command%`
    }
    logger.info("options is: " + options);
    // let options = 'LANG=zh_CN.utf8 %command%';
    SteamClient.Apps.SetAppLaunchOptions(appid, options);
    // SteamClient.Apps.SetAppHidden(appid, true);
    // SteamClient.Apps.ShowStore(appid);

    // SteamClient.User.StartRestart();
  }

  return (
    <DialogBody>
      <ButtonItem
        layout="below"
        onClick={setOptions}
      >
        SetOptions
      </ButtonItem>
    </DialogBody>
  )
}

export default GameSettings