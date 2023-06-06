/*
 * Same as hack-v2, but this also implements a sync barrier so that all hack-v3
 * scripts remain in sync, even if they are executed at different times.
 */

import { NS } from '@ns'

import { HOSTS, SCRIPTS } from 'scripts/utils/constants'

const REGISTRATION_TIME = 5000
const OFFSET = 1000

let busy = false
let registrationOpen = false
const participants = new Set<string>()

const register = async (ns: NS, id: string) => {
  while (busy) {
    ns.print('Waiting for barrier')
    await ns.sleep(1000)
  }

  if (!registrationOpen) {
    registrationOpen = true
    setTimeout(() => {
      busy = true
      registrationOpen = false
      // console.log(`Participants: ${[...participants.values()].join(', ')}`)
    }, REGISTRATION_TIME)
  }

  participants.add(id)
}

const finish = (id: string) => {
  participants.delete(id)

  if (participants.size === 0) {
    busy = false
  }
}

export async function main(ns: NS): Promise<void> {
  const host = ns.getHostname()
  const target = (ns.args[0] as string) ?? HOSTS.JOESGUNS

  if (!target) {
    ns.print('Missing target argument')
    ns.exit()
  }

  const getHostAvailableRam = () =>
    ns.getServerMaxRam(host) - ns.getServerUsedRam(host)

  const hackRam = ns.getScriptRam(SCRIPTS.SIMPLE_HACK)
  const growRam = ns.getScriptRam(SCRIPTS.SIMPLE_GROW)
  const weakenRam = ns.getScriptRam(SCRIPTS.SIMPLE_WEAKEN)

  if (getHostAvailableRam() < 2 * hackRam) {
    ns.print(`Host ${host} does not have enough RAM for this script, aborting.`)
    ns.exit()
  }

  ns.atExit(() => {
    if (participants.has(host)) {
      finish(host)
    }
  })

  const minSecurity = ns.getServerMinSecurityLevel(target)
  const maxMoney = ns.getServerMaxMoney(target)

  const targetSecurity = Math.max(1.3 * minSecurity, minSecurity + 5)
  const targetMoney = (0.75 * maxMoney) as number

  while (true) {
    await register(ns, host)

    const curSecurity = ns.getServerSecurityLevel(target)
    const curMoney = ns.getServerMoneyAvailable(target)
    const availableRam = getHostAvailableRam()

    if (curSecurity > targetSecurity) {
      ns.printf(
        'Lowering difficulty (current: %.3f, target: %.3f)',
        curSecurity,
        targetSecurity
      )

      const weakenThreads = Math.floor(availableRam / weakenRam)
      const weakenTime = ns.getWeakenTime(target)

      ns.exec(SCRIPTS.SIMPLE_WEAKEN, host, weakenThreads, target)
      await ns.sleep(weakenTime + OFFSET)
    } else if (curMoney < targetMoney) {
      ns.printf(
        'Increasing available money (current: %s, target: %s)',
        ns.formatNumber(curMoney),
        ns.formatNumber(targetMoney)
      )

      const growThreads = Math.floor(availableRam / 2 / growRam)
      const growTime = ns.getGrowTime(target)
      const weakenThreads = Math.floor(
        (availableRam - growThreads * growRam) / weakenRam
      )
      const weakenTime = ns.getWeakenTime(target)

      ns.exec(SCRIPTS.SIMPLE_GROW, host, growThreads, target)
      await ns.sleep(Math.max(0, growTime - weakenTime))
      ns.exec(SCRIPTS.SIMPLE_WEAKEN, host, weakenThreads, target)
      await ns.sleep(weakenTime + OFFSET)
    } else {
      const hackThreads = Math.floor(availableRam / 2 / hackRam)
      const hackTime = ns.getHackTime(target)
      const weakenThreads = Math.floor(
        (availableRam - hackThreads * hackRam) / weakenRam
      )
      const weakenTime = ns.getWeakenTime(target)

      ns.exec(SCRIPTS.SIMPLE_HACK, host, hackThreads, target)
      await ns.sleep(Math.max(0, hackTime - weakenTime))
      ns.exec(SCRIPTS.SIMPLE_WEAKEN, host, weakenThreads, target)
      await ns.sleep(weakenTime + OFFSET)
    }

    finish(host)
  }
}
