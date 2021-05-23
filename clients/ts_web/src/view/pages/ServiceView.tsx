import './ServiceView.less'
import { ArticleContentType } from '../../pluginbase/IPluginInfo'
import { ArticleFolder } from './ArticleFolder'
import { ArticlePreview } from './ArticlePreview'
import { LocateFunction } from '../../infrac/ServiceLocator/IServicesLocator'
import { Spin, message, Modal, Input, Space, Radio, TreeSelect, Button } from 'antd'
import { useServicesLocate } from '../common/Contexts'
import Article from '../../domain/ServiceInterfaces/Article'
import ArticleList from './ArticleList'
import ArticleSingle from './ArticleSingle'
import classNames from 'classnames'
import html2canvas from 'html2canvas'
import IHistoryService from '../../domain/ServiceInterfaces/IHistoryService'
import ILangsService, { LangKeys } from '../../domain/ServiceInterfaces/ILangsService'
import ImageEditor from '../../infrac/components/ImageEditor'
import IViewService, { IPromptField } from '../../app/Interfaces/IViewService'
import QrCode from '../../infrac/components/QrCode'
import React, { useState, useRef } from 'react'
import TextArea from 'antd/lib/input/TextArea'

const setScrollable = (s: boolean) => {
  document.body.style.overflow = s ? '' : 'hidden'
}

export const previewArticleByPath = (locate: LocateFunction, pathOrName: string | undefined, title: string | undefined, root?:string|undefined) => {
  if (!pathOrName) {
    return undefined
  }
  const url = `#article${pathOrName}`
  return () => {
    locate(IViewService).prompt(
      { title: title || '', subTitle: locate(ILangsService).get(LangKeys.ComfireJump) + url }, [
        {
          type: 'Article',
          value: pathOrName
        }], async () => {
        window.location.href = url
        return true
      })
  }
}

export class ViewService implements IViewService {
  errorKey (langs: ILangsService, key: any, timeout?: number | undefined): void {
    this.error(langs.get(key), timeout)
  }

  error (msg: string, timeout: number = 1000): void {
    message.error(msg, timeout / 1000)
  }

  constructor (public setLoading: any,
    public prompt: any,
    public previewImage: any,
    public previewArticleList: any,
    public previewArticle: any,
    public captureElement: any,
    public onShowMenuChanged: any) { }
}

