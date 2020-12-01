import './ManageConfigs.less'
import { ClearOutlined, EditOutlined } from '@ant-design/icons'
import { Redirect } from 'react-router-dom'
import { Table, Button } from 'antd'
import { useUser, useServicesLocate } from '../common/Contexts'
import IConfigsService, { Config, ConfigType, ConfigNames } from '../../domain/ServiceInterfaces/IConfigsSercice'
import ILangsService, { LangKeys } from '../../domain/ServiceInterfaces/ILangsService'
import IViewService from '../../app/Interfaces/IViewService'
import React, { useState, useEffect } from 'react'

export function ManageConfigs () {
  const user = useUser()
  if (!user.editingPermission) {
    return <Redirect to="/" />
  }

  const locate = useServicesLocate()
  const langs = locate(ILangsService)
  const viewService = locate(IViewService)

  const [configs, setConfigs] = useState<Config[] | undefined>()

  const fetchConfigs = async () => {
    var allConfig = await locate(IConfigsService).all(true)
    const configs = await allConfig.filter(c => !c.key.startsWith(ConfigNames.RESERVED_PREFIX)).sort((a, b) => langs.get(a.key).localeCompare(langs.get(b.key)))
    setConfigs(configs)
  }

  const updateConfig = (config: Config) => {
    viewService.prompt(
      langs.get(LangKeys.Modify),
      [
        {
          type: 'Text',
          value: config.value || config.defaultValue,
          multiline: config.type === ConfigType.TEXT,
          hint: langs.get(LangKeys.Value)
        }
      ],
      async (value: string) => {
        try {
          const newConfig = await locate(IConfigsService).set(config.key, value)
          updateConfigs(config, newConfig)
          return true
        } catch (e) {
          viewService!.errorKey(langs, e.message)
        }
      }
    )
  }

  const updateConfigs = (origin: Config, newConfig?: Config) => {
    const idx = configs!.findIndex(c => c === origin)
    if (idx < 0) {
      setConfigs([...configs!, newConfig!])
    } else {
      configs!.splice(idx, 1, newConfig!)
      setConfigs([...configs!])
    }
  }

  const resetConfig = (config: Config) => {
    viewService.prompt(
      langs.get(LangKeys.Reset) + ': ' + config.key,
      [],
      async () => {
        try {
          const newConfig = await locate(IConfigsService).reset(config.key)
          updateConfigs(config, newConfig)
          return true
        } catch (e) {
          viewService!.errorKey(langs, e.message)
        }
      }
    )
  }

  const resetAll = () => {
    viewService.prompt(
      langs.get(LangKeys.Reset),
      [],
      async () => {
        try {
          await locate(IConfigsService).resetAll()
          window.location.reload()
          return true
        } catch (e) {
          viewService!.errorKey(langs, e.message)
        }
      }
    )
  }

  useEffect(() => {
    fetchConfigs()
    return function cleanup () {
      locate(IConfigsService).clearCache()
    }
  }, [])

  const renderKey = (_: string, config: Config) => {
    return <span>{langs.getConfig(config.key)}</span>
  }

  const renderDefaultValue = (_: string, config: Config) => {
    return <span>{config.defaultValue}</span>
  }

  const renderValue = (_: string, config: Config) => {
    return <div onClick={() => updateConfig(config)}>{config.value}<Button
      type="link"
      icon={<EditOutlined />}
    /></div>
  }

  const renderReset = (_: string, config: Config) => {
    return (
      config.value === undefined ? null
        : <Button
          type="link"
          onClick={() => resetConfig(config)}
          danger
          icon={<ClearOutlined />}
        />
    )
  }
  useEffect(() => {
    viewService.setFloatingMenus?.(ManageConfigs.name, <Button
      icon={<ClearOutlined />}
      type="default"
      size="large" shape="circle"
      onClick={() => resetAll()}
    >
    </Button>)
  })

  useEffect(() => {
    return () => {
      viewService.setFloatingMenus?.(ManageConfigs.name)
    }
  }, [])

  return (
    <div className="manage-configs">
      <Table
        rowKey="name"
        columns={[
          {
            title: langs.get(LangKeys.Configs),
            dataIndex: 'key',
            key: 'key',
            // className: 'key-column',
            render: renderKey
          },
          {
            title: langs.get(LangKeys.DefaultValue),
            dataIndex: 'defaultValue',
            key: 'defaultValue',
            render: renderDefaultValue
          },
          {
            title: langs.get(LangKeys.Value),
            dataIndex: 'value',
            key: 'value',
            render: renderValue
          },
          {
            title: '',
            key: 'reset',
            className: 'reset-column',
            render: renderReset
          }
        ]}
        dataSource={configs}
        pagination={false}
      ></Table>
    </div>
  )
}
