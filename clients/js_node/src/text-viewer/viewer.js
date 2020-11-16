import TextRenderManager from './text-render-manager.js'

class Viewer {
  init ({ storage, resizeWatcher, selectFile, showHelp }) {
    this.manager = new TextRenderManager(storage, resizeWatcher)
    return {
      clickRegions: [
        'ooo',
        'phn',
        'pnn'
      ],
      clickCommands: [
        { sym: 'p', name: '上一页', exec: () => this.manager.pageUp() },
        { sym: 'n', name: '下一页', exec: () => this.manager.pageDown() },
        { sym: 'o', name: '打开', exec: () => selectFile() },
        { sym: 'h', name: '帮助', exec: () => showHelp() }
      ],
      accept: 'text/plain',
      manager: this.manager
    }
  }
}
