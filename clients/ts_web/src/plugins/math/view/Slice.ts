import { ArticleFile } from '../../../domain/ServiceInterfaces/Article'
import { v4 as uuidv4 } from 'uuid'

export enum SliceType {
    Normal = 1,
    Inline = 2,
    Block = 3,
}

export class SliceFile {
  constructor (public file: ArticleFile) { }
}

export class ArticleSlice {
    id: string;
    constructor (public type: SliceType, public content: string | SliceFile,
        public start: number, public end: number) {
      this.id = uuidv4()
    }
}

const SEP = '$'
const ESC = '\\'
const FILE_PREFIX = ':'

export const getSlices = (section: string, files?: Map<string, ArticleFile>): ArticleSlice[] => {
  let sliceStart = 0
  let sliceEnd = 0
  let nextType = SliceType.Normal
  let closeSeps: boolean | undefined
  const slices: ArticleSlice[] = []
  const addSlice = (type: SliceType, start: number, end: number) => {
    const content = section.slice(start, end)
    if (type === SliceType.Normal) {
      if (content.trim()) {
        slices.push(new ArticleSlice(type, content, start, end))
      }
    } else if (content.startsWith(FILE_PREFIX)) {
      const fileKey = content.slice(FILE_PREFIX.length)
      const file = files && files.get(fileKey) || { name: fileKey }
      slices.push(new ArticleSlice(type, new SliceFile(file), start, end))
    } else {
      slices.push(new ArticleSlice(type, content, start, end))
    }
  }
  for (let i = 0; i < section.length; i++) {
    if (section[i] !== SEP) {
      continue
    }
    const currentType = nextType
    sliceEnd = i
    switch (currentType) {
      case SliceType.Normal:
        if (section[i + 1] === SEP) {
          i++
          nextType = SliceType.Block
        } else {
          nextType = SliceType.Inline
        }
        break
      case SliceType.Inline:
        nextType = SliceType.Normal
        break
      case SliceType.Block:
        if (section[i + 1] === SEP) {
          i++
          nextType = SliceType.Block
        } else {
          // throw new Error('Broken file.')
          console.log('Broken file.')
        }
        break
    }
    addSlice(currentType, sliceStart, sliceEnd)
    if (!closeSeps) {
    }
    closeSeps = closeSeps === false
    sliceStart = i + 1
  }
  addSlice(SliceType.Normal, sliceStart, section.length)
  return slices
}
