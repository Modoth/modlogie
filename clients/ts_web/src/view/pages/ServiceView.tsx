import React, { useState, useRef } from 'react'
import './ServiceView.less'
import { Spin, message, Modal, Input, Space, Radio, TreeSelect, Button } from 'antd'
import IViewService, { IPromptField } from '../services/IViewService'
import ILangsService from '../../domain/ILangsService'
import ImageEditor from '../components/ImageEditor'
import ArticleList from './ArticleList'
import ArticleSingle from './ArticleSingle'
import { ArticleContentType } from '../../plugins/IPluginInfo'
import Article from '../../domain/Article'
import TextArea from 'antd/lib/input/TextArea'
import { CloseOutlined, SaveOutlined, CopyOutlined } from '@ant-design/icons'

class ViewService implements IViewService {
  errorKey(langs: ILangsService, key: any, timeout?: number | undefined): void {
    this.error(langs.get(key), timeout)
  }

  error(msg: string, timeout: number = 1000): void {
    message.error(msg, timeout / 1000)
  }

  private _showMenu = true;

  get showMenu() {
    return this._showMenu;
  }

  setShowMenu(showMenu: boolean): void {
    this._showMenu = showMenu
    if (this.onShowMenuChanged) {
      this.onShowMenuChanged(this._showMenu)
    }
  }

  constructor(public setLoading: any, public prompt: any, public previewImage: any, public previewArticleList: any, public previewArticle: any,
    public onShowMenuChanged?: { (showMenu: boolean): void }) { }

}

