import './ManageUsers.less'
import { Pagination, Table, Button, Switch, DatePicker } from 'antd'
import { PlusOutlined, DeleteFilled } from '@ant-design/icons'
import { Redirect } from 'react-router-dom'
import { useUser, useServicesLocate } from '../common/Contexts'
import ILangsService, { LangKeys } from '../../domain/ServiceInterfaces/ILangsService'
import IUsersService, { User } from '../../domain/ServiceInterfaces/IUsersService'
import IViewService from '../../app/Interfaces/IViewService'
import moment from 'moment'
import React, { useState, useEffect } from 'react'

export function ManageUsers () {
  const user = useUser()
  if (!user.editingPermission) {
    return <Redirect to="/" />
  }

  const locate = useServicesLocate()
  const langs = locate(ILangsService)
  const viewService = locate(IViewService)

  const [users, setUsers] = useState<User[]>([])
  const [filter, setFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const countPerPage = 10
  const fetchUsers = async (page: number) => {
    if (page === undefined) {
      page = currentPage
    }
    try {
      viewService.setLoading(true)
      const [total, users] = await locate(IUsersService).all(filter, countPerPage * (page! - 1), countPerPage)
      setUsers(users)
      setTotalCount(total)
      setCurrentPage(page)
    } catch (e) {
      viewService!.errorKey(langs, e.message)
      viewService.setLoading(false)
      return false
    }
    viewService.setLoading(false)
    window.scrollTo(0, 0)
  }

  const addUser = () => {
    viewService.prompt(
      langs.get(LangKeys.Create),
      [
        { type: 'Text', value: '', hint: langs.get(LangKeys.Name) },
        { type: 'Text', value: '', hint: langs.get(LangKeys.Email) },
        { type: 'Password', value: '', hint: langs.get(LangKeys.Password) },
        { type: 'Password', value: '', hint: langs.get(LangKeys.Password) }
      ],
      async (newName: string, newEmail: string, password1: string, password2) => {
        if (!newName || !newEmail || password1 !== password2) {
          return
        }
        try {
          const user = await locate(IUsersService).add(newName, newEmail, password1)
          setUsers([...users!, user!])
          return true
        } catch (e) {
          viewService!.errorKey(langs, e.message)
        }
      }
    )
  }

  const updateComment = (user: User) => {
    viewService.prompt(
      langs.get(LangKeys.Modify),
      [
        {
          type: 'Text',
          value: user.comment,
          hint: langs.get(LangKeys.Comment)
        }
      ],
      async (newComment: string) => {
        if (newComment === user.comment) {
          return
        }
        try {
          await locate(IUsersService).updateComment(user.id, newComment)
          user!.comment = newComment
          setUsers([...users!])
          return true
        } catch (e) {
          viewService!.errorKey(langs, e.message)
        }
      }
    )
  }

  const toogleAuthorised = async (user: User) => {
    try {
      const authorised = !user.authorised
      await locate(IUsersService).updateType(user.id, authorised)
      user!.authorised = authorised
      setUsers([...users!])
      return true
    } catch (e) {
      viewService!.errorKey(langs, e.message)
    }
  }
  const toogleEnabled = async (user: User) => {
    try {
      const enabled = !user.enabled
      await locate(IUsersService).updateStatue(user.id, enabled)
      user!.enabled = enabled
      setUsers([...users!])
      return true
    } catch (e) {
      viewService!.errorKey(langs, e.message)
    }
  }

  const deleteUser = (user: User) => {
    viewService.prompt(
      langs.get(LangKeys.Delete) + ': ' + user.id,
      [],
      async () => {
        try {
          await locate(IUsersService).delete(user.id)
          const idx = users!.indexOf(user)
          users!.splice(idx, 1)
          setUsers([...users!])
          return true
        } catch (e) {
          viewService!.errorKey(langs, e.message)
        }
      }
    )
  }

  useEffect(() => {
    fetchUsers(1)
  }, [])

  const renderId = (_: string, user: User) => {
    return <span >{user.id}</span>
  }

  const renderEmail = (_: string, user: User) => {
    return <span>{user.email}</span>
  }

  const renderAuthorised = (_: string, user: User) => {
    return user.enabled ? <Switch checked={user.authorised} onChange={() => toogleAuthorised(user)} /> : null
  }

  const renderAuthorisedExpired = (_: string, user: User) => {
    return (user.enabled && user.authorised) ? <DatePicker showToday={false} clearIcon={false} value={moment(user.authorisedExpired)} onChange={async e => {
      try {
        const date = e!.toDate()
        await locate(IUsersService).updateAuthorisionExpired(user.id, date)
        user!.authorisedExpired = date
        setUsers([...users!])
        return true
      } catch (e) {
        viewService!.errorKey(langs, e.message)
      }
    }} /> : null
  }

  const renderEnabled = (_: string, user: User) => {
    return <Switch checked={user.enabled} onChange={() => toogleEnabled(user)} />
  }

  const renderComment = (_: string, user: User) => {
    return <span onClick={() => updateComment(user)}>{user.comment || ''}</span>
  }

  const renderDelete = (_: string, user: User) => {
    return (
      <Button
        type="link"
        onClick={() => deleteUser(user)}
        danger
        icon={<DeleteFilled />}
      />
    )
  }
  useEffect(() => {
  viewService.setFloatingMenus?.(ManageUsers.name, undefined, <Button
    icon={<PlusOutlined />}
    type="primary"
    size="large" shape="circle"
    onClick={addUser}
  >
  </Button>)
  })
  useEffect(() => {
    return () => {
      viewService.setFloatingMenus?.(ManageUsers.name)
    }
  }, [])
  return (
    <div className="manage-users">
      <Table
        rowKey="id"
        columns={[
          {
            title: langs.get(LangKeys.Name),
            dataIndex: 'id',
            key: 'id',
            className: 'tag-id-column',
            render: renderId
          },
          {
            title: langs.get(LangKeys.Email),
            dataIndex: 'email',
            key: 'email',
            className: 'tag-email-column',
            render: renderEmail
          },
          {
            title: langs.get(LangKeys.Enabled),
            dataIndex: 'enabled',
            key: 'enabled',
            className: 'tag-enabled-column',
            render: renderEnabled
          },
          {
            title: langs.get(LangKeys.AuthorisedUser),
            dataIndex: 'authorised',
            key: 'authorised',
            className: 'tag-authorised-column',
            render: renderAuthorised
          },
          {
            dataIndex: 'authorised-expired',
            key: 'authorised-expired',
            className: 'tag-authorised-expired-column',
            render: renderAuthorisedExpired
          },
          {
            title: langs.get(LangKeys.Comment),
            dataIndex: 'comment',
            key: 'comment',
            render: renderComment
          },
          {
            title: '',
            key: 'delete',
            className: 'tag-delete-column',
            render: renderDelete
          }
        ]}
        dataSource={users}
        pagination={false}
      ></Table>
      {totalCount > countPerPage ? (
        <>
          <Pagination
            className="pagination"
            onChange={(page) => fetchUsers(page)}
            pageSize={countPerPage}
            current={currentPage}
            total={totalCount}
            showSizeChanger={false}
          ></Pagination>
        </>
      ) : null}
    </div>
  )
}
