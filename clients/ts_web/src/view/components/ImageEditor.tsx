import React from 'react'
import './ImageEditor.less'
import classNames from 'classnames'
import {
  UndoOutlined,
  ExpandOutlined,
  CloseOutlined,
  MobileOutlined,
  TabletOutlined,
  CheckOutlined,
  RotateRightOutlined,
  RotateLeftOutlined,
  BorderOutlined
} from '@ant-design/icons'
const Configs = {} as any

class MaskAnchor {
  constructor (
    public x: number,
    public y: number,
    public i: number,
    public j: number
  ) { }
}

class MaskAnchorCollection {
  constructor (
    public top: number,
    public right: number,
    public bottom: number,
    public left: number
  ) {
    this.anchors = []
    this.anchorRec = []
    for (let j = 0; j < 3; j++) {
      const row: MaskAnchor[] = []
      this.anchorRec.push(row)
      for (let i = 0; i < 3; i++) {
        const point = new MaskAnchor(0, 0, i, j)
        row.push(point)
        this.anchors.push(point)
      }
    }
    this.resize(top, right, bottom, left)
  }

  resize (top: number, right: number, bottom: number, left: number) {
    this.top = top
    this.right = right
    this.bottom = bottom
    this.left = left
    const center = Math.floor((right + left) / 2)
    const middle = Math.floor((bottom + top) / 2)
    for (let i = 0; i < 3; i++) {
      this.anchorRec[0][i].y = top
      this.anchorRec[1][i].y = middle
      this.anchorRec[2][i].y = bottom

      this.anchorRec[i][0].x = left
      this.anchorRec[i][1].x = center
      this.anchorRec[i][2].x = right
    }
  }

  clone () {
    return new MaskAnchorCollection(
      this.top,
      this.right,
      this.bottom,
      this.left
    )
  }

  anchorRec: MaskAnchor[][]; // (i,j)=>[j][i]
  anchors: MaskAnchor[];
}

class ImageCroper {
  destroy (): void {
    this.canvas.removeEventListener('touchstart', this.startMove)
    this.canvas.removeEventListener('touchmove', this.move)
    this.canvas.removeEventListener('touchend', this.stopMove)
    this.canvas.removeEventListener('touchcancel', this.stopMove)
    this.canvas.removeEventListener('mousedown', this.startMove)
    this.canvas.removeEventListener('mousemove', this.move)
    this.canvas.removeEventListener('mouseup', this.stopMove)
    this.canvas.removeEventListener('mouseleave', this.stopMove)
    const ctx = this.canvas.getContext('2d')
    ctx!.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }

  constructor (
    public canvas: HTMLCanvasElement,
    public shadowStyle = '#00000040',
    public archorStyle = 'white',
    public archR = 2
  ) {
    this.archD = this.archR * 2
    this.anchorFindR = Math.pow(
      (this.canvas.width / this.canvas.offsetWidth) * 48,
      2
    )
    const width = this.canvas.width
    const height = this.canvas.height
    this.anchors = new MaskAnchorCollection(0, width, height, 0)
    this.canvas.addEventListener('touchstart', this.startMove)
    this.canvas.addEventListener('touchmove', this.move)
    this.canvas.addEventListener('touchend', this.stopMove)
    this.canvas.addEventListener('touchcancel', this.stopMove)
    this.canvas.addEventListener('mousedown', this.startMove)
    this.canvas.addEventListener('mousemove', this.move)
    this.canvas.addEventListener('mouseup', this.stopMove)
    this.canvas.addEventListener('mouseleave', this.stopMove)
    this.drawMask()
  }

  movingAnchor?: MaskAnchor;

  movingInterval = 10;

  anchorFindR = 0;

  lastMoveTime = -1;

  moveStartPos?: { x: number; y: number };

  statuses: { ratio: number; archors: MaskAnchorCollection }[] = [];

