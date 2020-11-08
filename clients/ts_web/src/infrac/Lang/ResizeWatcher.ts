type ResizeWatcherCallback = { (width: number, height: number): void }

export default class ResizeWatcher {
    target: Window & typeof globalThis
    resizeThreshold: number
    callbacks: ResizeWatcherCallback[]
    isWatching: boolean
    checkThreshold: number
    lastCheckTime: number
    lastWidth: number
    lastHeight: number
    constructor (target = window) {
      this.target = target
      this.onResize = this.onResize.bind(this)
      this.target.addEventListener('resize', this.onResize)
      this.resizeThreshold = 10
      this.callbacks = []
      this.isWatching = false
      this.checkThreshold = 200
    }

    dispose () {
      this.target.removeEventListener('resize', this.onResize)
    }

    register (callback: ResizeWatcherCallback) {
      callback && this.callbacks.push(callback)
      if (!this.isWatching) {
        this.isWatching = true
        this.lastCheckTime = 0
        this.lastWidth = this.target.innerWidth
        this.lastHeight = this.target.innerHeight
      }
    }

    unregister (callback: ResizeWatcherCallback) {
      if (!callback) {
        return
      }
      const idx = this.callbacks.findIndex((c) => c === callback)
      if (idx < 0) {
        return
      }
      this.callbacks.splice(idx, 1)
      if (this.callbacks.length === 0) {
        this.isWatching = false
      }
    }

    onResize (ev: UIEvent) {
      if (!this.isWatching) {
        return
      }
      const now = Date.now()
      if (now - this.lastCheckTime < this.checkThreshold) {
        return
      }
      this.lastCheckTime = now
      const width = this.target.innerWidth
      const height = this.target.innerHeight

      if (
        Math.abs(this.lastWidth - width) < this.resizeThreshold &&
            Math.abs(this.lastHeight - height) < this.resizeThreshold
      ) {
        return
      }
      this.lastWidth = width
      this.lastHeight = height
      for (const callback of this.callbacks) {
        callback(width, height)
      }
    }
}
