/*
 * Improves v3 implementing a HGW strategy and a UI with server stats
 */

import { NS } from '@ns'

import { SCRIPTS } from 'scripts/utils/constants'
import { formatTime } from 'scripts/utils/time'

const REGISTRATION_TIME_MS = 5000
const OFFSET_MS = 1000

interface BarrierStatus {
  busy: boolean
  registering: boolean
  participants: Set<string>
  members: Set<string>
}

interface ScriptStartEvent {
  type: 'script-start'
  script: 'grow' | 'hack' | 'weaken'
  threads: number
  t: number
}

interface ScriptEndEvent {
  type: 'script-end'
  script: 'grow' | 'hack' | 'weaken'
  t: number
}

type Event = ScriptStartEvent | ScriptEndEvent

class Barrier {
  static status: Record<string, BarrierStatus> = {}

  static init(barrierId: string) {
    if (!this.status[barrierId]) {
      this.status[barrierId] = {
        busy: false,
        registering: false,
        participants: new Set(),
        members: new Set(),
      }
    }
  }

  static join(id: string, barrierId: string) {
    this.init(barrierId)
    const status = this.status[barrierId]
    status.members.add(id)
  }

  static leave(ns: NS, id: string, barrierId: string, ui: UI) {
    this.init(barrierId)
    const status = this.status[barrierId]
    status.members.delete(id)

    if (status.members.size === 0) {
      ui.destroy()
    }

    if (status.participants.has(id)) {
      this.finish(ns, id, barrierId)
    }
  }

  static async register(ns: NS, id: string, barrierId: string) {
    this.init(barrierId)
    const status = this.status[barrierId]

    while (status.busy) {
      ns.print('Waiting for barrier')
      await ns.sleep(1000)
    }

    let isManager = false

    if (!status.registering) {
      status.registering = true
      isManager = true

      setTimeout(() => {
        status.busy = true
        status.registering = false
      }, REGISTRATION_TIME_MS)
    }

    status.participants.add(id)
    return isManager
  }

  static finish(ns: NS, id: string, barrierId: string) {
    const status = this.status[barrierId]

    if (!status) {
      ns.print(
        'Warning: Trying to finish in barrier that does not exist, which is a no-op.'
      )
      return
    }

    if (!status.participants.has(id)) {
      ns.print(
        'Warning: Trying to finish an element that is not in the barrier, which is a no-op.'
      )
      return
    }

    status.participants.delete(id)

    if (status.participants.size === 0) {
      status.busy = false
    }
  }
}

class UI {
  id: string
  containerId: string
  securityId: string
  moneyId: string
  timersId: string
  minSecurity: number
  maxMoney: number
  ns: NS

