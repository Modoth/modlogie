import './ManageWords.less'
import { Button, Pagination, Table } from 'antd'
import { FieldInfo } from '../../domain/ServiceInterfaces/IItemsExporter'
import { MinusCircleOutlined, UpCircleOutlined, DownCircleOutlined, PlusCircleOutlined, SearchOutlined, DownloadOutlined, ClearOutlined } from '@ant-design/icons'
import { useServicesLocator } from '../common/Contexts'
import ConfigKeys from '../../domain/ServiceInterfaces/ConfigKeys'
import DictView from './DictView'
import IAnkiItemsExporter from '../../domain/ServiceInterfaces/IAnkiItemsExporter'
import IConfigsService from '../../domain/ServiceInterfaces/IConfigsSercice'
import ICsvItemsExporter from '../../domain/ServiceInterfaces/ICsvItemsExporter'
import IDictService from '../../domain/ServiceInterfaces/IDictService'
import ILangsService, { LangKeys } from '../../domain/ServiceInterfaces/ILangsService'
import IViewService from '../../app/Interfaces/IViewService'
import IWordsStorage, { Word } from '../../domain/ServiceInterfaces/IWordsStorage'
import React, { useState, useEffect } from 'react'
import sleep from '../../infrac/Lang/sleep'
// eslint-disable-next-line camelcase
import { yyyyMMdd_HHmmss } from '../../infrac/Lang/DateUtils'

type WordModel = Word & {removed?:boolean}

export default function ManageWrods () {
  const locator = useServicesLocator()
  const langs = locator.locate(ILangsService)
  const viewService = locator.locate(IViewService)
  const [store] = useState<{url?:string}>({})
  const [words, setWords] = useState<WordModel[]>([])
  const [queryWord, setQueryWord] = useState<WordModel|undefined>()
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
      setQueryWord(words[0])
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

  const toogleWord = (word:WordModel) => {
    if (queryWord !== word) {
      setQueryWord(word)
    } else {
      setQueryWord(undefined)
    }
  }

  useEffect(() => {
    fetchWords(1)
  }, [filter])

  const rendValue = (_: string, word: WordModel) => {
    return <span >{word.value}</span>
  }

  const rendToogleDetail = (_: string, word: WordModel) => {
    return <span >{word === queryWord ? <UpCircleOutlined /> : <DownCircleOutlined />}</span>
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
    return <div><div >{ele}</div>
      {word === queryWord
        ? <div className="dict"><DictView word={word.value} hidenMenu={true}></DictView></div> : undefined}
    </div>
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
        showHeader={false}
        columns={[
          {
            title: '',
            dataIndex: 'toogleDetail',
            key: 'toogleDetail',
            className: 'word-toogle-detail-column',
            render: rendToogleDetail,
            onCell: (word) => ({ onClick: () => toogleWord(word) })
          },
          {
            title: langs.get(LangKeys.Word),
            dataIndex: 'value',
            key: 'value',
            className: 'word-value-column',
            render: rendValue,
            onCell: (word) => ({ onClick: () => toogleWord(word) })
          },
          {
            title: langs.get(LangKeys.Example),
            dataIndex: 'eg',
            key: 'eg',
            className: 'word-eg-column',
            render: rendEg,
            onCell: (word) => ({ onClick: () => toogleWord(word) })
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
          danger
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
            const typeEnum = [LangKeys.Anki, LangKeys.Csv].map(s => langs.get(s))
            const includeExplain = [LangKeys.No, LangKeys.Yes].map(s => langs.get(s))
            const tryExport = async (timeFilter:string, typeFilter:string, explain:string) => {
              let a:HTMLAnchorElement
              let filename:string
              try {
                viewService.setLoading(true)
                let exporter
                let exporterOpt
                const exp = includeExplain.indexOf(explain) === 1
                const typeIdx = typeEnum.indexOf(typeFilter)
                switch (typeIdx) {
                  case 0:
                    exporter = locator.locate(IAnkiItemsExporter)
                    exporterOpt = {
                      front: '{{Front}}',
                      back: '{{FrontSide}}\n\n<hr id="answer">\n\n{{Back}}',
                      css: '.card {\n font-family: arial;\n font-size: 20px;\n text-align: center;\n color: black;\nbackground-color: white;\n}\n'
                    }
                    break
                  case 1:
                    exporter = locator.locate(ICsvItemsExporter)
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
                await sleep(0)
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
                    await sleep(0)
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
                const siteName = await locator.locate(IConfigsService).getValueOrDefault(ConfigKeys.WEB_SITE_NAME)
                const name = `${siteName}_${langs.get(LangKeys.FavoriteWords)}_${yyyyMMdd_HHmmss(new Date())}`
                const buffer = await (exporter.export as any)(name, words as WordWithExplain[], fields, exporterOpt)
                filename = `${name}.${exporter.ext}`
                a = document.createElement('a')
                a.target = '_blank'
                a.download = filename
                if (store.url) {
                  URL.revokeObjectURL(store.url)
                }
                store.url = URL.createObjectURL(new Blob([buffer], { type: 'application/octet-stream' }))
                a.href = store.url!
                try {
                  a.click()
                  return
                } catch (e) {
                  // ignore
                }
              } catch (e) {
                viewService!.errorKey(langs, e.message)
                return
              } finally {
                viewService.setLoading(false)
              }

              locator.locate(IViewService).prompt(langs.get(LangKeys.ExportComplete), [
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
                hint: langs.get(LangKeys.Explain),
                type: 'Enum',
                value: includeExplain[0],
                values: includeExplain
              },
              {
                hint: langs.get(LangKeys.Type),
                type: 'Enum',
                value: typeEnum[0],
                values: typeEnum
              }
            ], async (timeFilter:string, explain:string, typeFilter:string) => {
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
