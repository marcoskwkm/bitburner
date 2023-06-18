import { NS } from '@ns'

import {
  maximizeMoraleAndEnergy,
  waitForCycle,
} from 'scripts/corporations/utils'

export async function main(ns: NS): Promise<void> {
  ns.disableLog('ALL')

  while (true) {
    const divisions = ns.corporation.getCorporation().divisions
    const industries = [
      ...new Set(
        divisions.map((divName) => ns.corporation.getDivision(divName).type)
      ),
    ]

    await maximizeMoraleAndEnergy(ns, industries)
    await waitForCycle(ns)
  }
}
