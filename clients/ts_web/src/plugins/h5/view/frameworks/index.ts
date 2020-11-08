// eslint-disable-next-line import/no-webpack-loader-syntax
import fastHtml from '!!raw-loader!./fast.html'
// eslint-disable-next-line import/no-webpack-loader-syntax
import fastJs from '!!raw-loader!./fast.js'
const Frameworks = new Map<string, { html: string, js: string }>()
Frameworks.set('fast', { html: fastHtml, js: fastJs })
export default Frameworks
