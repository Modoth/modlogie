import './ManageWords.less'
import { Button, Pagination, Table } from 'antd'
import { HeartFilled, HeartOutlined, SearchOutlined, DownloadOutlined } from '@ant-design/icons'
import { useServicesLocator } from '../common/Contexts'
import IAnkiWordsExporter from '../../domain/ServiceInterfaces/IAnkiWordsExporter'
import ICsvWordsExporter from '../../domain/ServiceInterfaces/ICsvWordsExporter'
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
  const countPerPage = 100
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
      words.splice(words.indexOf(word))
      words.unshift(word)
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

  const renderEg = (_: string, word: WordModel) => {
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

  const rendAdded = (_: string, word: WordModel) => {
    return <span >{new Date(word.added).toLocaleDateString()}</span>
  }

  const rendToogle = (_: string, word: WordModel) => {
    return (
      <Button onClick={() => {
        if (!word.removed) {
          deleteWord(word)
        } else {
          reAddWord(word)
        }
      }} type="link" icon={!word.removed ? < HeartFilled /> : <HeartOutlined />}></Button>

    )
  }
  return (
    <div className="manage-words">
      <Table
        rowKey="id"
        columns={[
          {
            title: langs.get(LangKeys.Name),
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
            render: renderEg
          },
          {
            title: langs.get(LangKeys.AddedTime),
            dataIndex: 'added',
            key: 'added',
            className: 'word-added-column',
            render: rendAdded
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
          icon={<DownloadOutlined />}
          size="large" shape="circle"
          onClick={() => {
            const timeEnum = [LangKeys.All, LangKeys.LatestDay, LangKeys.LatestWeek, LangKeys.LatestMonth].map(s => langs.get(s))
            const typeEnum = [LangKeys.Csv, LangKeys.Anki].map(s => langs.get(s))
            const tryExport = async (timeFilter:string, typeFilter:string) => {
              let exporter
              const typeIdx = typeEnum.indexOf(typeFilter)
              switch (typeIdx) {
                case 0:
                  exporter = locator.locate(ICsvWordsExporter)
                  break
                case 1:
                  exporter = locator.locate(IAnkiWordsExporter)
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
              const wordsStorage = locator.locate(IWordsStorage)
              if (timeStart) {
                words = await wordsStorage.getAfter(timeStart, filter)
              } else {
                [_, words] = await wordsStorage.getAll(filter)
              }
              console.log(words)
              const buffer = await exporter.export(words)
              const filename = `${Date.now()}.${exporter.ext}`
              const a = document.createElement('a')
              a.target = '_blank'
              a.download = filename
              if (store.url) {
                URL.revokeObjectURL(store.url)
              }
              store.url = URL.createObjectURL(new Blob([buffer], { type: 'application/octet-stream' }))
              a.href = store.url!

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
              }
            ], async (timeFilter:string, typeFilter:string) => {
              tryExport(timeFilter, typeFilter)
              return true
            })
          }}
        >
        </Button>
      </div>
    </div >
  )
}
