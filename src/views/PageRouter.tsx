import {
  SidebarNavigation,
  useParams
} from "decky-frontend-lib"
import { VFC } from "react"
import { FaCog, FaBolt, FaList } from "react-icons/fa"

import Normal from "./Normal"
import Advanced from "./Advanced"
import Custom from "./Custom"


const PageRouter: VFC = () => {
  var { appid } = useParams<{ appid: number }>();
  if (typeof appid === 'string') { appid = parseInt(appid, 10) }
  const pages = [
    {
      title: 'Normal',
      content: <Normal appid={appid} />,
      icon: <FaCog />,
      hideTitle: false
    },
    {
      title: 'Advanced',
      content: <Advanced appid={appid} />,
      icon: <FaBolt />,
      hideTitle: false
    },
    {
      title: 'Custom',
      content: <Custom appid={appid} />,
      icon: <FaList />,
      hideTitle: false
    }
  ]

  return (
    <SidebarNavigation pages={pages} />
  )
}

export default PageRouter