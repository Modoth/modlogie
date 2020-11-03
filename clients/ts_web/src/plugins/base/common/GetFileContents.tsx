import { ArticleFile } from "../../../domain/Article"

export const getMdFileContent = (file: ArticleFile) => {
    return `![${file.name}](${file.url})`
}