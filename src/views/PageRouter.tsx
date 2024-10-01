import { FC } from "react";
import { SidebarNavigation, useParams } from "@decky/ui";
import {
  BsFillDice2Fill as IconNormal,
  BsExclamationSquareFill as IconAdvanced,
  BsCSquareFill as IconCustom,
} from "react-icons/bs";

import Normal from "./Normal";
import Advanced from "./Advanced";
import Custom from "./Custom";

const PageRouter: FC = () => {
  let { appid } = useParams<{ appid: number }>();
  if (typeof appid === "string") {
    appid = parseInt(appid, 10);
  }
  const pages = [
    {
      title: "Normal",
      content: <Normal appid={appid} />,
      icon: <IconNormal />,
      hideTitle: false,
    },
    {
      title: "Advanced",
      content: <Advanced appid={appid} />,
      icon: <IconAdvanced />,
      hideTitle: false,
    },
    {
      title: "Custom",
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