  getPointInCanvas (e: any): { x: number; y: number } {
    const c: HTMLCanvasElement = e.target
    let x, y
    if (e.targetTouches) {
      const rect = c.getBoundingClientRect()
      x = e.targetTouches[0].pageX - rect.left
      y = e.targetTouches[0].pageY - rect.top
    } else {
      x = e.offsetX
      y = e.offsetY
    }

    const ratio = c.width / c.offsetWidth
    return {
      x: Math.floor(Math.ceil(x) * ratio),
      y: Math.floor(y * ratio)
    }
  }

  findMovingAnchor ({ x, y }: { x: number; y: number }): MaskAnchor {
    let ma = null
    let closestA = this.anchorFindR
    for (const a of this.anchors.anchors) {
      const dist = Math.pow(a.x - x, 2) + Math.pow(a.y - y, 2)
      if (dist <= closestA) {
        ma = a
        closestA = dist
      }
    }
    return ma!
  }

  startMove = (e: UIEvent) => {
    if (this.movingAnchor) {
      return
    }
    e.stopPropagation()
    e.preventDefault()
    const pos = this.getPointInCanvas(e)
    this.movingAnchor = this.findMovingAnchor(pos)
    this.lastMoveTime = -1
    this.moveStartPos = pos
    this.statuses.push({
      ratio: this.cropRatio,
      archors: this.anchors.clone()
    })
  };

  move = (e: UIEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (!this.movingAnchor) {
      return
    }
    const now = Date.now()
    if (now - this.lastMoveTime < this.movingInterval) {
      return
    }
    this.lastMoveTime = now
    const currentPos = this.getPointInCanvas(e)
    this.moveAnchors(
      this.anchors,
      this.statuses[this.statuses.length - 1].archors,
      currentPos.x - this.moveStartPos!.x,
      currentPos.y - this.moveStartPos!.y
    )
    this.drawMask()
  };

  moveAnchors (
    current: MaskAnchorCollection,
    start: MaskAnchorCollection,
    dx: number,
    dy: number
  ) {
    let { top, right, bottom, left } = start
    const { i, j } = this.movingAnchor!
    if (i === 1 && j === 1) {
      if (left + dx < 0) {
        dx = -left
      } else if (right + dx > this.canvas.width) {
        dx = this.canvas.width - right
      }

      if (top + dy < 0) {
        dy = -top
      } else if (bottom + dy > this.canvas.height) {
        dy = this.canvas.height - bottom
      }
      left += dx
      right += dx
      top += dy
      bottom += dy
    } else {
      if (this.cropRatio && (i === 1 || j === 1)) {
        return
      }
      if (j === 0) {
        top += dy
      } else if (j === 2) {
        bottom += dy
      }
      if (i === 0) {
        left += dx
      } else if (i === 2) {
        right += dx
      }
      if (left > right || top > bottom) {
        return
      }

      if (this.cropRatio) {
        const width = right - left
        const height = bottom - top
        const rheight = width / this.cropRatio
        if (j === 0) {
          top += height - rheight
        } else if (j === 2) {
          bottom += rheight - height
        }

        if (
          left < 0 ||
          right > this.canvas.width ||
          top < 0 ||
          bottom > this.canvas.height
        ) {
          return
        }
      } else {
        top = Math.max(0, top)
        right = Math.min(this.canvas.width, right)
        bottom = Math.min(this.canvas.height, bottom)
        left = Math.max(0, left)
      }
    }
    current.resize(top, right, bottom, left)
  }

  revertEdit () {
    const status = this.statuses.pop()!
    this.anchors = status.archors
    this.cropRatio = status.ratio
    this.drawMask()
  }

  stopMove = (e: UIEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (!this.movingAnchor) {
      return
    }
    this.movingAnchor = undefined
    this.moveStartPos = undefined
  };

  anchors: MaskAnchorCollection;

  cropRatio = NaN;

  cropRect () {
    return this.anchors
  }

