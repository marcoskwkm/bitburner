import type { NS } from '@ns'

import { InfiltrationManager } from 'infiltration/index'
import { getDocument } from 'utils/dom'

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
