import { NS } from '@ns'

import * as Main from 'scripts/infiltration/main'
import * as Cyberpunk from 'scripts/infiltration/cyberpunk'
import { getDocument } from 'scripts/utils/dom'

type State = typeof Main.PAGE_ID | typeof Cyberpunk.PAGE_ID | null

const getPageHandler = () => {
  switch (true) {
    case Main.isCurrentPage():
      return Main
    case Cyberpunk.isCurrentPage():
      return Cyberpunk
    default:
      return null
  }
}

class InfiltrationManager {
  previousState: State = null
  cleanupCallbacks: (() => void)[] = []

  update() {
    const handler = getPageHandler()

    if (!handler) {
      console.log('Current state: null')
      this.previousState = null

      this.cleanupCallbacks.forEach((cb) => cb())
      this.cleanupCallbacks = []

      return
    }

    console.log('Current state:', handler.PAGE_ID)

    if (this.previousState !== handler.PAGE_ID) {
      const cb = handler.init()

      if (typeof cb === 'function') {
        this.cleanupCallbacks.push(cb)
      }

      this.previousState = handler.PAGE_ID
      return
    }

    const cb = handler.update()

    if (typeof cb === 'function') {
      this.cleanupCallbacks.push(cb)
    }

    this.previousState = handler.PAGE_ID
  }
}

export async function main(_: NS) {
  const manager = new InfiltrationManager()
  const observer = new MutationObserver(() => manager.update())
  const rootElement = getDocument().getElementById('root')

  if (!rootElement) {
    throw new Error('Root element not found')
  }

  observer.observe(rootElement, {
    childList: true,
    subtree: true,
  })
}
