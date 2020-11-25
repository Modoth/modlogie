import TextRenderManager from './text-render-manager.js'

class Viewer {
  init ({ storage, resizeWatcher, selectFile, jumpTo, showHelp, toogleFullscreen }) {
    this.manager = new TextRenderManager(storage, resizeWatcher)
    return {
      clickRegions: [
        'foj',
        'phn',
        'pnt'
      ],
      clickCommands: [
        { sym: 'p', name: '上一页', exec: () => this.manager.pageUp() },
        { sym: 'n', name: '下一页', exec: () => this.manager.pageDown() },
        { sym: 'o', name: '打开', exec: () => selectFile() },
        { sym: 'h', name: '', exec: () => showHelp() },
        { sym: 'f', name: '全屏', exec: () => toogleFullscreen() },
        { sym: 'j', name: '转到', exec: () => jumpTo() },
        { sym: 't', name: '主题', exec: () => this.manager.toogleTheme() }
      ],
      accept: 'text/plain',
      manager: this.manager
    }
  }
}
