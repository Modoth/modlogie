import './TitleBar.less'
import { Button } from 'antd'
import { Link } from 'react-router-dom'
import React from 'react'

type LinkOrClick = ({link:string}|{onClick():void})

type TitleBarMenu = {
    title:string,
    icon:React.ReactNode } & LinkOrClick

type TitleBarProps =({title:string, icon?:string}| {title?:string, icon:string})
    &LinkOrClick
    &{menus?:TitleBarMenu [ ]}

export default function TitleBar (props:TitleBarProps) {
  const titleContent = <>
    {props.icon ? <img src={props.icon}></img> : undefined}
    {props.title ? <span>{props.title}</span> : undefined}
  </>
  return <div className="title-bar-wraper">
    <div className="title-bar">
      {
          props.menus?.map((menu, i) =>
            <Button key={menu.title || i.toString()} size="large" className="menu-item"
              onClick={'link' in menu ? undefined : menu.onClick}
              icon={'link' in menu ? <Link to={menu.link}>{menu.icon}</Link> : menu.icon}>
            </Button>)
      }
      {
        'link' in props ? <Link to="" className="title">
          {titleContent}
        </Link>
          : <a onClick={props.onClick} className="title">
            {titleContent}
          </a>
      }
    </div>
  </div>
}
