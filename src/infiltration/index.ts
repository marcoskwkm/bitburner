import { NS } from '@ns'

import * as BackwardGame from 'infiltration/backward-game'
import * as BracketGame from 'infiltration/bracket-game'
import * as BribeGame from 'infiltration/bribe-game'
import * as CheatCodeGame from 'infiltration/cheat-code-game'
import * as Cyberpunk from 'infiltration/cyberpunk'
import * as Main from 'infiltration/main'
import * as MinesweeperGame from 'infiltration/minesweeper-game'
import * as SlashGame from 'infiltration/slash-game'
import * as WireCutting from 'infiltration/wire-cutting'
import { getDocument } from 'utils/dom'

type State =
  | typeof BackwardGame.PAGE_ID
  | typeof BracketGame.PAGE_ID
  | typeof BribeGame.PAGE_ID
  | typeof CheatCodeGame.PAGE_ID
  | typeof Cyberpunk.PAGE_ID
  | typeof Main.PAGE_ID
  | typeof MinesweeperGame.PAGE_ID
  | typeof SlashGame.PAGE_ID
  | typeof WireCutting.PAGE_ID
  | null

const getPageHandler = () => {
  switch (true) {
    case BackwardGame.isCurrentPage():
      return BackwardGame
    case BracketGame.isCurrentPage():
      return BracketGame
    case BribeGame.isCurrentPage():
      return BribeGame
    case CheatCodeGame.isCurrentPage():
      return CheatCodeGame
    case Cyberpunk.isCurrentPage():
      return Cyberpunk
    case Main.isCurrentPage():
      return Main
    case MinesweeperGame.isCurrentPage():
      return MinesweeperGame
    case SlashGame.isCurrentPage():
      return SlashGame
    case WireCutting.isCurrentPage():
      return WireCutting
    default:
      return null
  }
}

export class InfiltrationManager {
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

export async function main(ns: NS) {
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

  ns.tprint('Infiltration helpers loaded.')
}
