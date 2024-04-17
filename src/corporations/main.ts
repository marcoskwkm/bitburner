import { NS } from '@ns'

import * as Round1 from 'corporations/round-1'
import * as Round2 from 'corporations/round-2'
import * as Round3 from 'corporations/round-3'

import { formatTime } from 'utils/time'

export async function main(ns: NS) {
  ns.disableLog('ALL')

  const start = performance.now()

  const roundsToDo = ns.args

  for (const round of roundsToDo) {
    switch (round) {
      case 1:
        await Round1.doit(ns)
        break

      case 2:
        await Round2.doit(ns)
        break

      case 3:
        await Round3.doit(ns)
        break
    }

    ns.print(
      `Finished round ${round}. Elapsed time since script started: ${formatTime(
        performance.now() - start
      )}`
    )
  }
}
