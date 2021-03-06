import './ManageSubjects.less'
import { Button, Table } from 'antd'
import { DeleteFilled, SisternodeOutlined, SubnodeOutlined, FileAddOutlined, FileOutlined, OrderedListOutlined, DragOutlined, UploadOutlined, DownloadOutlined } from '@ant-design/icons'
import { Redirect } from 'react-router-dom'
import { useUser, useServicesLocate } from '../common/Contexts'
import ILangsService, { LangKeys } from '../../domain/ServiceInterfaces/ILangsService'
import IMmConverter from '../../domain/ServiceInterfaces/IMmConverter'
import ISubjectsExporter from '../../domain/ServiceInterfaces/ISubjectsExporter'
import ISubjectsService from '../../domain/ServiceInterfaces/ISubjectsService'
import IViewService from '../../app/Interfaces/IViewService'
import React, { useState, useEffect } from 'react'
import Subject from '../../domain/ServiceInterfaces/Subject'
import SubjectViewModel from './SubjectViewModel'

let subjectsModelCache: SubjectViewModel[] = []
let subjectsCacheKey: Subject[] = []
let excludePathCacheKey: string | undefined = ''
const convertToTreeData = (subjects: Subject[], excludePath: string) => {
  if (subjects === subjectsCacheKey && excludePathCacheKey === excludePath) {
    return subjectsModelCache
  }
  const subjectsModelDictCache = new Map<string, SubjectViewModel>()
  subjectsModelCache = subjects.filter(s => s.path !== excludePath).map(
    (s) => new SubjectViewModel(s, subjectsModelDictCache, excludePath)
  )
  subjectsCacheKey = subjects
  excludePathCacheKey = excludePath
  return subjectsModelCache
}

const isImage = (url: string) => {
  url = url.toLowerCase()
  const imgs = ['.png', '.jpeg', '.jpg', 'gif', '.svg']
  return imgs.some(i => url.endsWith(i))
}

