import { getMdFileContent } from '../../../pluginbase/base/common/GetFileContents'

export const SectionNames = {
  html: 'html',
  css: 'css',
  js: 'js',
  data: 'data',
  frameworks: 'frameworks',
  url: 'url'
}

export const getSectionType = (name: string) => {
  switch (name) {
    case SectionNames.data:
      return 'data'
    case SectionNames.frameworks:
    case SectionNames.url:
      return 'txt'
    default:
      return name
  }
}

export const getSectionFileContent = (_: string) => {
  return getMdFileContent
}
