import React, { useState, useEffect } from 'react'
import './ManageSubjects.less'
import { useUser, useServicesLocator } from '../../app/Contexts'
import { Redirect } from 'react-router-dom'
import { Button, Table, Avatar } from 'antd'
import {
  DeleteFilled,
  SisternodeOutlined,
  SubnodeOutlined,
  PictureOutlined
} from '@ant-design/icons'
import Subject from '../../domain/Subject'
import ISubjectsService from '../../domain/ISubjectsService'
import ILangsService, { LangKeys } from '../../domain/ILangsService'
import IViewService from '../services/IViewService'

export function ManageSubjects() {
  const user = useUser()
  if (!user) {
    return <Redirect to="/" />
  }
  const locator = useServicesLocator()
  const langs = locator.locate(ILangsService)
  const viewService = locator.locate(IViewService)
  const [subjects, setSubjects] = useState<Subject[]>([])

  const fetchSubjects = async () => {
    const service: ISubjectsService = locator.locate(ISubjectsService)
    try {
      setSubjects(await service.all())
    } catch (e) {
      viewService!.errorKey(langs, e.message)
    }
  }

  const updateSubjectAncestors = (subject: Subject) => {
    while (true) {
      if (subject.parent) {
        const idx = subject.parent.children!.findIndex(s => s.id === subject.id)
        subject.parent.children!.splice(idx, 1, Object.assign({}, subject))
        subject.parent.children = [...subject.parent.children!]
        subject = subject.parent!
      } else {
        subjects.splice(subjects.findIndex(s => s.id === subject.id), 1, Object.assign({}, subject))
        break
      }
    }
  }

  const deleteSubject = (subject: Subject) => {
    viewService.prompt(
      langs.get(LangKeys.Delete) + ': ' + subject.name,
      [],
      async () => {
        const service: ISubjectsService = locator.locate(ISubjectsService)
        try {
          await service.delete(subject.id)
        } catch (e) {
          viewService!.errorKey(langs, e.message)
          return
        }
        if (subject.parent) {
          const idx = subject.parent.children!.findIndex(s => s.id === subject.id)
          subject.parent.children!.splice(idx, 1)
          subject.parent.children = [...subject.parent.children!]
          updateSubjectAncestors(subject.parent)
        } else {
          const idx = subjects!.findIndex(s => s.id === subject.id)
          subjects!.splice(idx, 1)
        }
        setSubjects([...subjects!])
        return true
      }
    )
  }

  const addSubject = (parent?: Subject) => {
    viewService.prompt(
      langs.get(LangKeys.Create),
      [{ type: 'Text', value: '', hint: langs.get(LangKeys.Name) }],
      async (name: string) => {
        const service: ISubjectsService = locator.locate(ISubjectsService)
        let subject: Subject
        try {
          subject = await service.add(name, parent?.id)
        } catch (e) {
          viewService!.errorKey(langs, e.message)
          return
        }
        subject.parent = parent
        if (parent) {
          parent.children = parent.children || []
          parent.children.push(subject)
          updateSubjectAncestors(subject.parent!)
        } else {
          subjects.push(subject)
        }
        setSubjects([...subjects!])
        return true
      }
    )
  }

  const updateSubjectName = (subject: Subject) => {
    viewService.prompt(
      langs.get(LangKeys.Modify),
      [
        {
          type: 'Text',
          value: subject.name,
          hint: langs.get(LangKeys.Name)
        }
      ],
      async (newName: string) => {
        if (!newName) {
          return
        }
        const service: ISubjectsService = locator.locate(ISubjectsService)
        try {
          await service.rename(newName, subject.id)
        } catch (e) {
          viewService!.errorKey(langs, e.message)
          return
        }
        subject.name = newName
        if (subject.parent) {
          updateSubjectAncestors(subject)
        } else {
          const idx = subjects!.findIndex(s => s.id === subject.id)
          subjects!.splice(idx, 1, Object.assign({}, subject))
        }
        setSubjects([...subjects!])
        return true
      }
    )
  }

  const setIcon = (subject: Subject) => {
    viewService.prompt(
      langs.get(LangKeys.Import),
      [
        {
          type: 'File',
          value: undefined
        }
      ],
      async (file: File) => {
        if (!file) {
          return
        }
        viewService.setLoading(true)
        const service: ISubjectsService = locator.locate(ISubjectsService)
        var iconUrl
        try {
          iconUrl = await service.setIcon(subject.id, file.type, new Uint8Array(await file.arrayBuffer()))
        } catch (e) {
          viewService!.errorKey(langs, e.message)
          viewService.setLoading(false)
          return
        }
        subject.iconUrl = iconUrl
        if (subject.parent) {
          updateSubjectAncestors(subject)
        } else {
          const idx = subjects!.findIndex(s => s.id === subject.id)
          subjects!.splice(idx, 1, Object.assign({}, subject))
        }
        setSubjects([...subjects!])
        viewService.setLoading(false)
        return true
      }
    )
  }

  const resetIcon = async (subject: Subject) => {
    const service: ISubjectsService = locator.locate(ISubjectsService)
    try {
      await service.resetIcon(subject.id)
    } catch (e) {
      viewService!.errorKey(langs, e.message)
      return
    }
    subject.iconUrl = undefined
    subject.iconUrl = undefined
    if (subject.parent) {
      updateSubjectAncestors(subject)
    } else {
      const idx = subjects!.findIndex(s => s.id === subject.id)
      subjects!.splice(idx, 1, Object.assign({}, subject))
    }
    setSubjects([...subjects!])
    return true
  }

  useEffect(() => {
    fetchSubjects()
  }, [])

  const renderName = (_: string, subject: Subject) => {
    return (
      <span onClick={() => updateSubjectName(subject)}>{subject.name}</span>
    )
  }
  const renderIcon = (_: string, subject: Subject) => {
    return (
      subject.iconUrl ?
        <div onClick={() => resetIcon(subject)}>
          <Avatar
            src={subject.iconUrl}
          />
        </div> :
        <Button
          type="link"
          onClick={() => setIcon(subject)}
          icon={<PictureOutlined />}
        />
    )
  }
  const renderCreate = (_: string, subject: Subject) => {
    return (
      <Button
        type="link"
        onClick={() => addSubject(subject)}
        icon={<SubnodeOutlined />}
      />
    )
  }
  const renderDelete = (_: string, subject: Subject) => {
    return (
      <Button
        type="link"
        onClick={() => deleteSubject(subject)}
        danger
        icon={<DeleteFilled />}
      ></Button>
    )
  }
  return (
    <div className="manage-subjects">
      <Table
        rowKey="name"
        columns={[
          {
            dataIndex: 'name',
            key: 'name',
            render: renderName
          },
          {
            key: 'icon',
            className: 'subject-icon-column',
            render: renderIcon
          },
          {
            key: 'create',
            className: 'subject-create-column',
            render: renderCreate
          },
          {
            key: 'delete',
            className: 'subject-delete-column',
            render: renderDelete
          }
        ]}
        dataSource={subjects}
        pagination={false}
      ></Table>
      <Button
        icon={<SisternodeOutlined />}
        onClick={() => addSubject()}
        className="btn-create"
        type="dashed"
      >
        {langs.get(LangKeys.Create)}
      </Button>
    </div>
  )
}