export default function ServiceView(props: {
  provide: { (viewService: IViewService): void };
  setContentVisiable: { (visiable: boolean): void }
}) {
  const refFile = useRef<HTMLInputElement | null>(null)
  const [loading, setLoading] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [modalVisible, setModalVisible] = useState(false)
  const [modalImageField, setModalImageField] = useState(false)
  const [modalPromise, setModalPromise] = useState({ resolve: null as any, reject: null as any })
  const [modalFileFieldData, setModalFileFieldData] = useState<
    File | undefined
  >(undefined)
  const [modalFields, setModalFileds] = useState<IPromptField<any, any>[]>([])
  const [onModalOk, setOnModalOk] = useState<{
    onOk(...p: any): Promise<boolean | undefined>;
  }>()

  const [previewImgUrl, setPreviewImgUrl] = useState('')

  const [previewArticleList, setPreviewArticleList] = useState(false)
  const [previewArticle, setPreviewArticle] = useState<{ article: Article, type: ArticleContentType } | undefined>(undefined)

  const updateField = (
    i: number,
    field: IPromptField<any, any>,
    value: any
  ) => {
    modalFields.splice(i, 1, Object.assign({}, field, { value }))
    setModalFileds([...modalFields])
  }

  const applyModal = async () => {
    if (await onModalOk!.onOk(...modalFields.map((f) => f.value))) {
      cancleModal(true)
    }
  }

  const resolveModalPromise = (value: boolean) => {
    let resolve = modalPromise.resolve;
    modalPromise.resolve = null;
    modalPromise.reject = null;
    if (resolve) {
      resolve(value);
    }
  }

  const cancleModal = (success = false) => {
    refFile.current!.onchange = null
    refFile.current!.value = ''
    setModalTitle('')
    setModalVisible(false)
    setModalFileds([])
    setOnModalOk(undefined)
    setModalImageField(false)
    setModalFileFieldData(undefined)
    resolveModalPromise(success);
  }

  const viewService = new ViewService(
    setLoading,
    async (
      title: string,
      fields: IPromptField<any, any>[],
      onOk: (...paras: any) => Promise<boolean | undefined>
    ): Promise<boolean> => {
      return new Promise(resolve => {
        resolveModalPromise(false);
        modalPromise.resolve = resolve;
        const setStates = () => {
          setModalTitle(title)
          setModalFileds(fields)
          setOnModalOk({ onOk })
          setModalVisible(true)
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
        let fileField = singleField.type === 'File'
        fileField = fileField || imageField || textFileField || videoFileField

        if (!fileField) {
          setStates()
          return
        }
        let accept = '*/*'
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
            setModalFileds([{ ...fields[0], value: reader.result }])
          }
          reader.readAsText(file)
        }
        const handleVideo = (file: File) => {
          onOk(file)
          resolveModalPromise(true);
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
          onOk(file)
          resolveModalPromise(true);
          if (e) {
            e.target.value = ''
          }
        }

        if (singleField.value) {
          handleFile(singleField.value)
          return
        }

        refFile.current!.accept = fields[0].accept || accept
        refFile.current!.onchange = (e: any) => {
          const file: File = e.target.files && e.target.files![0]
          if (!file) {
            return
          }
          handleFile(file, e)
        }
        refFile.current!.click()
      })
    },
    (url: string) => {
      setPreviewImgUrl(url)
    },
    (visiable: boolean): void => {
      if (visiable === previewArticleList) {
        return
      }
      props.setContentVisiable(!visiable)
      setPreviewArticleList(visiable)
    },
    (article: Article, type: ArticleContentType): void => {
      if (article) {
        props.setContentVisiable(false)
        setPreviewArticle({ article, type })
      }
      else {
        props.setContentVisiable(true)
        setPreviewArticle(undefined)
      }
    }
  )
  props.provide && props.provide(viewService)

  const previewImgRef = React.createRef<HTMLImageElement>();

  return (
    <>
      {
        loading ? <div className="loading-panel ">
          <div className="loading-small"></div>
        </div> : null
      }
      <input type="file" className="hidden" ref={refFile}></input>
      <Modal
        title={modalTitle}
        visible={modalVisible}
        onOk={applyModal}
        onCancel={() => cancleModal(false)}
        footer={modalImageField ? null : undefined}
        bodyStyle={
          modalFields.length
            ? modalImageField
              ? { padding: 5 }
              : {}
            : { display: 'None' }
        }
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
                      updateField(i, field, sid);
                    }}
                    defaultValue={field.value}
                    treeData={field.values}
                    placeholder={field.hint}
                  />
                )
              case 'Text':
                return (
                  field.multiline ?
                    <TextArea
                      key={i}
                      value={field.value}
                      onChange={(e) => updateField(i, field, e.target.value)}
                      placeholder={field.hint}
                    ></TextArea> :
                    <Input
                      suffix={field.icon}
                      key={i}
                      value={field.value}
                      onChange={(e) => updateField(i, field, e.target.value)}
                      placeholder={field.hint}
                    ></Input>
                )
              case 'Enum':
                return (
                  <Radio.Group key={i} onChange={(e) => updateField(i, field, e.target.value)} value={field.value}>
                    {
                      field.values ? field.values.map(value => <Radio key={value} value={value}>{value}</Radio>) : []
                    }
                  </Radio.Group>
                )
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
                  <ImageEditor
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
                return <textarea rows={10} value={field.value}></textarea>
              default:
                return <span key={i}>{field.value}</span>
            }
          })}
        </Space>
      </Modal>
      {
        previewImgUrl ?

          <>

            <div className="img-preview" >
              <div className="img-panel" >
                <img ref={previewImgRef} src={previewImgUrl}></img>
              </div>
              <div className="menus" onClick={e => e.stopPropagation()}>
                <Button type="primary" size="large" shape="circle" icon={<SaveOutlined />} onClick={() => {
                  var a = document.createElement('a')
                  a.target = '_blank'
                  a.href = previewImgUrl
                  a.download = `download.png`;
                  a.click();
                  setPreviewImgUrl('')
                }} />
                <Button type="primary" danger size="large" shape="circle" icon={<CloseOutlined />} onClick={() => {
                  setPreviewImgUrl('')
                }} />
              </div>
              {/* onClick={e => e.stopPropagation()}  */}
            </div>
          </>
          : null
      }
      {
        previewArticleList ? <ArticleList></ArticleList> : null
      }
      {
        previewArticle ? <ArticleSingle {...previewArticle}></ArticleSingle> : null
      }
    </>
  )
}
