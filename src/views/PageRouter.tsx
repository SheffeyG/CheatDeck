import { FC } from "react"
import { SidebarNavigation, useParams } from "@decky/ui"
import { BsCSquareFill, BsExclamationSquareFill, BsFillBoxFill } from "react-icons/bs"

import Normal from "./Normal"
import Advanced from "./Advanced"
import Custom from "./Custom"


const PageRouter: FC = () => {
  var { appid } = useParams<{ appid: number }>();
  if (typeof appid === 'string') { appid = parseInt(appid, 10) }
  const pages = [
    {
      title: 'Normal',
      content: <Normal appid={appid} />,
      icon: <BsFillBoxFill />,
      hideTitle: false
    },
    {
      title: 'Advanced',
      content: <Advanced appid={appid} />,
      icon: <BsExclamationSquareFill />,
      hideTitle: false
    },
    {
      title: 'Custom',
      content: <Custom appid={appid} />,
      icon: <BsCSquareFill />,
      hideTitle: false
    }
  ]

  return (
    <SidebarNavigation pages={pages} />
  )
}

export default PageRouter