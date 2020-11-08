import { ArticleFile } from '../../../domain/ServiceInterfaces/Article'
import { ResFile } from '../ResFile'
import yaml from 'yaml'

export const SectionNames = {
  info: 'info'
}

const addFile = (_: string | undefined, file: ArticleFile) => {
  const fileInfo = new ResFile(file.name!)
  return yaml.stringify(fileInfo)
}

const removeFile = (_1: string | undefined, _2: ArticleFile) => {
  return ''
}

export const addSectionFileContent = (_: string) => {
  return addFile
}

export const removeSectionFileContent = (_: string) => {
  return removeFile
}
