import React, { useState, useEffect } from 'react'
import './ManageTags.less'
import { useUser, useServicesLocator } from '../../app/Contexts'
import { Redirect } from 'react-router-dom'
import { Pagination, Table, Button } from 'antd'
import { PlusOutlined, DeleteFilled, UploadOutlined } from '@ant-design/icons'
import ILangsService, { LangKeys } from '../../domain/ILangsService'
import IViewService from '../services/IViewService'
import YAML, { stringify } from 'yaml'
import ITagsService, { Tag, TagType, TagNames } from '../../domain/ITagsService'

export function ManageTags() {
  const user = useUser()
  if (!user.editingPermission) {
    return <Redirect to="/" />
  }

  const locator = useServicesLocator()
  const langs = locator.locate(ILangsService)
  const viewService = locator.locate(IViewService)

  const [tags, setTags] = useState<Tag[] | undefined>()
  const fetchTags = async () => {
    try {
      var tags = (await locator.locate(ITagsService).all()).filter(t => !t.name.startsWith(TagNames.RESERVED_PREFIX)).sort((a, b) => a.name.localeCompare(b.name));
      setTags(tags)
    } catch (e) {
      viewService!.errorKey(langs, e.message)
    }

  }

  const addTag = () => {
    var tagTypes = [TagType.STRING, TagType.ENUM, TagType.DATE, TagType.LINK];
    const tagTypeNames = tagTypes.map(type => langs.get(TagType[type]))
    viewService.prompt(
      langs.get(LangKeys.Create),
      [
        { type: 'Text', value: '', hint: langs.get(LangKeys.Tags) },
        {
          hint: langs.get(LangKeys.EnumValue),
          type: 'Text',
          value: '',
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
        var type = tagTypes[tagTypeNames.indexOf(typeName)]
        var values = undefined;
        if (type == TagType.ENUM) {
          if (!newTagValue) {
            return
          }
          values = newTagValue.split(' ').map(s => s.trim()).filter(s => s);
          if (!values.length) {
            return
          }
        }
        try {
          var newTag = await locator.locate(ITagsService).add(newTagName, type, values)
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
          await locator.locate(ITagsService).updateName(tag.name, newTagName);
          tag!.name = newTagName
          setTags([...tags!])
          locator.locate(ITagsService).clearCache()
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
          value: tag.values ? tag.values.join(' ') : '',
          hint: langs.get(LangKeys.Tags)
        }
      ],
      async (newTagValue: string) => {
        try {
          if (!newTagValue) {
            return
          }
          var values = newTagValue.split(' ').map(s => s.trim()).filter(s => s);
          if (!values.length) {
            return
          }
          await locator.locate(ITagsService).updateValues(tag.name, values);
          tag!.values = values
          setTags([...tags!])
          locator.locate(ITagsService).clearCache()
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
          await locator.locate(ITagsService).delete(tag.name);
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
    fetchTags();
    return function cleanup() {
      locator.locate(ITagsService).clearCache();
    };
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
    }}>{tag.values ? tag.values.join(' ') : ''}</span>
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
      <Button
        icon={<PlusOutlined />}
        className="btn-create"
        type="dashed"
        onClick={addTag}
      >
        {langs.get(LangKeys.Create)}
      </Button>
    </div>
  )
}
