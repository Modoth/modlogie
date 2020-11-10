import { getMdFileContent } from '../../../pluginbase/base/common/GetFileContents'

export const SectionNames = {
  type: 'type',
  yml: 'yml',
  json: 'json',
  text: 'text'
}

export const getSectionType = (name: string) => {
  switch (name) {
    case SectionNames.type:
      return 'text'
    default:
      return name
  }
}

export const getSectionFileContent = (_: string) => {
  return getMdFileContent
}
