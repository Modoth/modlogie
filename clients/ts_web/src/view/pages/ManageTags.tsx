import './ManageTags.less'
import { PlusOutlined, DeleteFilled } from '@ant-design/icons'
import { Redirect } from 'react-router-dom'
import { Table, Button } from 'antd'
import { useUser, useServicesLocate } from '../common/Contexts'
import ILangsService, { LangKeys } from '../../domain/ServiceInterfaces/ILangsService'
import ITagsService, { Tag, TagType, TagNames } from '../../domain/ServiceInterfaces/ITagsService'
import IViewService from '../../app/Interfaces/IViewService'
import React, { useState, useEffect } from 'react'
import Seperators from '../../domain/ServiceInterfaces/Seperators'

export function ManageTags () {
  const user = useUser()
  if (!user.editingPermission) {
    return <Redirect to="/" />
  }

  const locate = useServicesLocate()
  const langs = locate(ILangsService)
  const viewService = locate(IViewService)

  const [tags, setTags] = useState<Tag[] | undefined>()
  const fetchTags = async () => {
    try {
      const tags = (await locate(ITagsService).all()).filter(t => !t.name.startsWith(TagNames.RESERVED_PREFIX)).sort((a, b) => a.name.localeCompare(b.name))
      setTags(tags)
    } catch (e) {
      viewService!.errorKey(langs, e.message)
    }
  }

  const addTag = () => {
    const tagTypes = [TagType.STRING, TagType.ENUM, TagType.DATE, TagType.LINK]
    const tagTypeNames = tagTypes.map(type => langs.get(TagType[type]))
    viewService.prompt(
      langs.get(LangKeys.Create),
      [
        { type: 'Text', value: '', hint: langs.get(LangKeys.Tags) },
        {
          hint: langs.get(LangKeys.EnumValue),
          type: 'Text',
          value: ''
        },
        {
          hint: langs.get(LangKeys.Type),
          type: 'Enum',
          value: tagTypeNames[0],
          values: tagTypeNames
        }
      ],
      async (newTagName: string, newTagValue: string, typeName: string) => {
        if (!newTagName || newTagName.startsWith(TagNames.RESERVED_PREFIX)) {
          return
        }
        const type = tagTypes[tagTypeNames.indexOf(typeName)]
        let values
        if (type === TagType.ENUM) {
          if (!newTagValue) {
            return
          }
          values = Seperators.seperateItems(newTagValue)
          if (!values.length) {
            return
          }
        }
        try {
          const newTag = await locate(ITagsService).add(newTagName, type, values)
          setTags([...tags!, newTag!])
          return true
        } catch (e) {
          viewService!.errorKey(langs, e.message)
        }
      }
    )
  }

  const updateTagName = (tag: Tag) => {
    viewService.prompt(
      langs.get(LangKeys.Modify),
      [
        {
          type: 'Text',
          value: tag.name,
          hint: langs.get(LangKeys.Tags)
        }
      ],
      async (newTagName: string) => {
        if (!newTagName || newTagName.startsWith(TagNames.RESERVED_PREFIX)) {
          return
        }
        try {
          await locate(ITagsService).updateName(tag.name, newTagName)
          tag!.name = newTagName
          setTags([...tags!])
          locate(ITagsService).clearCache()
          return true
        } catch (e) {
          viewService!.errorKey(langs, e.message)
        }
      }
    )
  }

  const updateTagValues = (tag: Tag) => {
    viewService.prompt(
      langs.get(LangKeys.Modify),
      [
        {
          type: 'Text',
          value: tag.values ? Seperators.joinItems(tag.values) : '',
          hint: langs.get(LangKeys.Tags)
        }
      ],
      async (newTagValue: string) => {
        try {
          if (!newTagValue) {
            return
          }
          const values = Seperators.seperateItems(newTagValue)
          if (!values.length) {
            return
          }
          await locate(ITagsService).updateValues(tag.name, values)
          tag!.values = values
          setTags([...tags!])
          locate(ITagsService).clearCache()
          return true
        } catch (e) {
          viewService!.errorKey(langs, e.message)
        }
      }
    )
  }

  const deleteTag = (tag: Tag) => {
    viewService.prompt(
      langs.get(LangKeys.Delete) + ': ' + tag.name,
      [],
      async () => {
        try {
          await locate(ITagsService).delete(tag.name)
          const idx = tags!.indexOf(tag)
          tags!.splice(idx, 1)
          setTags([...tags!])
          return true
        } catch (e) {
          viewService!.errorKey(langs, e.message)
        }
      }
    )
  }

  useEffect(() => {
    fetchTags()
    return function cleanup () {
      locate(ITagsService).clearCache()
    }
  }, [])

  const renderName = (_: string, tag: Tag) => {
    return <span onClick={() => updateTagName(tag)}>{tag.name}</span>
  }

  const renderType = (_: string, tag: Tag) => {
    return <span >{langs.get(TagType[tag.type])}</span>
  }

  const renderValues = (_: string, tag: Tag) => {
    return <span onClick={e => {
      if (tag.type !== TagType.ENUM) {
        return
      }
      updateTagValues(tag)
    }}>{tag.values ? Seperators.joinItems(tag.values) : ''}</span>
  }

  const renderDelete = (_: string, tag: Tag) => {
    return (
      <Button
        type="link"
        onClick={() => deleteTag(tag)}
        danger
        icon={<DeleteFilled />}
      />
    )
  }
  useEffect(() => {
  viewService.setFloatingMenus?.(ManageTags.name, undefined, <Button
    icon={<PlusOutlined />}
    type="primary"
    size="large" shape="circle"
    onClick={addTag}
  >
  </Button>)
  })
  useEffect(() => {
    return () => {
      viewService.setFloatingMenus?.(ManageTags.name)
    }
  }, [])
  return (
    <div className="manage-tags">
      <Table
        rowKey="name"
        columns={[
          {
            title: langs.get(LangKeys.Tags),
            dataIndex: 'name',
            key: 'name',
            className: 'tag-name-column',
            render: renderName
          },
          {
            title: langs.get(LangKeys.Type),
            dataIndex: 'type',
            key: 'type',
            render: renderType
          },
          {
            title: langs.get(LangKeys.Value),
            dataIndex: 'values',
            key: 'values',
            className: 'tag-values-column',
            render: renderValues
          },
          {
            title: '',
            key: 'delete',
            className: 'tag-delete-column',
            render: renderDelete
          }
        ]}
        dataSource={tags}
        pagination={false}
      ></Table>
    </div>
  )
}
