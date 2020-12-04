import './ManageContentTemplates.less'
import { PlusOutlined, DeleteFilled } from '@ant-design/icons'
import { Redirect } from 'react-router-dom'
import { Table, Button } from 'antd'
import { useUser, useServicesLocate } from '../common/Contexts'
import IContentTemplatesService, { ContentTemplate } from '../../domain/ServiceInterfaces/IContentTemplatesService'
import ILangsService, { LangKeys } from '../../domain/ServiceInterfaces/ILangsService'
import IViewService from '../../app/Interfaces/IViewService'
import React, { useState, useEffect } from 'react'

export function ManageContentTemplates () {
  const user = useUser()
  if (!user.editingPermission) {
    return <Redirect to="/" />
  }

  const locate = useServicesLocate()
  const langs = locate(ILangsService)
  const viewService = locate(IViewService)

  const [templates, setTemplates] = useState<ContentTemplate[] | undefined>()
  const fetchTemplates = async () => {
    try {
      const templates = (await locate(IContentTemplatesService).all()).sort((a, b) => a.name.localeCompare(b.name))
      setTemplates(templates)
    } catch (e) {
      viewService!.errorKey(langs, e.message)
    }
  }

  const addTemplate = () => {
    viewService.prompt(
      langs.get(LangKeys.Create),
      [
        { type: 'Text', value: '', hint: langs.get(LangKeys.Name) },
        { type: 'Text', value: '', multiline: true, hint: langs.get(LangKeys.ContentTemplate) }
      ],
      async (name: string, data:string) => {
        if (!name || !data) {
          return
        }
        try {
          const id = await locate(IContentTemplatesService).add(name, data)
          setTemplates([...templates!, { id, data, name }])
          return true
        } catch (e) {
          viewService!.errorKey(langs, e.message)
        }
      }
    )
  }

  const updateTemplate = (template: ContentTemplate) => {
    viewService.prompt(
      langs.get(LangKeys.Modify),
      [
        {
          type: 'Text',
          multiline: true,
          value: template.data,
          hint: langs.get(LangKeys.ContentTemplate)
        }
      ],
      async (data: string) => {
        if (!data) {
          return
        }
        try {
          await locate(IContentTemplatesService).update(template.id, data)
          template!.data = data
          setTemplates([...templates!])
          return true
        } catch (e) {
          viewService!.errorKey(langs, e.message)
        }
      }
    )
  }

  const deleteTemplate = (template: ContentTemplate) => {
    viewService.prompt(
      langs.get(LangKeys.Delete) + ': ' + template.name,
      [],
      async () => {
        try {
          await locate(IContentTemplatesService).delete(template.id)
          const idx = templates!.indexOf(template)
          templates!.splice(idx, 1)
          setTemplates([...templates!])
          return true
        } catch (e) {
          viewService!.errorKey(langs, e.message)
        }
      }
    )
  }

  useEffect(() => {
    fetchTemplates()
  }, [])

  const renderName = (_: string, template: ContentTemplate) => {
    return <span>{template.name}</span>
  }

  const renderData = (_: string, template: ContentTemplate) => {
    return <span className="data">{template.data}</span>
  }

  const renderDelete = (_: string, template: ContentTemplate) => {
    return (
      <Button
        type="link"
        onClick={() => deleteTemplate(template)}
        danger
        icon={<DeleteFilled />}
      />
    )
  }
  useEffect(() => {
  viewService.setFloatingMenus?.(ManageContentTemplates.name, <Button
    icon={<PlusOutlined />}
    type="default"
    size="large" shape="circle"
    onClick={addTemplate}
  >
  </Button>)
  })
  useEffect(() => {
    return () => {
      viewService.setFloatingMenus?.(ManageContentTemplates.name)
    }
  }, [])
  return (
    <div className="manage-contenttemplates">
      <Table
        rowKey="name"
        columns={[
          {
            title: langs.get(LangKeys.Name),
            dataIndex: 'name',
            key: 'name',
            className: 'tag-name-column',
            render: renderName
          },
          {
            title: langs.get(LangKeys.ContentTemplate),
            dataIndex: 'data',
            key: 'data',
            render: renderData,
            onCell: (template) => ({ onClick: () => updateTemplate(template) })
          },
          {
            title: '',
            key: 'delete',
            className: 'tag-delete-column',
            render: renderDelete
          }
        ]}
        dataSource={templates}
        pagination={false}
      ></Table>
    </div>
  )
}