export default function ServiceView (props: {
  setContentVisiable: { (visiable: boolean): void }
}) {
  const locate = useServicesLocate()
  const langs = locate(ILangsService)
  const viewService = locate(IViewService)
  const refFile = useRef<HTMLInputElement | null>(null)
  const [loading, setLoading] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [modalSubTitle, setModalSubTitle] = useState('')
  const [modalVisible, setModalVisible] = useState(false)
  const [modalImageField, setModalImageField] = useState(false)
  const [modalViewField, setModalViewField] = useState(false)
  const [modalPromise, setModalPromise] = useState({ resolve: null as any, reject: null as any })
  const [modalFileFieldData, setModalFileFieldData] = useState<
    File | undefined
  >(undefined)
  const [modalFields, setModalFileds] = useState<IPromptField<any, any>[]>([])
  const [onModalOk, setOnModalOk] = useState<{
    onOk?(...p: any): Promise<boolean | undefined>;
  }>()

  const [previewImgUrl, setPreviewImgUrl] = useState('')

  const [previewArticleList, setPreviewArticleList] = useState(false)
  const [previewArticle, setPreviewArticle] = useState<{ article: Article, type: ArticleContentType, onclose?: {(): void } } | undefined>(undefined)

  const updateField = (
    i: number,
    field: IPromptField<any, any>,
    value: any
  ) => {
    modalFields.splice(i, 1, Object.assign({}, field, { value }))
    setModalFileds([...modalFields])
  }

  const applyModal = async () => {
    if (!onModalOk!.onOk || await onModalOk!.onOk(...modalFields.map((f) => f.value))) {
      cancleModal(true)
    }
  }

  const resolveModalPromise = (value: boolean) => {
    const resolve = modalPromise.resolve
    modalPromise.resolve = null
    modalPromise.reject = null
    if (resolve) {
      resolve(value)
    }
  }

  const cancleModal = (success = false) => {
    refFile.current!.onchange = null
    refFile.current!.value = ''
    setModalTitle('')
    setModalSubTitle('')
    setModalVisible(false)
    setScrollable(true)
    setModalFileds([])
    setOnModalOk(undefined)
    setModalImageField(false)
    setModalViewField(false)
    setModalFileFieldData(undefined)
    resolveModalPromise(success)
  }
  const fPrompt = async (
    title: string | { title: string, subTitle: string },
    fields: IPromptField<any, any>[],
    onOk?: (...paras: any) => Promise<boolean | undefined>,
    tryPreviewFile = true
  ): Promise<boolean> => {
    return new Promise(resolve => {
      resolveModalPromise(false)
      modalPromise.resolve = resolve
      const setStates = () => {
        if (typeof title === 'string') {
          setModalTitle(title)
        } else {
          setModalTitle(title.title)
          setModalSubTitle(title.subTitle)
        }
        setModalFileds(fields)
        setOnModalOk({ onOk })
        setModalVisible(true)
        setScrollable(false)
        setModalFileFieldData(undefined)
      }
      const singleField = fields.length === 1 ? fields[0] : undefined
      if (!singleField) {
        setStates()
        return
      }
      const imageField = singleField.type === 'Image'
      const textFileField = singleField.type === 'TextFile'
      const videoFileField = singleField.type === 'Video'
      const binFileField = singleField.type === 'File'
      const fileField = binFileField || imageField || textFileField || videoFileField
      setModalViewField((singleField.type === 'View'))
      if (!fileField) {
        setStates()
        return
      }
      const allAccept = '*/*'
      let accept = allAccept
      let onchange: (file: File) => void

      const handleImage = (file: File) => {
        setStates()
        setModalFileFieldData(file)
        setModalImageField(true)
      }
      const handleText = (file: File) => {
        const reader = new FileReader()
        reader.onload = () => {
          setStates()
          setModalFileds([{
            ...fields[0],
            value: binFileField
              ? Object.assign(file, { preview: true, previewContent: reader.result })
              : reader.result
          }])
        }
        reader.readAsText(file)
      }
      const handleVideo = (file: File) => {
        onOk?.(file)
        resolveModalPromise(true)
      }

      if (imageField) {
        accept = 'image/*'
        onchange = handleImage
      } else if (textFileField) {
        accept = 'text/*'
        onchange = handleText
      } else if (videoFileField) {
        accept = 'video/*'
        onchange = handleVideo
      }

      const handleFile = (file: File, e?: any) => {
        if (onchange) {
          onchange(file)
          return
        }
        const startsWith = (s: string) => file.type.startsWith(s)
        if (tryPreviewFile) {
          if (
            startsWith('text/') ||
            startsWith('application/json') ||
            startsWith('application/x-yaml')
          ) {
            singleField.type = 'TextFile'
            handleText(file)
            return
          }
          if (startsWith('image/')) {
            singleField.type = 'Image'
            handleImage(file)
            return
          }
          if (startsWith('video/')) {
            singleField.type = 'Video'
            handleVideo(file)
            if (e) {
              e.target.value = ''
            }
            return
          }
        }
        onOk?.(file)
        resolveModalPromise(true)
        if (e) {
          e.target.value = ''
        }
      }

      if (singleField.value) {
        handleFile(singleField.value)
        return
      }

      refFile.current!.accept = fields[0].accept || (accept !== allAccept ? accept : '')
      refFile.current!.onchange = (e: any) => {
        const file: File = e.target.files && e.target.files![0]
        if (!file) {
          return
        }
        handleFile(file, e)
      }
      refFile.current!.click()
    })
  }
  const fPreviewImage = (url: string) => {
    setScrollable(!url)
    setPreviewImgUrl(url)
  }
  const fPreviewArticleList = (visiable: boolean): void => {
    if (visiable === previewArticleList) {
      return
    }
    props.setContentVisiable(!visiable)
    setPreviewArticleList(visiable)
  }
  const fPreviewArticle = (article: Article, type: ArticleContentType, onclose?: { (): void }): void => {
    if (article) {
      props.setContentVisiable(false)
      setPreviewArticle({ article, type, onclose })
      locate(IHistoryService).add(article.path!, article.name!)
    } else {
      props.setContentVisiable(true)
      setPreviewArticle(undefined)
      if (onclose) {
        onclose()
      } else if (previewArticle?.onclose) {
        previewArticle.onclose()
      }
    }
  }
  const fCaptureElement = async (element: HTMLElement | undefined, fallback = false): Promise<void> => {
    if (!element) {
      return
    }
    try {
      viewService.setLoading(true)
      const canvas = await html2canvas(element, fallback ? { height: window.innerHeight * 2 } : undefined)
      const imgUrl = canvas.toDataURL('image/png')
      if (imgUrl === 'data:,') {
        if (!fallback) {
          await fCaptureElement(element, true)
          return
        }
        viewService.error(langs.get(LangKeys.ScreenShotTooHuge), 2000)
        return
      }
      if (fallback) {
        viewService.error(langs.get(LangKeys.ScreenShotCutted), 2000)
      }
      viewService.previewImage(imgUrl)
    } catch (e) {
      // viewService!.errorKey(locate(ILangsService), LangKeys.UnknownError)
    } finally {
      viewService.setLoading(false)
    }
  }
  Object.assign(viewService, {
    setLoading,
    prompt: fPrompt,
    previewImage: fPreviewImage,
    previewArticleList: fPreviewArticleList,
    previewArticle: fPreviewArticle,
    captureElement: fCaptureElement
  })

  const previewImgRef = React.createRef<HTMLImageElement>()

  return (
    <>
      <input type="file" className="hidden" ref={refFile}></input>
      <Modal
        title={modalSubTitle ? <><div className='title'>
          {modalTitle}
        </div>
        <div className='sub-title'>
          {modalSubTitle}
        </div></> : <div className='title'>
          {modalTitle}
        </div>}
        visible={modalVisible}
        onOk={applyModal}
        onCancel={() => cancleModal(false)}
        closable = {false}
        footer={(modalImageField || modalViewField || !onModalOk?.onOk) ? null : undefined}
        bodyStyle={
          modalFields.length
            ? (modalImageField || modalViewField)
              ? { padding: 5 }
              : {}
            : { display: 'None' }
        }
        className={classNames(modalFields.length ? '' : 'empty-modal', modalViewField ? 'content-height' : '')}
      >
        <Space direction="vertical" className="modal-fields">
          {modalFields.map((field, i) => {
            switch (field.type) {
              case 'TreeSelect':
                return (
                  <TreeSelect
                    key={i}
                    autoFocus
                    className="tree-select"
                    onChange={(sid: string) => {
                      updateField(i, field, sid)
                    }}
                    defaultValue={field.value}
                    treeData={field.values}
                    placeholder={field.hint}
                  />
                )
              case 'Text':
                return (
                  field.multiline
                    ? <TextArea
                      key={i}
                      value={field.value}
                      onChange={(e) => updateField(i, field, e.target.value)}
                      placeholder={field.hint}
                    ></TextArea>
                    : <Input
                      suffix={field.icon}
                      key={i}
                      value={field.value}
                      onChange={(e) => updateField(i, field, e.target.value)}
                      placeholder={field.hint}
                    ></Input>
                )
              case 'Enum':
                return (
                  <div key={i} className="enum"><span className="enum-title">{field.hint || ''}</span>
                    <Radio.Group onChange={(e) => updateField(i, field, e.target.value)} value={field.value}>
                      {
                        field.values ? field.values.map(value => <Radio key={value} value={value}>{value}</Radio>) : []
                      }
                    </Radio.Group>
                  </div>
                )
              case 'Label':
                return (
                  <label key={i}>{field.value}</label>
                )
              case 'QrCode':
                return (<div className="service-view-qrcode"><QrCode content={field.value}></QrCode></div>)
              case 'Article':
                return (<ArticlePreview className="md" root={field.value.root} pathOrName={field.value.root ? field.value.name : field.value}></ArticlePreview>)
              case 'FolderOrArticle':
                return <ArticleFolder path={field.value}></ArticleFolder>
              case 'Password':
                return (
                  <Input.Password
                    suffix={field.icon}
                    key={i}
                    value={field.value}
                    onChange={(e) => updateField(i, field, e.target.value)}
                    placeholder={field.hint}
                  ></Input.Password>
                )
              case 'Image':
                return (
                  <ImageEditor key={i}
                    closed={(image: any) => {
                      if (image && !image.name) {
                        image.name = modalFileFieldData?.name
                      }
                      updateField(i, field, image)
                      applyModal()
                    }}
                    image={modalFileFieldData}
                  ></ImageEditor>
                )
              case 'TextFile':
                return <textarea key={i} rows={10} value={field.value && (field.value as any).preview ? (field.value as any).previewContent : field.value}></textarea>
              case 'View':
              {
                return <div key={i}>{field.value}</div>
              }
              default:
                return <span key={i}>{field.value}</span>
            }
          })}
        </Space>
      </Modal>
      {
        previewImgUrl

          ? <>

            <div className="img-preview" onClick={() => fPreviewImage('')}>
              <div className="img-panel" >
                <img ref={previewImgRef} src={previewImgUrl}></img>
              </div>
            </div>
          </>
          : null
      }
      {
        previewArticleList ? <ArticleList></ArticleList> : null
      }
      {
        previewArticle ? <ArticleSingle key={previewArticle.article.id} {...previewArticle}></ArticleSingle> : null
      }
      <Spin spinning={loading} delay={250} indicator={<div className="loading-panel">
        <div className="loading-small"></div>
      </div>} />
    </>
  )
}
