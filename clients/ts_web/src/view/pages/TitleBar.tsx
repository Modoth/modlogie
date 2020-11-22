import './TitleBar.less'
import React from 'react'
import { Link } from 'react-router-dom'

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
          props.menus?.map(menu => 'link' in menu
            ? <Link key={menu.title} className="menu-item" to={menu.link}>{menu.icon}</Link>
            : <a key={menu.title} className="menu-item" onClick={menu.onClick}>{menu.icon}</a>)
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
