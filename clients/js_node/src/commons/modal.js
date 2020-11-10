export class Modal {
  constructor() {
    this.container_ = document.body
  }

  showModal(msg, onclose, input = null) {
    let panel = document.createElement('div')
    panel.className = 'modal-panel'
    let closeModal = (ok) => {
      this.container_.removeChild(panel)
      onclose(ok)
    }
    panel.onclick = () => closeModal(false)
    let div = document.createElement('div')
    div.onclick = (ev) => ev.stopPropagation()
    let title = document.createElement('h1')
    title.innerText = msg
    let btnGroups = document.createElement('div')
    btnGroups.classList.add('btn-groups')
    let btnOk = document.createElement('input')
    btnOk.type = 'button'
    btnOk.value = '确定'
    btnOk.onclick = () => closeModal(true)
    let btnCancle = document.createElement('input')
    btnCancle.type = 'button'
    btnCancle.value = '取消'
    btnCancle.onclick = () => closeModal(false)
    div.appendChild(title)
    if (input) {
      div.appendChild(input)
      div.addEventListener('keydown', (k) => {
        if (k && k.key === 'Enter') {
          k.stopPropagation()
          closeModal(true)
          return
        }
        if (k && k.key === 'Escape') {
          k.stopPropagation()
          closeModal(false)
          return
        }
      })
    }
    div.appendChild(btnGroups)
    btnGroups.appendChild(btnOk)
    btnGroups.appendChild(btnCancle)
    panel.appendChild(div)
    this.container_.appendChild(panel)
    let focusEle = input || btnOk || btnCancle
    focusEle.focus()
  }

  prompt(/**@type string */ msg, /**@type any */ defValue = null, opt) {
    return new Promise((resolve) => {
      let txbInput = document.createElement('input')
      txbInput.type = 'input'
      txbInput.value = defValue
      if (opt) {
        txbInput.type = opt.type
        txbInput.max = opt.max
        txbInput.min = opt.min
        txbInput.step = opt.step
      }
      ;[('autocomplete', 'autocorrect', 'autocapitalize')].forEach((prop) =>
        txbInput.setAttribute(prop, 'off')
      )
      ;['spellcheck'].forEach((prop) => txbInput.setAttribute(prop, 'false'))
      this.showModal(
        msg,
        (ok) => {
          if (ok) {
            resolve(txbInput.value)
          } else {
            resolve(null)
          }
        },
        txbInput
      )
    })
  }

  confirm(/**@type string */ msg) {
    return new Promise((resolve) => {
      this.showModal(msg, (ok) => resolve(!!ok))
    })
  }

  popup(/**@type HTMLElement */ ele, callback = null, showClose = true) {
    return new Promise((resolve) => {
      let panel = document.createElement('div')
      panel.className = 'popup-panel'
      let closeModal = (ok) => {
        try {
          this.container_.removeChild(panel)
        } catch {}
        resolve(ok)
      }
      if (showClose) {
        let btnClose = document.createElement('span')
        // btnClose.innerText = '×';
        btnClose.classList.add('close')
        btnClose.onclick = () => closeModal(false)
        panel.appendChild(btnClose)
      }
      panel.appendChild(ele)
      this.container_.appendChild(panel)
      if (callback) {
        callback(closeModal)
      }
    })
  }

  toast(msg, timeout = 1000) {
    return new Promise((resolve) => {
      let panel = document.createElement('div')
      panel.className = 'toast-panel'
      let div = document.createElement('div')
      panel.appendChild(div)
      let span = document.createElement('span')
      span.innerText = msg
      div.appendChild(span)
      this.container_.appendChild(panel)
      setTimeout(() => {
        this.container_.removeChild(panel)
        resolve()
      }, timeout)
    })
  }
}
