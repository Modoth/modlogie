/* eslint-disable no-with */
/* eslint-disable no-eval */

const { registerElement, registerProperties } = (() => {
  const evalInContext = (exp, context) => {
    return (function () {
      with (this) {
        try {
          return eval(`(${exp})`)
        } catch (e) {

        }
      }
    }.call(context))
  }

  const onprop = (exp, context, listener) => {
    const tokens = exp.split('.')
    if (tokens[1]) {
      if (context.tmpCtxName === tokens[0]) {
        const tmpCtx = context[context.tmpCtxName]
        if (tmpCtx && tmpCtx.on) {
          tmpCtx.on(tokens[1], listener)
        }
      }
    } else {
      context.on && context.on(tokens[0], listener)
    }
  }

  const bindingForInstruction = (/** @type HTMLElement */ element) => {
    const forExp = element.getAttribute('for.')
    const match = forExp.match(
      /^\s*(((let|const|of)\s+)?(\w+)\s+(of|in)\s+)?\s*([\w.]+)\s*$/
    )
    if (!match || !match[6]) {
      throw new Error('Invalid for Expression')
    }
    const collectionName = match[6]
    const ofIn = match[5] || 'of'
    let varName = match[4]
    let forHead
    if (varName) {
      forHead = `for(const ${varName} ${ofIn} ${collectionName})`
    } else {
      varName = '$$i'
      forHead = `for(const ${varName} of ${collectionName})`
    }
    const comment = document.createComment(element.outerHTML)
    const parent = element.parentElement
    parent.insertBefore(comment, element)
    element.remove()
    /** @type Map<any, HTMLElement> */
    let items = new Map()
    /** @type Map<any, HTMLElement> */
    let newItems = new Map()
    let idx = 0
    let allRemoved = false
    const update = () => {
      ; (function ($$forEach) {
        newItems = new Map()
        idx = 0
        allRemoved = false
        with (this) {
          eval(`
          if (this.${collectionName}) {
            ${forHead}{
              $$forEach(${varName})
              }
          }`)
        }
        for (const [_, { item }] of items) {
          item.remove()
        }
        items = newItems
      }.call(element.context, ($$i) => {
        /** @type HTMLElement */
        let item
        if (items.has($$i)) {
          const pair = items.get($$i)
          item = pair.item
          if (!allRemoved && idx !== pair.idx) {
            console.log('removed')
            for (const [_, { item }] of items) {
              item.remove()
            }
            allRemoved = true
          }
          items.delete($$i)
        } else {
          item = element.cloneNode(true)
          item.removeAttribute('id')
          item.removeAttribute('for.')
          if (item.updateModel) {
            item.model = $$i
          } else {
            item.modelBeforeInit = $$i
          }
          const context = Object.create(element.context)
          context[varName] = $$i
          context.tmpCtxName = varName
          item.context = context
        }
        parent.insertBefore(item, comment)
        newItems.set($$i, { idx, item })
        binding(item)
        idx++
      }))
    }
    update()
    let lastContext = element.context
    comment.updateWhenModelChange = () => {
      if (lastContext === element.context) {
        return
      }
      lastContext = element.context
      update()
    }
    onprop(collectionName, element.context, update)
    return {}
  }

  const bindingIfInstruction = (/** @type HTMLElement */ element) => {
    const ifExp = element.getAttribute('if.')
    const comment = document.createComment(element.outerHTML)
    const parent = element.parentElement
    parent.insertBefore(comment, element)
    element.remove()
    let item
    const update = () => {
      const value = evalInContext(ifExp, element.context)
      if (value) {
        if (item) {
          return
        }
        item = element.cloneNode(true)
        item.removeAttribute('if.')
        parent.insertBefore(item, comment)
        item.context = element.context
        binding(item)
      } else if (item) {
        item.remove()
        item = null
      }
    }
    update()
    let lastContext = element.context
    comment.updateWhenModelChange = () => {
      if (lastContext === element.context) {
        return
      }
      lastContext = element.context
      update()
    }
    for (const exp of getPropsFromExp(ifExp)) {
      onprop(exp, element.context, update)
    }
    return {}
  }

  const getPropNameFromBindingAttr = (attr) => {
    return attr.replace(/-(\w)/g, (_, c) => c.toUpperCase())
  }

  const getPropsFromExp = (exp) => {
    return exp.match(/[a-zA-Z0-9_$.]+/g) || []
  }

  const bindingAttrs = (/** @type HTMLElement */ element) => {
    if (element.hasAttribute('for.')) {
      return bindingForInstruction(element)
    }
    if (element.hasAttribute('if.')) {
      return bindingIfInstruction(element)
    }
    if (element.updateWhenModelChange) {
      element.updateWhenModelChange()
      return element
    }
    const bindingAttrs = element
      .getAttributeNames()
      .filter((p) => p.endsWith('.'))
    for (const prop of bindingAttrs) {
      const $$exp = element.getAttribute(prop)
      const effectedAttr = prop
        .slice(0, -'.'.length)
        .split(',')
        .map((a) => a.trim())
        .filter((a) => a)

      if (effectedAttr.some((a) => a.startsWith('on'))) {
        const value = `(function($event){with(this){${$$exp}}}).call(event.target.context, event)`
        for (const ea of effectedAttr) {
          if (ea.endsWith('$')) {
            element.setAttribute(
              ea.slice(0, -1),
              'event.stopPropagation();' + value
            )
          } else {
            element.setAttribute(ea, value)
          }
        }
        continue
      }
      const update = () => {
        const value = evalInContext($$exp, element.context)
        for (const ea of effectedAttr) {
          if (ea === 'model') {
            if (element.updateModel) {
              element.updateModel(value)
            } else {
              element.modelBeforeInit = value
            }
            continue
          }
          if (ea.startsWith('class-')) {
            const className = ea.slice('class-'.length)
            if (value) {
              element.classList.add(className)
            } else {
              element.classList.remove(className)
            }
            continue
          } else if (ea.startsWith('style-')) {
            const prop = ea.slice('style-'.length, -1)
            element.style[prop] = value
            continue
          }
          if (ea.endsWith('$')) {
            const prop = getPropNameFromBindingAttr(ea.slice(0, -1))
            element[prop] = value
            continue
          }
          if (value === undefined || value === null) {
            element.removeAttribute(ea)
          } else if (element[ea] !== value) {
            element.setAttribute(ea, value)
          }
        }
      }
      update()
      for (const exp of getPropsFromExp($$exp)) {
        onprop(exp, element.context, update)
      }
    }
    return element
  }

  const binding = (/** @type HTMLElement */ element) => {
    /** @type { Object.<string,HTMLElement> } */
    const components = element.context.components
    if (element.hasAttribute) {
      const handler = bindingAttrs(element)
      // collect ids
      if (element.hasAttribute('id')) {
        components[element.getAttribute('id')] = handler
      }
      if (handler !== element) {
        return
      }
    }
    for (const child of [...element.children]) {
      if (
        child.context === element.context ||
        (child.context &&
          Object.getPrototypeOf(child.context) === element.context)
      ) {
      } else {
        child.context = element.context
      }
      binding(child)
    }
  }

  const getNameFromTagName = (tagName) => {
    return tagName.replace(/(?:^|-)(\w)/g, (_, c) => c.toUpperCase())
  }

  const registerProperties = (obj, ...props) => {
    if (!obj.define) {
      addPropChange(obj)
    }
    props.forEach((prop) => {
      let propValue
      Object.defineProperty(obj, prop, {
        get () {
          return propValue
        },
        set (newValue) {
          const oldValue = propValue
          propValue = newValue
          obj.raise(prop, newValue, oldValue)
        }
      })
    })
  }

  const addPropChange = (/** @type { Object } */ obj) => {
    /** @type Map<string, Set<{(newValue, oldValue):any}>> */
    const listeners = new Map()
    obj.define = (...props) => registerProperties(obj, ...props)
    obj.on = (/** @type string */ prop, listener) => {
      if (!listeners.has(prop)) {
        listeners.set(prop, new Set())
      }
      listeners.get(prop).add(listener)
    }
    obj.off = (prop, listener) => {
      if (!listeners.has(prop)) {
        return
      }
      listeners.get(prop).delete(listener)
    }
    obj.raise = (prop, newValue, oldValue) => {
      if (!listeners.has(prop)) {
        return
      }
      for (const listener of listeners.get(prop)) {
        listener(newValue, oldValue)
      }
    }
  }

  const registerElement = (tagName, /** @type { string } */ constructor) => {
    const elementClassName = `HTML${constructor || getNameFromTagName(tagName)
      }Element`
    constructor = constructor || 'Object'
    eval(`
    class ${elementClassName} extends HTMLElement{
      constructor(){
        super()
        const shadow = this.attachShadow({mode:'open'})
        const template = document.getElementById('${tagName}')
        if(!template || template.tagName !== 'TEMPLATE' ){
          throw new Error('Define Template')
        }
        this.template_ = template
        this.shadow_ = shadow
        this.model_ = new ${constructor}()
        this.model_.components = { host: this.shadow_ }
        if(this.context && this.hasAttribute('model.')){
          const modeExp = this.getAttribute('model.')
          this.model = evalInContext(modeExp, this.context)
        }else if(this.modelBeforeInit){
          this.model = this.modelBeforeInit
        }else{
          this.model =  {}
        }
      }

      rebuildView(){
        this.shadow_.innerHTML = ''
        const instance = document.importNode(this.template_.content, true)
        this.shadow_.appendChild(instance)
      }
  
      get model(){
        return this.model_
      }
  
      set model(value){
        //combine code behind with model
        Object.assign(this.model_, value)
        this.shadow_.context = this.model_ 
        this.rebuildView()
      }
  
      updateModel(value){
        this.model = value
        this.connectedCallback()
      }
      
      connectedCallback(){
        binding(this.shadow_)
        if(this.model_.launch){
          this.model_.launch()
        } 
      }
    }
    customElements.define('${tagName}', ${elementClassName})
    `)
  }
  return { registerElement, registerProperties }
})()

