import { getMdFileContent } from '../../../pluginbase/base/common/GetFileContents'

export const SectionNames = {
  path: 'path',
  summary: 'summary'
}

export const getSectionType = (name: string) => {
  switch (name) {
    case SectionNames.summary:
      return 'markdown'
    case SectionNames.path:
      return 'raw'
    default:
      return name
  }
}

export const getSectionFileContent = (_: string) => {
  return getMdFileContent
}
