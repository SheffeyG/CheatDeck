import {
  SidebarNavigation, 
  useParams
} from "decky-frontend-lib"
import { VFC } from "react"
import { FaCog, FaInfo } from "react-icons/fa"

import GameSettings from "./GameSettings"


const PageRouter: VFC = () => {
  var { appid } = useParams<{ appid: number }>();
  if (typeof appid === 'string') { appid = parseInt(appid, 10) }
  const pages = [
    {
      title: 'Game Settings',
      content: <GameSettings appid={appid}/>,
      icon: <FaCog />,
      hideTitle: false
    },
    {
      title: 'App Info',
      content: <div>{appid}</div>,
      icon: <FaInfo />,
      hideTitle: false
    }
  ]

  return (
    <SidebarNavigation pages={pages} />
  )
}

export default PageRouter