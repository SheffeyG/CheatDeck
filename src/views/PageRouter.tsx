import { SidebarNavigation, useParams } from "@decky/ui";
import type { FC } from "react";
import {
  BsExclamationSquareFill as IconAdvanced,
  BsPlusSquareFill as IconCustom,
  BsCheckSquareFill as IconNormal,
} from "react-icons/bs";

import { OptionsProvider, SettingsProvider } from "../hooks";
import { t } from "../utils/translate";
import Advanced from "./Advanced";
import Custom from "./Custom";
import Normal from "./Normal";

const PageRouter: FC = () => {
  let { appid } = useParams<{ appid: number }>();

  if (typeof appid === "string") {
    appid = parseInt(appid, 10);
  }

  return (
    <SettingsProvider>
      <OptionsProvider appid={appid}>
        <SidebarNavigation
          title="CheatDeck"
          showTitle={true}
          pages={[
            {
              title: t("NORMAL_TITLE"),
              content: <Normal />,
              icon: <IconNormal />,
              hideTitle: false,
            },
            {
              title: t("ADVANCED_TITLE"),
              content: <Advanced />,
              icon: <IconAdvanced />,
              hideTitle: false,
            },
            {
              title: t("CUSTOM_TITLE"),
              content: <Custom />,
              icon: <IconCustom />,
              hideTitle: false,
            },
          ]}
        />
      </OptionsProvider>
    </SettingsProvider>
  );
};

export default PageRouter;
