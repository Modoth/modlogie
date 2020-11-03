import { getMdFileContent } from "../../base/common/GetFileContents"

export const SectionNames = {
    type: 'type',
    data: 'data'
}

export const getSectionType = (name: string) => {
    switch (name) {
        case SectionNames.data:
            return 'yml'
        case SectionNames.type:
            return 'txt'
        default:
            return name
    }
}

export const getSectionFileContent = (_: string) => {
    return getMdFileContent
}