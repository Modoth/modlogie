import './ArticleFileViewer.less'
import { ArticleFile } from '../../domain/ServiceInterfaces/Article'
import { Button, Tooltip } from 'antd'
import { CloseOutlined } from '@ant-design/icons'
import { useServicesLocate } from '../common/Contexts'
import classNames from 'classnames'
import ILangsService from '../../domain/ServiceInterfaces/ILangsService'
import React, { ReactNode } from 'react'

const Configs = {} as any

export default function ArticleFileViewer (props: {
  align?: 'Left' | 'Center' | 'Right' | 'Stretch';
  onDelete?: { (): void };
  onClick?: { (): void };
  file: ArticleFile;
  className?: string;
}) {
  const langs = useServicesLocate()(ILangsService)
  const type = (props.file?.name || '').toLocaleLowerCase()
  const url = props.file?.url
  const endsWith = (...s: string[]) => s.some((i) => type.endsWith(i))
  let content: ReactNode | undefined
  if (endsWith('.png', '.jpg', '.jpeg', 'gif')) {
    content = <img src={url} />
  } else if (endsWith('.mp4')) {
    if (props.onClick) {
      content = <video
        src={`${url}#t=0.1`}
        onClick={(e) => {
          e.stopPropagation()
          props.onClick && props.onClick()
        }}
      ></video>
    } else {
      content = (
        <video
          src={`${url}#t=0.1`}
          controls
        ></video>
      )
    }
  } else {
    content = <span>{props.file?.name}</span>
  }
  return (
    <div className={classNames(props.className)}>
      <div className="article-file" onClick={props.onClick}>
        {content}
        {props.onDelete ? (
          <Tooltip title={langs.get(Configs.UiLangsEnum.Delete)}>
            <Button
              type="default"
              shape="circle"
              icon={<CloseOutlined />}
              size="small"
              className="btn-delete"
              onClick={(e) => {
                e.stopPropagation()
                props.onDelete && props.onDelete()
              }}
            ></Button>
          </Tooltip>

        ) : null}
      </div>
    </div>
  )
}
