import type { NS } from '@ns'

import { SCRIPTS } from '/utils/constants'

const getUnownedDarkwebPrograms = (ns: NS) =>
  ns.singularity
    .getDarkwebPrograms()
    .filter((program) => !ns.fileExists(program))

const getDarkwebProgramsCost = (ns: NS) =>
  getUnownedDarkwebPrograms(ns).reduce(
    (acc, program): number =>
      acc + ns.singularity.getDarkwebProgramCost(program),
    0
  )

const getCurMoney = (ns: NS) => ns.getServerMoneyAvailable('home')

export async function main(ns: NS) {
  ns.disableLog('ALL')

  if (ns.getPlayer().exp.hacking !== 0 || ns.singularity.isBusy()) {
    ns.tprint('Not at game start. Aborting...')
    return
  }

  ns.print('Starting Algorithms course at Rothman University')
  ns.singularity.universityCourse('Rothman University', 'Algorithms', false)

  if (!ns.hasTorRouter()) {
    while (getCurMoney(ns) < 200000) {
      ns.print('Waiting for money for TOR router')
      await ns.sleep(1000)
    }

    ns.print('Buying TOR router')
    ns.singularity.purchaseTor()
  }

  while (getCurMoney(ns) < getDarkwebProgramsCost(ns)) {
    ns.print('Waiting for money to buy darkweb programs')
    await ns.sleep(1000)
  }

  ns.print('Buying darkweb programs')
  getUnownedDarkwebPrograms(ns).forEach(ns.singularity.purchaseProgram)

  ns.print('Moving to Aevum')
  ns.singularity.travelToCity('Aevum')

  ns.print('Buying all servers we can afford')
  const autobuyPid = ns.run(SCRIPTS.SERVERS_AUTOBUY)
  await ns.sleep(100)
  ns.kill(autobuyPid)

  ns.print('Start weakening n00dles')
  ns.run(SCRIPTS.WEAKEN_ALL, undefined, 'n00dles')
}