const sleep = (timeout) =>
  new Promise((resolve) => setTimeout(resolve, timeout))

class AppBase {
  async launch () {
    this.storage = this.initStorage_()
    this.data = await this.initData(window.appData)
    window.app = this
    await this.start()
  }

  async registerStorageProperties (...props) {
    if (!this.storage) {
      return
    }
    let asyncTimeout = 50
    const bgTimeout = 200
    for (const [prop, defaultValue, onchange] of props) {
      let propValue
      let valueModified = false
      let successLoadFromStorage = false
      let loadFunc
      let bgLoad = false
      const mergeValue = (savedValue) => {
        if (successLoadFromStorage) {
          return
        }
        successLoadFromStorage = true
        if (!valueModified) {
          valueModified = true
          propValue = savedValue
        } else {
          // merge strategy
          propValue = savedValue
        }
        if (bgLoad && onchange) {
          onchange()
        }
      }
      loadFunc = async () => {
        const jsonStr = await this.storage.getItem(prop)
        let savedValue
        if (!jsonStr) {
          savedValue = defaultValue
        } else {
          try {
            savedValue = JSON.parse(jsonStr)
          } catch {
            savedValue = defaultValue
          }
        }
        mergeValue(savedValue)
      }
      const tryLoad = async () => {
        bgLoad = true
        const func = loadFunc
        loadFunc = null
        await Promise.race([
          func(),
          sleep(bgTimeout).then(() => {
            if (!successLoadFromStorage) {
              loadFunc = func
            }
          })
        ])
      }
      await Promise.race([
        loadFunc(),
        sleep(asyncTimeout).then(() => {
          if (!valueModified) {
            propValue = defaultValue
            valueModified = true
            asyncTimeout = 0
          }
        })
      ])
      Object.defineProperty(this, prop, {
        get () {
          if (loadFunc) {
            tryLoad()
          }
          return propValue
        },
        set (newValue) {
          propValue = newValue
          if (successLoadFromStorage) {
            this.storage.setItem(prop, JSON.stringify(propValue))
          }
        }
      })
    }
  }

