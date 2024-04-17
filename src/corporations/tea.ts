import { type CorpIndustryName, NS } from '@ns'

import { maximizeMoraleAndEnergy, waitForCycle } from 'corporations/utils'

export async function main(ns: NS): Promise<void> {
  ns.disableLog('ALL')

  while (true) {
    const industries =
      ns.args.length > 0
        ? (ns.args as CorpIndustryName[])
        : [
            ...new Set(
              ns.corporation
                .getCorporation()
                .divisions.map(
                  (divName) => ns.corporation.getDivision(divName).type
                )
            ),
          ]

    await maximizeMoraleAndEnergy(ns, industries)
    await waitForCycle(ns)
  }
}
