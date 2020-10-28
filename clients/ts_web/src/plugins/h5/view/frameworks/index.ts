import fast_html from '!!raw-loader!./fast.html';
import fast_js from '!!raw-loader!./fast.js';
const Frameworks = new Map<string, { html: string, js: string }>();
Frameworks.set('fast', { html: fast_html, js: fast_js })
export default Frameworks;