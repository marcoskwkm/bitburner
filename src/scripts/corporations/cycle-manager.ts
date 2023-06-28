import { NS } from '@ns'

import { waitForCycle } from 'scripts/corporations/utils'

export class CycleManager {
  ns: NS
  recurrentFunctions: (() => any)[]

  constructor(ns: NS) {
    this.ns = ns
    this.recurrentFunctions = []
  }

  registerRecurrentFunction(fn: () => any) {
    this.recurrentFunctions.push(fn)
  }

  unregisterRecurrentFunction(fn: () => any) {
    this.recurrentFunctions = this.recurrentFunctions.filter((rf) => rf !== fn)
  }

  async waitForCycle() {
    await waitForCycle(this.ns)
    this.recurrentFunctions.forEach((fn) => fn())
  }
}
