import html2canvas, { Options } from 'html2canvas'

const onclone = (e:Document) => {
  e.querySelector('#root')?.classList.add('_screenshot')
}
export default async function htmlToCanvas (element: HTMLElement, options?: Partial<Options>) : Promise<HTMLCanvasElement> {
  element.classList.add('_screenshot_before')
  const res = await html2canvas(element, { onclone, ...options })
  element.classList.remove('_screenshot_before')
  return res
}