  drawMask () {
    const ctx = this.canvas.getContext('2d')!
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    // SHADOW
    const width = this.canvas.width
    const height = this.canvas.height
    const { top, right, bottom, left } = this.cropRect()
    ctx.fillStyle = this.shadowStyle
    ctx.beginPath()
    ctx.rect(0, 0, width, top)
    ctx.rect(0, 0, left, height)
    ctx.rect(0, bottom, width, height - bottom)
    ctx.rect(right, 0, width - right, height)
    ctx.fill()
    // ANCHOR
    ctx.fillStyle = this.archorStyle
    ctx.beginPath()

    for (let a of this.anchors.anchors) {
      ctx.rect(a.x - this.archR, a.y - this.archR, this.archD, this.archD)
    }
    ctx.fill()
  }

  archD: number;

  setCropRatio (ratio: number) {
    if (this.cropRatio === ratio) {
      return
    }
    this.statuses.push({
      ratio: this.cropRatio,
      archors: this.anchors.clone()
    })
    this.cropRatio = ratio
    if (!this.cropRatio) {
      return
    }
    const { left, right, top, bottom } = this.cropRect()
    const width = right - left
    const height = bottom - top
    if (height * ratio < width) {
      const dwidth = Math.floor(height * ratio)
      this.anchors.resize(top, left + dwidth, bottom, left)
    } else {
      const dheight = Math.floor(width / ratio)
      this.anchors.resize(top, right, top + dheight, left)
    }
    this.drawMask()
  }
}

class ImageEditorProperties {
  className?: string;
  maxImageSize?: number = +Infinity;
  image?: Blob;
  onError?: (msg: string) => void;
  closed?: (image?: Blob) => void;
}

class ImageEditorState {
  image?: Blob;
  ops: any;
  allOps: any;
  static filter (allOps: any) {
    return allOps && allOps.filter((op: any) => !op.hidden || !op.hidden())
  }

  constructor (allOps: any) {
    this.allOps = allOps
    this.ops = ImageEditorState.filter(allOps)
  }
}