  constructor(
    ns: NS,
    id: string,
    stats: { minSecurity: number; maxMoney: number }
  ) {
    this.ns = ns
    this.id = id
    this.containerId = `hack-status-${id}`
    this.securityId = this.containerId + '--security'
    this.moneyId = this.containerId + '--money'
    this.timersId = this.containerId + '--timers'
    this.minSecurity = stats.minSecurity
    this.maxMoney = stats.maxMoney

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

    const title = doc.createElement('div')
    title.style.padding = '0.5rem'
    title.style.alignSelf = 'center'
    title.innerText = 'Hack v4'
    title.style.fontWeight = 'bold'
    container.append(title)

    const target = doc.createElement('div')
    target.innerText = `Target: ${this.id}`
    container.append(target)

    const security = doc.createElement('div')
    security.id = this.securityId
    security.innerText = 'Security: 0 (min: 0)'
    container.append(security)

    const money = doc.createElement('div')
    money.id = this.moneyId
    money.innerText = 'Money: 0 (max: 0)'
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

export async function main(ns: NS): Promise<void> {
  const host = ns.getHostname()
  const target = ns.args[0] as string

  if (!target) {
    ns.print('Missing target argument')
    ns.exit()
  }

  const getHostAvailableRam = () =>
    ns.getServerMaxRam(host) - ns.getServerUsedRam(host)

  const hackRam = ns.getScriptRam(SCRIPTS.SIMPLE_HACK)
  const growRam = ns.getScriptRam(SCRIPTS.SIMPLE_GROW)
  const weakenRam = ns.getScriptRam(SCRIPTS.SIMPLE_WEAKEN)

  if (getHostAvailableRam() < 4 * hackRam) {
    ns.print(`Host ${host} does not have enough RAM for this script, aborting.`)
    ns.exit()
  }

  ns.atExit(() => {
    Barrier.leave(ns, host, target, ui)
  })

  Barrier.join(host, target)

  const minSecurity = ns.getServerMinSecurityLevel(target)
  const maxMoney = ns.getServerMaxMoney(target)

  const ui = new UI(ns, target, { minSecurity, maxMoney })

  while (true) {
    const isManager = await Barrier.register(ns, host, target)

    const curSecurity = ns.getServerSecurityLevel(target)
    const curMoney = ns.getServerMoneyAvailable(target)
    const availableRam = getHostAvailableRam()

    isManager && ui.setSecurity(curSecurity)
    isManager && ui.setMoney(curMoney)

    const events: Event[] = []

    if (curSecurity > minSecurity) {
      const weakenThreads = Math.floor(availableRam / weakenRam)
      const weakenTime = ns.getWeakenTime(target)

      if (isManager) {
        ui.addTimer('Weaken', weakenTime)
      }

      events.push({
        type: 'script-start',
        script: 'weaken',
        threads: weakenThreads,
        t: 0,
      })
      events.push({
        type: 'script-end',
        script: 'weaken',
        t: weakenTime,
      })
    } else if (curMoney < maxMoney) {
      const growThreads = Math.floor(availableRam / 2 / growRam)
      const growTime = ns.getGrowTime(target)
      const weakenThreads = Math.floor(
        (availableRam - growThreads * growRam) / weakenRam
      )
      const weakenTime = ns.getWeakenTime(target)
      const weakenDelay = Math.max(0, growTime - weakenTime + OFFSET_MS)

      if (isManager) {
        ui.addTimer('Grow', growTime)
        ui.addTimer('Weaken', weakenDelay + weakenTime)
      }

      events.push({
        type: 'script-start',
        script: 'grow',
        threads: growThreads,
        t: 0,
      })
      events.push({
        type: 'script-end',
        script: 'grow',
        t: growTime,
      })
      events.push({
        type: 'script-start',
        script: 'weaken',
        threads: weakenThreads,
        t: weakenDelay,
      })
      events.push({
        type: 'script-end',
        script: 'weaken',
        t: weakenDelay + weakenTime,
      })
    } else {
      const hackThreads = Math.floor(availableRam / 4 / hackRam)
      const hackTime = ns.getHackTime(target)
      const growThreads = Math.floor(availableRam / 4 / growRam)
      const growTime = ns.getGrowTime(target)
      const weakenThreads = Math.floor(
        (availableRam - hackThreads * hackRam - growThreads * growRam) /
          weakenRam
      )
      const weakenTime = ns.getWeakenTime(target)
      const growDelay = Math.max(0, hackTime - growTime + OFFSET_MS)
      const weakenDelay = Math.max(
        0,
        growDelay + growTime - weakenTime + OFFSET_MS
      )

      if (isManager) {
        ui.addTimer('Hack', hackTime)
        ui.addTimer('Grow', growDelay + growTime)
        ui.addTimer('Weaken', weakenDelay + weakenTime)
      }

      events.push({
        type: 'script-start',
        script: 'hack',
        threads: hackThreads,
        t: 0,
      })
      events.push({
        type: 'script-end',
        script: 'hack',
        t: hackTime,
      })
      events.push({
        type: 'script-start',
        script: 'grow',
        threads: growThreads,
        t: growDelay,
      })
      events.push({
        type: 'script-end',
        script: 'grow',
        t: growDelay + growTime,
      })
      events.push({
        type: 'script-start',
        script: 'weaken',
        threads: weakenThreads,
        t: weakenDelay,
      })
      events.push({
        type: 'script-end',
        script: 'weaken',
        t: weakenDelay + weakenTime,
      })
    }

    events.sort((a, b) => a.t - b.t)
    let elapsedTime = 0

    for (const event of events) {
      await ns.sleep(event.t - elapsedTime)
      elapsedTime = event.t

      if (event.type === 'script-start') {
        const script =
          event.script === 'grow'
            ? SCRIPTS.SIMPLE_GROW
            : event.script === 'hack'
            ? SCRIPTS.SIMPLE_HACK
            : SCRIPTS.SIMPLE_WEAKEN
        ns.exec(script, host, event.threads, target)
      } else {
        if (event.script === 'grow' || event.script === 'hack') {
          ui.setMoney(ns.getServerMoneyAvailable(target))
        }
        ui.setSecurity(ns.getServerSecurityLevel(target))
      }
    }

    Barrier.finish(ns, host, target)
  }
}
