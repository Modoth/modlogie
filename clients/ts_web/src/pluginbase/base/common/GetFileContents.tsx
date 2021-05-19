import { ArticleFile } from '../../../domain/ServiceInterfaces/Article'

export const getMdFileContent = (file: ArticleFile) => {
  return `![${file.name}](${file.url})`
}

export const getFilesInMdContent = (content:string) => {
  return Array.from(content.matchAll(/!\[(.*?)\]\(.*\)/g)).map(a => a[1])
}
