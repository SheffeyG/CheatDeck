import { SidebarNavigation, useParams } from "@decky/ui";
import { FC } from "react";
import {
  BsCSquareFill as IconCustom,
  BsExclamationSquareFill as IconAdvanced,
  BsFillDice2Fill as IconNormal,
} from "react-icons/bs";

import t from "../utils/translate";
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
    <SidebarNavigation pages={pages} />
  );
};

export default PageRouter;
