import {
  ButtonItem,
  DialogBody,
  // SteamClient
} from "decky-frontend-lib"
import { VFC } from "react"

interface AppId {
  appid: number;
}

const GameSettings: VFC<AppId> = ({ appid }) => {
  const setOptions = () => {
    let options = 'LANG=zh_CN.utf8 %command%';
    SteamClient.Apps.SetAppLaunchOptions(appid, options);
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