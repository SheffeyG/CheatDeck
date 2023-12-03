import {
  SidebarNavigation
} from "decky-frontend-lib"
import { VFC } from "react"
import { FaCog, FaInfo } from "react-icons/fa"


const PageRouter: VFC = () => {
  const pages = [
    {
      title: 'Global Settings',
      content: <div></div>,
      icon: <FaCog />,
      hideTitle: false
    },
    {
      title: 'App Info',
      content: <div></div>,
      icon: <FaInfo />,
      hideTitle: false
    }
  ]

  return (
    <SidebarNavigation pages={pages} />
  )
}

export default PageRouter