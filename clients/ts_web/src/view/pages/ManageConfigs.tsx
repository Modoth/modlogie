import React, { useState, useEffect } from 'react'
import './ManageConfigs.less'
import { useUser, useServicesLocator } from '../../app/Contexts'
import { Redirect } from 'react-router-dom'
import { Table, Button } from 'antd'
import { ClearOutlined, EditOutlined } from '@ant-design/icons'
import ILangsService, { LangKeys } from '../../domain/ILangsService'
import IViewService from '../services/IViewService'
import IConfigsService, { Config, ConfigType } from '../../domain/IConfigsSercice'


export function ManageConfigs() {
  const user = useUser()
  if (!user.editingPermission) {
    return <Redirect to="/" />
  }

  const locator = useServicesLocator()
  const langs = locator.locate(ILangsService)
  const viewService = locator.locate(IViewService)

  const [configs, setConfigs] = useState<Config[] | undefined>()

  const fetchConfigs = async () => {
    var configs = await (await locator.locate(IConfigsService).all(true)).sort((a, b) => a.key.localeCompare(b.key));
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
          let newConfig = await locator.locate(IConfigsService).set(config.key, value);
          updateConfigs(config, newConfig);
          return true
        } catch (e) {
          viewService!.errorKey(langs, e.message)
        }
      }
    )
  }

  const updateConfigs = (origin: Config, newConfig?: Config) => {
    let idx = configs!.findIndex(c => c == origin)
    if (idx < 0) {
      setConfigs([...configs!, newConfig!])
    }
    else {
      configs!.splice(idx, 1, newConfig!);
      setConfigs([...configs!])
    }
  }

  const resetConfig = (config: Config) => {
    viewService.prompt(
      langs.get(LangKeys.Reset) + ': ' + config.key,
      [],
      async () => {
        try {
          let newConfig = await locator.locate(IConfigsService).reset(config.key);
          updateConfigs(config, newConfig);
          return true
        } catch (e) {
          viewService!.errorKey(langs, e.message)
        }
      }
    )
  }

  useEffect(() => {
    fetchConfigs()
    return function cleanup() {
      locator.locate(IConfigsService).clearCache();
    };
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
      config.value === undefined ? null :
        <Button
          type="link"
          onClick={() => resetConfig(config)}
          danger
          icon={<ClearOutlined />}
        />
    )
  }

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