export function ManageSubjects () {
  const user = useUser()
  if (!user.editingPermission) {
    return <Redirect to="/" />
  }
  const locate = useServicesLocate()
  const langs = locate(ILangsService)
  const viewService = locate(IViewService)
  const [subjects, setSubjects] = useState<Subject[]>([])

  const fetchSubjects = async () => {
    const service: ISubjectsService = locate(ISubjectsService)
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
        const service: ISubjectsService = locate(ISubjectsService)
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
        const service: ISubjectsService = locate(ISubjectsService)
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

  const exportSubject = (subject?: Subject) => {
    locate(ISubjectsExporter).export(subject ? [subject] : subjects)
  }

  const importTo = (parent?: Subject) => {
    viewService.prompt(
      langs.get(LangKeys.Create),
      [{ type: 'TextFile', value: '', hint: langs.get(LangKeys.Import), accept: '*.mm' }],
      async (content: string) => {
        if (!content) {
          return false
        }
        const subjects = locate(IMmConverter).convertFromMmToSubjects(content, parent != null)
        if (!subjects.length) {
          return false
        }
        const service: ISubjectsService = locate(ISubjectsService)
        try {
          await service.batchAdd(subjects, parent?.id)
        } catch (e) {
          viewService!.errorKey(langs, e.message)
          return
        }
        await fetchSubjects()
        return true
      }
    )
  }

  const moveSubject = (subject: Subject) => {
    if (!subject.parent) {
      return
    }
    viewService.prompt(
      langs.get(LangKeys.Create),
      [{ type: 'TreeSelect', value: subject?.parent?.id, values: convertToTreeData(subjects, subject!.path!), hint: langs.get(LangKeys.Name) }],
      async (parentId: string) => {
        if (parentId === subject?.parent?.id) {
          return
        }
        const service: ISubjectsService = locate(ISubjectsService)
        try {
          subject = await service.move(subject!.id, parentId)
        } catch (e) {
          viewService!.errorKey(langs, e.message)
          return
        }
        await fetchSubjects()
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
        const service: ISubjectsService = locate(ISubjectsService)
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

  const updateSubjectOrder = (subject: Subject) => {
    viewService.prompt(
      langs.get(LangKeys.Modify),
      [
        {
          type: 'Text',
          value: Infinity === subject.order ? '' : subject.order,
          hint: langs.get(LangKeys.Order)
        }
      ],
      async (newOrderStr: string) => {
        let newOrder = newOrderStr ? parseInt(newOrderStr) : Infinity
        if (isNaN(newOrder)) {
          newOrder = Infinity
        }
        const service: ISubjectsService = locate(ISubjectsService)
        try {
          await service.setOrder(subject.id, newOrder)
        } catch (e) {
          viewService!.errorKey(langs, e.message)
          return
        }
        subject.order = newOrder
        if (subject.parent) {
          updateSubjectAncestors(subject)
          if (subject.parent.children) {
            subject.parent.children = subject.parent.children.sort((a, b) => a.order - b.order)
          }
        } else {
          const idx = subjects!.findIndex(s => s.id === subject.id)
          subjects!.splice(idx, 1, Object.assign({}, subject))
          subjects!.sort((a, b) => a.order - b.order)
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
      async (data: File | string) => {
        if (!data) {
          return
        }
        viewService.setLoading(true)
        const service: ISubjectsService = locate(ISubjectsService)
        let resourceUrl
        try {
          if (typeof data === 'string') {
            resourceUrl = await service.setResource(subject.id, 'text/plain', new TextEncoder().encode(data))
          } else {
            resourceUrl = await service.setResource(subject.id, data.type, new Uint8Array(await data.arrayBuffer()))
          }
        } catch (e) {
          viewService!.errorKey(langs, e.message)
          viewService.setLoading(false)
          return
        }
        subject.resourceUrl = resourceUrl
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
    const service: ISubjectsService = locate(ISubjectsService)
    try {
      await service.resetResource(subject.id)
    } catch (e) {
      viewService!.errorKey(langs, e.message)
      return
    }
    subject.resourceUrl = undefined
    subject.resourceUrl = undefined
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
      <span onClick={() => updateSubjectName(subject)}>{Infinity === subject.order ? '' : (subject.order + '. ')}{subject.name}</span>
    )
  }
  const renderOrder = (_: string, subject: Subject) => {
    return (
      <Button
        type="link"
        onClick={() => updateSubjectOrder(subject)}
        icon={<OrderedListOutlined />}
      ></Button>
    )
  }
  const renderResouce = (_: string, subject: Subject) => {
    return (
      subject.resourceUrl ? (isImage(subject.resourceUrl) ? <div onClick={() => resetIcon(subject)}>
        <img
          src={subject.resourceUrl}
        />
      </div> : < Button
        type="link"
        onClick={() => resetIcon(subject)}
        icon={< FileOutlined />}
      />)
        : < Button
          type="link"
          onClick={() => setIcon(subject)
          }
          icon={< FileAddOutlined />}
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

  const renderImport = (_: string, subject: Subject) => {
    return (
      <Button
        type="link"
        onClick={() => importTo(subject)}
        icon={<UploadOutlined />}
      />
    )
  }
  const renderExport = (_: string, subject: Subject) => {
    return (
      <Button
        type="link"
        onClick={() => exportSubject(subject)}
        icon={<DownloadOutlined />}
      />
    )
  }

  const renderMove = (_: string, subject: Subject) => {
    return (subject.parent
      ? <Button
        type="link"
        onClick={() => moveSubject(subject)}
        icon={<DragOutlined />}
      /> : null
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
  useEffect(() => {
    viewService.setFloatingMenus?.(LangKeys.PageManageSubjects, <>
      <Button
        icon={<UploadOutlined />}
        type="primary"
        size="large" shape="circle"
        onClick={() => importTo()}
      >
      </Button>
    </>,
    <Button
      icon={<SisternodeOutlined />}
      type="primary"
      size="large" shape="circle"
      onClick={() => addSubject()}
    >
    </Button>)
  })

  useEffect(() => {
    return () => {
      viewService.setFloatingMenus?.(LangKeys.PageManageSubjects)
    }
  }, [])
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
            dataIndex: 'order',
            key: 'order',
            className: 'subject-order-column',
            render: renderOrder
          },
          {
            key: 'icon',
            className: 'subject-icon-column',
            render: renderResouce
          },
          {
            key: 'move',
            className: 'subject-move-column',
            render: renderMove
          },
          {
            key: 'create',
            className: 'subject-create-column',
            render: renderCreate
          },
          {
            key: 'import',
            className: 'subject-import-column',
            render: renderImport
          },
          {
            key: 'export',
            className: 'subject-export-column',
            render: renderExport
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
    </div>
  )
}
