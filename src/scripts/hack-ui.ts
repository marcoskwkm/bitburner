import { NS } from '@ns'

import { formatTime } from 'scripts/utils/time'

export class UI {
  id: string
  containerId: string
  securityId: string
  moneyId: string
  timersId: string
  minSecurity: number
  maxMoney: number
  ns: NS
  title: string

  constructor(
    ns: NS,
    id: string,
    stats: { minSecurity: number; maxMoney: number },
    title: string
  ) {
    this.ns = ns
    this.id = id
    this.containerId = `hack-status-${id}`
    this.securityId = this.containerId + '--security'
    this.moneyId = this.containerId + '--money'
    this.timersId = this.containerId + '--timers'
    this.minSecurity = stats.minSecurity
    this.maxMoney = stats.maxMoney
    this.title = title

    this.init()
  }

  destroy() {
    const doc = eval('document') as Document
    const container = doc.getElementById(this.containerId)

    if (container) {
      doc.body.removeChild(container)
    }
  }

  init() {
    const doc = eval('document') as Document

    if (doc.getElementById(this.containerId)) {
      return
    }

    // TODO: Make this draggable
    const container = doc.createElement('div')
    container.id = this.containerId
    container.style.position = 'fixed'
    container.style.bottom = '2rem'
    container.style.right = '0'
    container.style.display = 'flex'
    container.style.flexDirection = 'column'
    container.style.fontFamily =
      '"Lucida Console", "Lucida Sans Unicode", "Fira Mono", Consolas, "Courier New", Courier, monospace, "Times New Roman"'
    container.style.zIndex = '100'
    container.style.color = '#0c0'
    container.style.borderStyle = 'solid'
    container.style.borderColor = 'rgb(128, 128, 128)'
    container.style.borderWidth = '1px'
    container.style.padding = '0.5rem'
    container.style.backgroundColor = 'black'

    const title = doc.createElement('div')
    title.style.padding = '0.5rem'
    title.style.alignSelf = 'center'
    title.innerText = this.title
    title.style.fontWeight = 'bold'
    container.append(title)

    const target = doc.createElement('div')
    target.innerText = `Target: ${this.id}`
    container.append(target)

    const security = doc.createElement('div')
    security.id = this.securityId
    security.innerText = `Security: 0 (min: ${this.minSecurity})`
    container.append(security)

    const money = doc.createElement('div')
    money.id = this.moneyId
    money.innerText = `Money: 0 (max: ${this.maxMoney})`
    container.append(money)

    const timers = doc.createElement('div')
    timers.id = this.timersId
    timers.style.marginTop = '1rem'
    container.append(timers)

    doc.body.append(container)
  }

  setSecurity(security: number) {
    const doc = eval('document') as Document

    const el = doc.getElementById(this.securityId)

    if (el) {
      el.innerText = `Security: ${security.toFixed(3)} (min: ${
        this.minSecurity
      })`
    }
  }

  setMoney(money: number) {
    const doc = eval('document') as Document

    const el = doc.getElementById(this.moneyId)

    if (el) {
      el.innerText = `Money: ${this.ns.formatNumber(
        money
      )} (max: ${this.ns.formatNumber(this.maxMoney)})`
    }
  }

  addTimer(label: string, time: number) {
    const doc = eval('document') as Document

    const now = performance.now()
    const target = now + time

    const el = doc.createElement('div')
    const container = doc.getElementById(this.timersId)

    const refresh = () => {
      const remTime = target - performance.now()

      if (remTime < 0) {
        container?.removeChild(el)
        return
      }

      el.innerText = `${label}: ${formatTime(remTime)}`
      setTimeout(refresh, 200)
    }

    refresh()
    container?.append(el)
  }
}
