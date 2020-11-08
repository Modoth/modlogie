import { ArticleFile } from '../../../domain/ServiceInterfaces/Article'

export const getMdFileContent = (file: ArticleFile) => {
  return `![${file.name}](${file.url})`
}
