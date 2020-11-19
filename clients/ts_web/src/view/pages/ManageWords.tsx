import './ManageWords.less'
import { Button, Pagination, Table } from 'antd'
import { FieldInfo } from '../../domain/ServiceInterfaces/IItemsExporter'
import { MinusCircleOutlined, PlusCircleOutlined, SearchOutlined, DownloadOutlined, ClearOutlined } from '@ant-design/icons'
import { useServicesLocator } from '../common/Contexts'
import IAnkiItemsExporter from '../../domain/ServiceInterfaces/IAnkiItemsExporter'
import ICsvItemsExporter from '../../domain/ServiceInterfaces/ICsvItemsExporter'
import IDictService from '../../domain/ServiceInterfaces/IDictService'
import ILangsService, { LangKeys } from '../../domain/ServiceInterfaces/ILangsService'
import IViewService from '../../app/Interfaces/IViewService'
import IWordsStorage, { Word } from '../../domain/ServiceInterfaces/IWordsStorage'
import React, { useState, useEffect } from 'react'

type WordModel = Word & {removed?:boolean}

export default function ManageWrods () {
  const locator = useServicesLocator()
  const langs = locator.locate(ILangsService)
  const viewService = locator.locate(IViewService)
  const [store] = useState<{url?:string}>({})
  const [words, setWords] = useState<WordModel[]>([])
  const [filter, setFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const countPerPage = 10
  const fetchWords = async (page: number) => {
    if (page === undefined) {
      page = currentPage
    }
    try {
      viewService.setLoading(true)
      const [total, words] = await locator.locate(IWordsStorage).getAll(filter, countPerPage * (page! - 1), countPerPage)
      setWords(words)
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

  const reAddWord = async (word: WordModel) => {
    try {
      await locator.locate(IWordsStorage).add(word.value, word.eg)
      word.removed = undefined
      // words.splice(words.indexOf(word), 1)
      // words.unshift(word)
      setWords([...words!])
      return true
    } catch (e) {
      viewService!.errorKey(langs, e.message)
    }
  }

  const deleteWord = async (word: WordModel) => {
    try {
      await locator.locate(IWordsStorage).delete(word.value)
      word.removed = true
      setWords([...words!])
      return true
    } catch (e) {
      viewService!.errorKey(langs, e.message)
    }
  }

  useEffect(() => {
    fetchWords(1)
    return () => {
      if (store.url) {
        URL.revokeObjectURL(store.url)
      }
    }
  }, [])

  useEffect(() => {
    fetchWords(1)
  }, [filter])

  const rendValue = (_: string, word: WordModel) => {
    return <span >{word.value}</span>
  }

  const rendEg = (_: string, word: WordModel) => {
    const tokens = (word.eg || '').split(word.value)
    const ele:JSX.Element[] = []
    for (let i = 0; i < tokens.length; i++) {
      if (i !== 0) {
        ele.push(<span className="word">{word.value}</span>)
      }
      ele.push(<span>{tokens[i]}</span>)
    }
    return <span >{ele}</span>
  }

  const rendToogle = (_: string, word: WordModel) => {
    return (
      <Button onClick={() => {
        if (!word.removed) {
          deleteWord(word)
        } else {
          reAddWord(word)
        }
      }} type="link" icon={!word.removed ? < MinusCircleOutlined /> : <PlusCircleOutlined />}></Button>

    )
  }
  return (
    <div className="manage-words">
      <Table
        rowKey="value"
        columns={[
          {
            title: langs.get(LangKeys.Word),
            dataIndex: 'value',
            key: 'value',
            className: 'word-value-column',
            render: rendValue
          },
          {
            title: langs.get(LangKeys.Example),
            dataIndex: 'eg',
            key: 'eg',
            className: 'word-eg-column',
            render: rendEg
          },
          {
            title: '',
            key: 'toogle',
            className: 'word-toogle-column',
            render: rendToogle
          }
        ]}
        dataSource={words}
        pagination={false}
      ></Table>
      {totalCount > countPerPage ? (
        <>
          <Pagination
            className="pagination"
            onChange={(page) => fetchWords(page)}
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
          type={filter ? 'primary' : 'default'}
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
              return true
            })
          }}
        >
        </Button>
        <Button
          icon={<ClearOutlined />}
          type="primary"
          size="large" shape="circle"
          onClick={() => {
            locator.locate(IViewService).prompt(langs.get(LangKeys.Delete), [],
              async () => {
                (async () => {
                  try {
                    viewService.setLoading(true)
                    await locator.locate(IWordsStorage).deleteAll()
                  } catch (e) {
                    viewService!.errorKey(langs, e.message)
                    viewService.setLoading(false)
                    return false
                  }
                })()
                return true
              })
          }}
        >
        </Button>
        <Button
          icon={<DownloadOutlined />}
          type="primary"
          size="large" shape="circle"
          onClick={() => {
            const timeEnum = [LangKeys.All, LangKeys.LatestDay, LangKeys.LatestWeek, LangKeys.LatestMonth].map(s => langs.get(s))
            const typeEnum = [LangKeys.Csv, LangKeys.Anki].map(s => langs.get(s))
            const includeExplain = [LangKeys.No, LangKeys.Yes].map(s => langs.get(s))
            const tryExport = async (timeFilter:string, typeFilter:string, explain:string) => {
              let a:HTMLAnchorElement
              let filename:string
              try {
                viewService.setLoading(true)
                let exporter
                const exp = includeExplain.indexOf(explain) === 1
                const typeIdx = typeEnum.indexOf(typeFilter)
                switch (typeIdx) {
                  case 0:
                    exporter = locator.locate(ICsvItemsExporter)
                    break
                  case 1:
                    exporter = locator.locate(IAnkiItemsExporter)
                    break
                  default:
                    return
                }
                const timeIdx = timeEnum.indexOf(timeFilter)
                let timeStart = 0
                const now = new Date()
                switch (timeIdx) {
                  case 1:
                    timeStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).valueOf()
                    break
                  case 2:
                    timeStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay()).valueOf()
                    break
                  case 3:
                    timeStart = new Date(now.getFullYear(), now.getMonth()).valueOf()
                    break
                }
                let _ = 0
                let words
                type WordWithExplain = Word & {explain?:string}
                const wordsStorage = locator.locate(IWordsStorage)
                if (timeStart) {
                  words = await wordsStorage.getAfter(timeStart, filter)
                } else {
                  [_, words] = await wordsStorage.getAll(filter)
                }
                if (exp) {
                  const dictSercice = locator.locate(IDictService)
                  for (const w of words) {
                    (w as WordWithExplain).explain = await dictSercice.query(w.value)
                  }
                }
                const fields:FieldInfo<WordWithExplain>[] = [
                  {
                    name: langs.get(LangKeys.Word),
                    get: (word:WordWithExplain) => word.value
                  },
                  {
                    name: langs.get(LangKeys.Example),
                    get: (word:WordWithExplain) => word.eg || ''
                  }
                ]
                if (exp) {
                  fields.push({
                    name: langs.get(LangKeys.Explain),
                    get: (word:WordWithExplain) => word.explain || ''
                  })
                }
                const buffer = await exporter.export(words as WordWithExplain[], fields)
                filename = `${Date.now()}.${exporter.ext}`
                a = document.createElement('a')
                a.target = '_blank'
                a.download = filename
                if (store.url) {
                  URL.revokeObjectURL(store.url)
                }
                store.url = URL.createObjectURL(new Blob([buffer], { type: 'application/octet-stream' }))
                a.href = store.url!
              } catch (e) {
                viewService!.errorKey(langs, e.message)
                viewService.setLoading(false)
                return
              }

              locator.locate(IViewService).prompt(`${langs.get(LangKeys.Export)}:${filename}`, [
              ], async () => {
                a.click()
                return true
              })
            }
            locator.locate(IViewService).prompt(langs.get(LangKeys.Export), [
              {
                hint: langs.get(LangKeys.Time),
                type: 'Enum',
                value: timeEnum[0],
                values: timeEnum
              },
              {
                hint: langs.get(LangKeys.Type),
                type: 'Enum',
                value: typeEnum[0],
                values: typeEnum
              },
              {
                hint: langs.get(LangKeys.Explain),
                type: 'Enum',
                value: includeExplain[0],
                values: includeExplain
              }
            ], async (timeFilter:string, typeFilter:string, explain:string) => {
              (() => {
                tryExport(timeFilter, typeFilter, explain)
              })()
              return true
            })
          }}
        >
        </Button>
      </div>
    </div >
  )
}
