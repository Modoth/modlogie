import { getMdFileContent } from '../../../pluginbase/base/common/GetFileContents'
import Seperators from '../../../domain/ServiceInterfaces/Seperators'
import TurndownService from 'turndown'

export const getSectionFileContent = (_: string) => {
  return getMdFileContent
}
const translateHtml2Markdown = (html: string) => {
  try {
    const turndownService = new TurndownService()
    const markdown = turndownService.turndown(html)
    return markdown
  } catch (e) {
    console.log(e)
    return html
  }
}

const getContentFromClipboardData = (data: DataTransferItem) =>
  new Promise<string>(resolve => data.getAsString(s => resolve(translateHtml2Markdown(s))))

export const getPasteSectionContent = (_: string, types: string) => {
  switch (types) {
    case `text/plain${Seperators.Items}text/html`:
      return (data: DataTransfer) => getContentFromClipboardData(data.items[1])
    case `text/html${Seperators.Items}text/plain`:
      return (data: DataTransfer) => getContentFromClipboardData(data.items[0])
    default:
  }
}
