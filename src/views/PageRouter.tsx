import { SidebarNavigation, useParams } from "@decky/ui";
import { FC } from "react";
import {
  BsCheckSquareFill as IconNormal,
  BsExclamationSquareFill as IconAdvanced,
  BsPlusSquareFill as IconCustom,
} from "react-icons/bs";

import { OptionsProvider, SettingsProvider } from "../hooks";
import { t } from "../utils";
import Advanced from "./Advanced";
import Custom from "./Custom";
import Normal from "./Normal";

const PageRouter: FC = () => {
  let { appid } = useParams<{ appid: number }>();
  if (typeof appid === "string") {
    appid = parseInt(appid, 10);
  }
  const pages = [
    {
      title: t("NORMAL_TITLE", "Normal"),
      content: <Normal appid={appid} />,
      icon: <IconNormal />,
      hideTitle: false,
    },
    {
      title: t("ADVANCED_TITLE", "Advanced"),
      content: <Advanced appid={appid} />,
      icon: <IconAdvanced />,
      hideTitle: false,
    },
    {
      title: t("CUSTOM_TITLE", "Custom"),
      content: <Custom appid={appid} />,
      icon: <IconCustom />,
      hideTitle: false,
    },
  ];

  return (
    <SettingsProvider>
      <OptionsProvider appid={appid}>
        <SidebarNavigation pages={pages} />
      </OptionsProvider>
    </SettingsProvider>
  );
};

export default PageRouter;
