import { NS } from '@ns'

import { HOSTS } from 'scripts/utils/constants'

export async function main(ns: NS): Promise<void> {
  const serverName = (ns.args[0] as string) ?? HOSTS.MAX_HARDWARE

  ns.printf('Hacking %s...', serverName)

  const minSecurity = ns.getServerMinSecurityLevel(serverName)
  const maxMoney = ns.getServerMaxMoney(serverName)

  const targetSecurity = Math.max(1.3 * minSecurity, minSecurity + 5)
  const targetMoney = (0.75 * maxMoney) as number

  while (true) {
    const curSecurity = ns.getServerSecurityLevel(serverName)
    const curMoney = ns.getServerMoneyAvailable(serverName)

    if (curSecurity > targetSecurity) {
      ns.printf(
        'Lowering difficulty (current: %.3f, target: %.3f)',
        curSecurity,
        targetSecurity
      )

      await ns.weaken(serverName)
    } else if (curMoney < targetMoney) {
      ns.printf(
        'Increasing available money (current: %s, target: %s)',
        ns.formatNumber(curMoney),
        ns.formatNumber(targetMoney)
      )

      await ns.grow(serverName)
    } else {
      await ns.hack(serverName)
    }
  }
}
