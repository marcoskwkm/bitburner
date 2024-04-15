import { NS } from '@ns'

import * as BackwardGame from 'scripts/infiltration/backward-game'
import * as CheatCodeGame from 'scripts/infiltration/cheat-code-game'
import * as Main from 'scripts/infiltration/main'
import * as Cyberpunk from 'scripts/infiltration/cyberpunk'
import * as WireCutting from 'scripts/infiltration/wire-cutting'
import { getDocument } from 'scripts/utils/dom'

type State =
  | typeof BackwardGame.PAGE_ID
  | typeof Main.PAGE_ID
  | typeof Cyberpunk.PAGE_ID
  | typeof CheatCodeGame.PAGE_ID
  | typeof WireCutting.PAGE_ID
  | null

const getPageHandler = () => {
  switch (true) {
    case BackwardGame.isCurrentPage():
      return BackwardGame
    case CheatCodeGame.isCurrentPage():
      return CheatCodeGame
    case Main.isCurrentPage():
      return Main
    case Cyberpunk.isCurrentPage():
      return Cyberpunk
    case WireCutting.isCurrentPage():
      return WireCutting
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
      console.log('Initializing', handler.PAGE_ID)

      const cb = handler.init()

      if (typeof cb === 'function') {
        this.cleanupCallbacks.push(cb)
      }

      this.previousState = handler.PAGE_ID
      return
    }

    console.log('Updating', handler.PAGE_ID)
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
