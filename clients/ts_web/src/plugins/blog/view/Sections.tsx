import { getMdFileContent } from "../../base/common/GetFileContents"

export const getSectionFileContent = (_: string) => {
    return getMdFileContent
}

import TurndownService from 'turndown'
const translateHtml2Markdown = (html: string) => {
    try {
        let turndownService = new TurndownService()
        let markdown = turndownService.turndown(html)
        return markdown;
    } catch (e) {
        console.log(e)
        return html;
    }
}

const getContentFromClipboardData = (data: DataTransferItem) =>
    new Promise<string>(resolve => data.getAsString(s => resolve(translateHtml2Markdown(s))))

export const getPasteSectionContent = (_: string, types: string) => {
    switch (types) {
        case 'text/plain text/html':
            return (data: DataTransfer) => getContentFromClipboardData(data.items[1])
        case 'text/html text/plain':
            return (data: DataTransfer) => getContentFromClipboardData(data.items[0])
        default:
            return
    }
}