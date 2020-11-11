import fastHtml from '!!raw-loader!./fast.html'
import fastJs from '!!raw-loader!./fast.js'
import simpleHtml from '!!raw-loader!./simple.html'
import simpleJs from '!!raw-loader!./simple.js'
const Frameworks = new Map<string, { html: string, js: string }>()
Frameworks.set('fast', { html: fastHtml, js: fastJs })
Frameworks.set('simple', { html: simpleHtml, js: simpleJs })
export default Frameworks
