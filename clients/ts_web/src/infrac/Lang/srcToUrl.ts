export const srcToUrl = (content: string) => {
  return 'data:text/html;charset=utf-8,' + encodeURIComponent(content)
}