  initStorage_ () {
    if (window.$localStorage) {
      return window.$localStorage
    }
    try {
      const s = window.localStorage
      return s
    } catch {
      return {
        getItem: () => '',
        setItem: () => true
      }
    }
  }

  async initData (data) {
    return data
  }

  async start () {
    console.log('start')
  }

  async pause () {
    console.log('pause')
  }

  async resume () {
    console.log('pause')
  }

  async stop () {
    console.log('stop')
  }
}

window.onload = async () => {
  // eslint-disable-next-line no-undef
  Object.setPrototypeOf(App.prototype, AppBase.prototype)
  for (const template of document.querySelectorAll(
    'template[id][view-model]'
  )) {
    const tagName = template.getAttribute('id')
    if (!tagName) {
      continue
    }
    const codeBehind = template.getAttribute('view-model')
    registerElement(tagName, codeBehind)
  }
}

class MenuItem {
  constructor (name = '', onclick = null, show = true) {
    registerProperties(this, 'name', 'show')
    this.name = name
    this.show = show
    this.onclick = onclick
  }
}

class Modal {
  constructor () {
    /** @type { Object.<string,HTMLElement> } */
    // eslint-disable-next-line no-unused-expressions
    this.components
    /** @type { Storage | {  } } */
    // eslint-disable-next-line no-unused-expressions
    this.storage
    registerProperties(this, 'toastMessage')
  }

  toast (/** @string */ msg, /** @type number */ timeout = 1000) {
    return new Promise((resolve) => {
      this.toastMessage = msg
      setTimeout(() => {
        this.toastMessage = null
        resolve()
      }, timeout)
    })
  }
}

class Popup {}