export default class ImageEditor extends React.Component<
  ImageEditorProperties,
  ImageEditorState
  > {
  constructor (props: ImageEditorProperties) {
    super(props)
    this.state = new ImageEditorState(this.ops)
  }

  render () {
    return (
      <div className={classNames('image-editor', this.props.className)}>
        <div className="editor-container">
          <div className="divider"></div>
          <canvas className="canvas-edit" ref={this.canvasRef}></canvas>
          <canvas className="canvas-mask" ref={this.canvasMaskRef}></canvas>
          <div className="divider"></div>
        </div>
        <div className="image-editor-ops">
          {this.state.ops.map((op: any) => (
            <div
              key={Math.random()}
              onClick={() => {
                op.func(op)
              }}
            >
              {op.icon}
            </div>
          ))}
        </div>
      </div>
    )
  }

  componentWillUnmount (): void {
    if (this.croper) {
      this.croper.destroy()
    }
  }

  componentDidMount () {
    this.tryLoadImage()
  }

  componentDidUpdate () {
    this.tryLoadImage()
  }

  private tryLoadImage () {
    if (this.props.image !== this.originImage && this.props.image) {
      this.originImage = this.props.image
      this.editedImage = this.props.image
      this.loadImage()
      this.cancleCrop()
    }
  }

  originImage?: Blob;
  editedImage?: Blob;

  imgType: string = 'image/jpeg';

  croper?: ImageCroper;

  startOp (op: any) {
    this.croper = new ImageCroper(this.canvasMaskRef.current!)
    this.setState({ allOps: op.ops, ops: ImageEditorState.filter(op.ops) })
  }

  cancleCrop () {
    this.setState({ allOps: this.ops, ops: ImageEditorState.filter(this.ops) })
    if (this.croper) {
      this.croper!.destroy()
      this.croper = undefined
    }
  }

  applyCrop () {
    this.setState({ allOps: this.ops, ops: ImageEditorState.filter(this.ops) })
    let { top, right, bottom, left } = this.croper!.cropRect()
    this.croper!.destroy()
    this.croper = undefined
    top = Math.floor(top * this.maskRatio)
    right = Math.floor(right * this.maskRatio)
    bottom = Math.floor(bottom * this.maskRatio)
    left = Math.floor(left * this.maskRatio)
    const width = right - left + 1
    const height = bottom - top + 1
    const imgData =
      this.imagesDatas && this.imagesDatas[this.imagesDatas.length - 1]
    if (!imgData) {
      return
    }
    const newImgData = new ImageData(width, height)
    const data = imgData.data
    const nData = newImgData.data
    for (let j = 0; j < height; j++) {
      for (let i = 0; i < width; i++) {
        const nidx = (i + j * width) * 4
        const idx = (i + left + (j + top) * imgData.width) * 4
        nData[nidx] = data[idx]
        nData[nidx + 1] = data[idx + 1]
        nData[nidx + 2] = data[idx + 2]
        nData[nidx + 3] = data[idx + 3]
      }
    }
    this.updateImageData(newImgData)
  }

  currentOp: any = this;

  ops = [
    {
      func: () => {
        this.revertEdit()
        this.setState({ ops: ImageEditorState.filter(this.state.allOps) })
      },
      hidden: () => !this.imagesDatas || this.imagesDatas.length < 2,
      icon: <UndoOutlined />
    },
    {
      func: (op: any) => {
        this.startOp(op)
      },
      icon: <ExpandOutlined />,
      ops: [
        {
          func: () => {
            this.cancleCrop()
          },
          icon: <CloseOutlined />
        },
        {
          func: () => {
            this.croper!.revertEdit()
            this.setState({ ops: ImageEditorState.filter(this.state.allOps) })
          },
          hidden: () =>
            !this.croper!.statuses || this.croper!.statuses.length < 1,
          icon: <UndoOutlined />
        },
        {
          func: () => {
            this.croper!.setCropRatio(16 / 9)
            this.setState({ ops: ImageEditorState.filter(this.state.allOps) })
          },
          icon: <MobileOutlined />
        },
        {
          func: () => {
            this.croper!.setCropRatio(3 / 2)
            this.setState({ ops: ImageEditorState.filter(this.state.allOps) })
          },
          icon: <TabletOutlined />
        },
        {
          func: () => {
            this.croper!.setCropRatio(1)
            this.setState({ ops: ImageEditorState.filter(this.state.allOps) })
          },
          icon: <BorderOutlined />
        },
        {
          func: () => {
            this.croper!.setCropRatio(NaN)
            this.setState({ ops: ImageEditorState.filter(this.state.allOps) })
          },
          icon: <ExpandOutlined />
        },
        {
          func: () => {
            this.applyCrop()
          },
          icon: <CheckOutlined />
        }
      ]
    },
    {
      func: () => {
        this.execEdit(this.rotateLeft)
      },
      icon: <RotateLeftOutlined />
    },
    {
      func: () => {
        this.execEdit(this.rotateRight)
      },
      icon: <RotateRightOutlined />
    },
    {
      func: () => {
        this.cancle()
      },
      icon: <CloseOutlined />
    },
    {
      func: () => {
        this.apply()
      },
      icon: <CheckOutlined />
    }
  ];

  canvasRef = React.createRef<HTMLCanvasElement>();
  canvasMaskRef = React.createRef<HTMLCanvasElement>();

  async getImage (blob: Blob): Promise<HTMLImageElement> {
    return new Promise((resolve) => {
      let img: HTMLImageElement = window.document.createElement('img')
      const imgUrl = window.URL.createObjectURL(blob)
      img.src = imgUrl
      img.onload = () => {
        window.URL.revokeObjectURL(imgUrl)
        resolve(img)
      }
    })
  }

  imagesDatas: ImageData[];

  rotateRight (imageData: ImageData) {
    const newImageData = new ImageData(imageData.height, imageData.width)
    const { data, width, height } = imageData
    const nd = newImageData.data
    for (let j = 0; j < height; j++) {
      for (let i = 0; i < width; i++) {
        const nIdx = (i * height + (height - j)) * 4
        const idx = (j * width + i) * 4
        nd[nIdx] = data[idx]
        nd[nIdx + 1] = data[idx + 1]
        nd[nIdx + 2] = data[idx + 2]
        nd[nIdx + 3] = data[idx + 3]
      }
    }
    return newImageData
  }

  rotateLeft (imageData: ImageData) {
    const newImageData = new ImageData(imageData.height, imageData.width)
    const { data, width, height } = imageData
    const nd = newImageData.data
    for (let j = 0; j < height; j++) {
      for (let i = 0; i < width; i++) {
        const nIdx = ((width - i) * height + j) * 4
        const idx = (j * width + i) * 4
        nd[nIdx] = data[idx]
        nd[nIdx + 1] = data[idx + 1]
        nd[nIdx + 2] = data[idx + 2]
        nd[nIdx + 3] = data[idx + 3]
      }
    }
    return newImageData
  }

  revertEdit () {
    if (!this.imagesDatas || this.imagesDatas.length < 2) {
      return
    }
    this.imagesDatas.pop()
    this.updateImageData(this.imagesDatas.pop()!)
  }

  execEdit (func: (data: ImageData) => ImageData) {
    if (!func) {
      return
    }
    const data =
      this.imagesDatas && this.imagesDatas[this.imagesDatas.length - 1]
    if (!data) {
      return
    }
    const newData = func(data)
    this.updateImageData(newData)
    this.setState({ ops: ImageEditorState.filter(this.state.allOps) })
  }

  async loadImage () {
    const canvas = this.canvasRef.current!
    const img = await this.getImage(this.editedImage!)
    this.updateCanvasWidth(canvas, img.naturalWidth, img.naturalHeight)
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(img, 0, 0)
    this.imagesDatas = []
    this.imagesDatas.push(ctx.getImageData(0, 0, canvas.width, canvas.height))
  }

  async apply () {
    if (
      this.imagesDatas.length === 1 &&
      (this.editedImage!.type === 'image/gif' ||
        this.editedImage!.type === 'image/svg+xml' ||
        this.editedImage!.type === 'image/png')
    ) {
      this.props.closed && this.props.closed(this.editedImage)
      return
    }
    const blob = await this.normanizeImage()
    if (this.props.maxImageSize && blob.size > this.props.maxImageSize) {
      this.props.onError &&
        this.props.onError(Configs.ServiceMessagesEnum.FileToLarge.toString())
      return
    }
    this.props.closed && this.props.closed(blob)
  }

  async cancle () {
    this.props.closed && this.props.closed(undefined)
  }

  async normanizeImage () {
    const canvas = this.canvasRef.current!
    const blob: Blob = await new Promise((resolve: any) => {
      if (this.props.maxImageSize) {
        const q = this.props.maxImageSize / this.editedImage!.size
        if (q < 1) {
          canvas.toBlob(resolve, this.imgType, q / 5)
          return
        }
      }
      canvas.toBlob(resolve, this.imgType)
    })
    return blob
  }

  updateImageData (data: ImageData) {
    if (!data) {
      return
    }
    this.imagesDatas.push(data)
    const canvas = this.canvasRef.current!
    this.updateCanvasWidth(canvas, data.width, data.height)
    const ctx = canvas.getContext('2d')!
    ctx.putImageData(data, 0, 0)
  }

  updateCanvasWidth (
    canvas: HTMLCanvasElement,
    naturalWidth: number,
    naturalHeight: number
  ) {
    const canvasMask = this.canvasMaskRef.current!
    if (naturalHeight < 1) {
      canvasMask.width = canvas.width = 0
      canvasMask.height = canvas.height = 0
      return
    }
    const imgRatio = naturalWidth / naturalHeight
    const maxWidth = canvas.parentElement!.clientWidth
    const maxHeight = canvas.parentElement!.clientHeight
    const requiredWidth = maxHeight * imgRatio
    let width = 0
    let height = 0
    if (requiredWidth > maxWidth) {
      width = maxWidth
      height = maxWidth / imgRatio
    } else {
      width = requiredWidth
      height = maxHeight
    }
    canvas.style.width = width + 'px'
    canvas.style.height = height + 'px'
    canvas.width = naturalWidth
    canvas.height = naturalHeight
    canvasMask.style.width = width + 'px'
    canvasMask.style.height = height + 'px'
    canvasMask.width = width
    canvasMask.height = height
    this.maskRatio = naturalWidth / width
  }

  maskRatio = 0;
}
