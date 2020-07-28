import React, { useState, useEffect } from 'react'
import {
  ArticleType,
  ArticleContentEditorCallbacks,
  ArticleContentType,
} from '../../plugins/IPluginInfo'
import Article, { ArticleFile, ArticleContent, ArticleTag } from '../../domain/Article'
import { useUser, useServicesLocator } from '../../app/Contexts'
import ILangsService, { LangKeys } from '../../domain/ILangsService'
import IViewService from '../services/IViewService'
import { Card, Button, Select, TreeSelect } from 'antd'
import {
  UploadOutlined,
  CheckOutlined,
  EditOutlined,
  FileAddOutlined,
  FileExcelOutlined,
  ContainerOutlined,
  ShareAltOutlined,
  PrinterOutlined,
  CloseOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import './ArticleView.less'
import IArticleListService from '../../domain/IArticleListService'
import classNames from 'classnames'
import { generateRandomStyle } from './common'
import ITagsService, { TagNames, Tag } from '../../domain/ITagsService'
import IArticleViewServie from '../services/IArticleViewService'
import Langs from '../Langs'
import IArticleService from '../../domain/IArticleService'
import IConfigsService from '../../domain/IConfigsSercice'
import { title } from 'process'
import { spawn } from 'child_process'
import SubjectViewModel from './SubjectViewModel'
import html2canvas from 'html2canvas';

const { Option } = Select

const generateNewFileNames = (name: string, existedName: Set<string>) => {
  while (existedName.has(name)) {
    let match = name.match(/^(.*?)(_(\d*))?(\.\w*)$/)
    if (match) {
      name = match[1] + '_' + ((parseInt(match[3]) || 0) + 1) + match[4]
    }
    else {
      return name
    }
  }
  return name
}

export default function ArticleView(props: {
  article: Article;
  articleHandlers: { onDelete: { (id: string): void }, editingArticle?: Article };
  type: ArticleType;
  subjects: SubjectViewModel[];
  tags: ArticleTag[];
  nodeTags: Map<string, Tag>
}) {
  const user = useUser()
  const locator = useServicesLocator()
  const langs = locator.locate(ILangsService)
  const viewService = locator.locate(IViewService)
  const articleListService = locator.locate(IArticleListService)
  const [files, setFiles] = useState(props.article.files)
  const [tagsDict, setTagsDict] = useState(props.article.tagsDict)
  const [subjectId, setSubjectId] = useState(props.article.subjectId)
  const [editing, setEditing] = useState(props.articleHandlers.editingArticle === props.article)
  const [editorRefs, setEditorRefs] = useState<ArticleContentEditorCallbacks<ArticleContent>>(
    {} as any
  )
  const [type, setType] = useState<ArticleContentType | undefined>(undefined)
  const [inArticleList, setInArticleList] = useState(articleListService.has(props.article))
  const [content, setContent] = useState(props.article.content || {})
  const [name, setName] = useState(props.article.name)

  const addFile = (file?: File) => {
    viewService.prompt(
      langs.get(LangKeys.Import),
      [
        {
          type: 'File',
          value: file
        }
      ],
      async (file: File) => {
        try {
          viewService.setLoading(true)
          const fileService = locator.locate(IArticleService)
          const articleService = locator.locate(IArticleService)
          const [id, url] = await fileService.addFile(props.article.id!, file.type, new Uint8Array(await file.arrayBuffer()))
          const newFiles = [...(files || [])]
          const newFileName = generateNewFileNames(file.name, new Set(newFiles.map(f => f.name!)))
          const newFile = { name: newFileName, id, url }
          newFiles.push(newFile)
          await articleService.updateContent(
            JSON.stringify({
              content,
              files: newFiles
            }),
            props.article.id!,
            newFiles.map((f) => f.id!)
          )
          setFiles(newFiles)
          editorRefs && editorRefs.addFile(newFile)
          viewService.setLoading(false)
          return true
        } catch (e) {
          viewService.setLoading(false)
          viewService!.errorKey(langs, e.message)
          return false
        }
      }
    )
  }

  const updateSubjectId = async (sid: string) => {
    const api = locator.locate(IArticleService)
    try {
      await api.move(props.article.id!, sid)
      setSubjectId(sid)
    } catch (e) {
      viewService!.errorKey(langs, e.message)
    }
  }

  const toggleEditing = async () => {
    if (!editing) {
      setEditing(true)
      return
    }
    try {
      const service = locator.locate(IArticleService);
      const newContent = editorRefs.getEditedContent()
      if (
        newContent.sections !== undefined &&
        newContent.sections !== content?.sections
      ) {
        await service.updateContent(JSON.stringify({ content: newContent, files: files }), props.article.id!, files ? files.map((f) => f.id!) : undefined)
        setContent(newContent)
      }
      setEditing(false)
    } catch (e) {
      viewService!.errorKey(langs, e.message)
    }
  }

  const updateTag = async (tag: ArticleTag, tagValue: string) => {
    const service = locator.locate(IArticleService)
    try {
      await service.updateTags(props.article.id!, { id: tag.id!, value: tagValue });
      const newTags = tagsDict || new Map()
      let newTag: ArticleTag
      if (!newTags.has(tag.name)) {
        newTag = {
          id: tag.id,
          name: tag.name,
          // type: NodeTag.TypeEnum.Enum,
          value: tagValue,
          values: tag.values
        }
        newTags.set(tag.name, newTag)
      } else {
        newTag = newTags.get(tag.name)
        newTag!.value = tagValue
      }
      tagsDict?.set(newTag.name!, newTag)
      if (newTag.name === props.type.subTypeTag) {
        setType(await locator.locate(IArticleViewServie)
          .getArticleType(locator.locate(IConfigsService), props.type, props.type.subTypeTag ? tagsDict?.get(props.type.subTypeTag!)?.value : undefined))
      }
    } catch (e) {
      viewService!.errorKey(langs, e.message)
    }
  }
  const updateArticleName = () => {
    viewService.prompt(
      langs.get(LangKeys.Modify),
      [
        {
          type: 'Text',
          value: name,
          hint: langs.get(LangKeys.Name)
        }
      ],
      async (newName: string) => {
        if (!newName) {
          return
        }
        const service = locator.locate(IArticleService)
        try {
          await service.rename(newName, props.article.id!)
        } catch (e) {
          viewService!.errorKey(langs, e.message)
          return
        }
        props.article.name = newName
        setName(newName)
        return true
      }
    )
  }
  // generateRandomStyle()
  useEffect(() => {
    locator.locate(IArticleViewServie)
      .getArticleType(locator.locate(IConfigsService), props.type, props.type.subTypeTag ? tagsDict?.get(props.type.subTypeTag!)?.value : undefined).then(type => setType(type));
  }, [])
  if (!type) {
    return <></>
  }
  return (
    <Card className={classNames("article-view")}>
      <div className="article-title">
        {props.type.noTitle ? <div></div> : <div onClick={(user && !props.type.noTitle) ? updateArticleName : undefined}>{name}</div>}
        {
          editing ? null : (<div className={classNames("actions-list")}>{[...(user ? [
            <Button type="link" danger ghost icon={<DeleteOutlined />} onClick={() =>
              props.articleHandlers.onDelete(props.article.id!)
            } key="delete"></Button>] : []),
          inArticleList ?
            <Button type="link" ghost danger icon={<PrinterOutlined />} onClick={() => {
              articleListService.remove(props.article)
              setInArticleList(articleListService.has(props.article))
            }}
              key={LangKeys.RemoveFromArticleList}></Button> :
            <Button type="link" ghost icon={<PrinterOutlined />} onClick={() => {
              articleListService.add(props.article, type, () => {
                setInArticleList(false);
              })
              setInArticleList(articleListService.has(props.article))
            }}
              key={LangKeys.AddToArticleList}></Button>,
          ...(user ? [<Button type="link" ghost icon={<EditOutlined />} onClick={toggleEditing}
            key="edit"></Button>
          ] : [])]} </div>)
        }
      </div>
      <div className="article-body">
        {editing ? (
          <props.type.Editor
            onpaste={addFile}
            content={content}
            files={files}
            callbacks={editorRefs}
            type={type}
          />
        ) : (
            <props.type.Viewer content={content} files={files} type={type} onClick={() => {
              locator.locate(IViewService).previewArticle({ name, content, files }, type)
            }} />
          )}
      </div>
      {editing ? (<div className="actions-tags-list">{[
        <TreeSelect
          key="subject"
          onChange={updateSubjectId}
          defaultValue={subjectId}
          treeData={props.subjects}
          placeholder={langs.get(LangKeys.Subject)}
        />,
        ...props.tags.map((tag) => (
          <Select
            key={tag.name}
            onChange={(value) => updateTag(tag, value)}
            defaultValue={
              tagsDict?.get(tag.name)?.value || `(${tag.name})`
            }
          >
            <Option value={undefined!}>{`(${tag.name})`}</Option>
            {...tag.values.map((v) => (
              <Option key={v} value={v}>
                {v}
              </Option>
            ))}
          </Select>
        ))
      ]}</div>) : null
      }
      {editing ? (
        <>
          <div className="files-list">
            <Button
              type="link"
              onClick={toggleEditing}
              key="endEdit"
              icon={<CheckOutlined />}
            >{langs.get(LangKeys.Ok)}</Button>,
            <Button
              type="link"
              icon={<UploadOutlined />}
              onClick={() => addFile()}
            >{langs.get(LangKeys.Import)}</Button>
            {/* {files?.length
              ? files!.map((file) => (
                <ArticleFileViewer
                  key={file.url}
                  file={file}
                  onClick={() => editorRefs.addFile(file)}
                  onDelete={() => deleteFile(file)}
                ></ArticleFileViewer>
              ))
              : null} */}
          </div>
        </>
      ) : null}
    </Card>
  )
}
