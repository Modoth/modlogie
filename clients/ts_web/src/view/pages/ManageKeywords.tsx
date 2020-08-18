import React, { useState, useEffect } from 'react'
import './ManageKeywords.less'
import { useUser, useServicesLocator } from '../../app/Contexts'
import { Redirect } from 'react-router-dom'
import { Pagination, Table, Button, Switch, DatePicker } from 'antd'
import { PlusOutlined, DeleteFilled, SearchOutlined, EditOutlined } from '@ant-design/icons'
import ILangsService, { LangKeys } from '../../domain/ILangsService'
import IViewService from '../services/IViewService'
import IUsersService, { User } from '../../domain/IUsersService'
import moment from 'moment'
import IKeywordsService, { Keyword } from '../../domain/IKeywordsService'

export function ManageKeywords() {
  const user = useUser()
  if (!user.editingPermission) {
    return <Redirect to="/" />
  }

  const locator = useServicesLocator()
  const langs = locator.locate(ILangsService)
  const viewService = locator.locate(IViewService)

  const [keywords, setKeywords] = useState<Keyword[]>([])
  const [filter, setFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const countPerPage = 10
  const fetchKeywords = async (page: number) => {
    if (page === undefined) {
      page = currentPage
    }
    try {
      viewService.setLoading(true);
      var [total, keywords] = await locator.locate(IKeywordsService).getAll(filter, countPerPage * (page! - 1), countPerPage)
      setKeywords(keywords)
      setTotalCount(total)
      setCurrentPage(page)
    } catch (e) {
      viewService!.errorKey(langs, e.message)
      viewService.setLoading(false);
      return false
    }
    viewService.setLoading(false);
    window.scrollTo(0, 0);
  }

  const addKeyword = () => {
    viewService.prompt(
      langs.get(LangKeys.Create),
      [
        { type: 'Text', value: '', hint: langs.get(LangKeys.Keyword) },
        { type: 'Text', value: '', hint: langs.get(LangKeys.Url) },
        { type: 'Text', multiline: true, value: '', hint: langs.get(LangKeys.Description) },
      ],
      async (id: string, url: string, description?: string) => {
        if (!id || !url) {
          return
        }
        try {
          await locator.locate(IKeywordsService).add(id, url, description)
          setKeywords([...keywords!, { id, url, description }!])
          return true
        } catch (e) {
          viewService!.errorKey(langs, e.message)
        }
      }
    )
  }

  const updateUrl = (keywword: Keyword) => {
    viewService.prompt(
      langs.get(LangKeys.Modify),
      [
        {
          type: 'Text',
          value: keywword.url,
          hint: langs.get(LangKeys.Url)
        }
      ],
      async (url: string) => {
        if (url === keywword.url || !url) {
          return
        }
        try {
          await locator.locate(IKeywordsService).updateUrl(keywword.id, url);
          keywword!.url = url
          setKeywords([...keywords!])
          return true
        } catch (e) {
          viewService!.errorKey(langs, e.message)
        }
      }
    )
  }

  const updateDescription = (keywword: Keyword) => {
    viewService.prompt(
      langs.get(LangKeys.Modify),
      [
        {
          type: 'Text',
          multiline: true,
          value: keywword.description || '',
          hint: langs.get(LangKeys.Description)
        }
      ],
      async (description: string) => {
        try {
          await locator.locate(IKeywordsService).updateDescription(keywword.id, description);
          keywword!.description = description
          setKeywords([...keywords!])
          return true
        } catch (e) {
          viewService!.errorKey(langs, e.message)
        }
      }
    )
  }

  const deleteKeyword = (keyword: Keyword) => {
    viewService.prompt(
      langs.get(LangKeys.Delete) + ': ' + keyword.id,
      [],
      async () => {
        try {
          await locator.locate(IKeywordsService).delete(keyword.id);
          const idx = keywords!.indexOf(keyword)
          keywords!.splice(idx, 1)
          setKeywords([...keywords!])
          return true
        } catch (e) {
          viewService!.errorKey(langs, e.message)
        }
      }
    )
  }

  useEffect(() => {
    fetchKeywords(1);
  }, [])

  useEffect(() => {
    fetchKeywords(1);
  }, [filter])

  const renderId = (_: string, keyword: Keyword) => {
    return <span onClick={() => {
      const title = keyword.id
      const url = keyword.url
      const desc = keyword.description;
      locator.locate(IViewService).prompt(
        url ? { title, subTitle: locator.locate(ILangsService).get(LangKeys.ComfireJump) + url } : title, [
        ...(desc ? [{
          type: 'Markdown',
          value: desc
        }] : [])
      ], async () => {
        if (!url) {
          return
        }
        if (new URL(url!).hostname === window.location.hostname) {
          window.location.href = url!;
        } else {
          window.open(url, '_blank');
        }
        return true;
      })
    }}>{keyword.id}</span>
  }

  const renderUrl = (_: string, keyword: Keyword) => {
    return <span onClick={() => updateUrl(keyword)}>{keyword.url}</span>
  }

  const rendeDescription = (_: string, keyword: Keyword) => {
    return <span onClick={() => updateDescription(keyword)}><Button
      type="link"
      icon={<EditOutlined />}
    /><span className='description'>{keyword.description || ''}</span></span>
  }

  const renderDelete = (_: string, keyword: Keyword) => {
    return (
      <Button
        type="link"
        onClick={() => deleteKeyword(keyword)}
        danger
        icon={<DeleteFilled />}
      />
    )
  }
  return (
    <div className="manage-keywords">
      <Table
        rowKey="id"
        columns={[
          {
            title: langs.get(LangKeys.Name),
            dataIndex: 'id',
            key: 'id',
            className: 'keyword-id-column',
            render: renderId
          },
          {
            title: langs.get(LangKeys.Url),
            dataIndex: 'url',
            key: 'url',
            render: renderUrl
          },
          {
            title: langs.get(LangKeys.Description),
            dataIndex: 'description',
            key: 'description',
            render: rendeDescription
          },
          {
            title: '',
            key: 'delete',
            className: 'keyword-delete-column',
            render: renderDelete
          }
        ]}
        dataSource={keywords}
        pagination={false}
      ></Table>
      {totalCount > countPerPage ? (
        <>
          <Pagination
            className="pagination"
            onChange={(page) => fetchKeywords(page)}
            pageSize={countPerPage}
            current={currentPage}
            total={totalCount}
            showSizeChanger={false}
          ></Pagination>
        </>
      ) : null}

      <div className="float-menus">
        <Button
          icon={<SearchOutlined />}
          type={filter ? 'primary' : "default"}
          size="large" shape="circle"
          onClick={() => {
            locator.locate(IViewService).prompt(langs.get(LangKeys.Search), [
              {
                type: 'Text',
                value: filter || '',
                hint: langs.get(LangKeys.Search)
              }
            ], async (filter: string) => {
              setFilter(filter)
              return true;
            })
          }}
        >
        </Button>
        <Button
          icon={<PlusOutlined />}
          type="default"
          size="large" shape="circle"
          onClick={addKeyword}
        >
        </Button>
      </div>
    </div >
  )
}
