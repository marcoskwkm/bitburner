import type { NS } from '@ns'
import { SCRIPTS } from 'utils/constants'

const runScriptsInSequence = async (ns: NS, scripts: string[]) => {
  for (const script of scripts) {
    ns.tprint(`Running ${script}`)
    const pid = ns.run(script)
    while (ns.isRunning(pid)) {
      await ns.sleep(100)
    }
  }
}

export async function main(ns: NS) {
  await runScriptsInSequence(ns, [
    SCRIPTS.INIT_INFILTRATION_HELPERS,
    SCRIPTS.INIT_GAME_START,
  ])
}
