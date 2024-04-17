/*
 * v5 of the hacking script
 * This version implements a single main script that manages the execution of
 * hack/grow/weaken scripts in every server and also tries to optimize the
 * ratio of hack/grow/weaken threads.
 */

import { NS } from '@ns'

import { UI } from 'hacking/ui'
import { getAllServers, Server } from '/utils/servers'
import { FILES, HOSTS, SCRIPTS } from '/utils/constants'

interface ScriptStartEvent {
  type: 'script-start'
  script: 'grow' | 'hack' | 'weaken'
  threads: number
  t: number
}

interface ScriptEndEvent {
  type: 'script-end'
  script: 'grow' | 'hack' | 'weaken'
  t: number
}

type Event = ScriptStartEvent | ScriptEndEvent

const OFFSET_MS = 500
const SCRIPT_FINISH_WAIT_TIME_MS = 100
const HOME_RESERVED_RAM_GB = 6

const nukeServers = (ns: NS, activeServers: Server[]) => {
  const PORT_PROGRAMS = [
    {
      filename: FILES.BRUTE_SSH,
      cmd: ns.brutessh,
    },
    {
      filename: FILES.FTP_CRACK,
      cmd: ns.ftpcrack,
    },
    {
      filename: FILES.RELAY_SMTP,
      cmd: ns.relaysmtp,
    },
    {
      filename: FILES.HTTP_WORM,
      cmd: ns.httpworm,
    },
    {
      filename: FILES.SQL_INJECT,
      cmd: ns.sqlinject,
    },
  ]

  const FILES_TO_COPY = [
    SCRIPTS.SIMPLE_GROW,
    SCRIPTS.SIMPLE_HACK,
    SCRIPTS.SIMPLE_WEAKEN,
  ]

  const curPrograms = PORT_PROGRAMS.filter(({ filename }) =>
    ns.fileExists(filename, HOSTS.HOME)
  )

  const remainingServers = getAllServers(ns).filter(
    (server) => !activeServers.some((s) => s.host === server.host)
  )

  const newServers = []
  for (const server of remainingServers) {
    if (!ns.hasRootAccess(server.host)) {
      if (
        ns.getServerRequiredHackingLevel(server.host) < ns.getHackingLevel() &&
        ns.getServerNumPortsRequired(server.host) <= curPrograms.length
      ) {
        curPrograms.forEach((prog) => prog.cmd(server.host))
        ns.nuke(server.host)
      }
    }

    if (ns.hasRootAccess(server.host)) {
      newServers.push(server)
      ns.scp(FILES_TO_COPY, server.host, HOSTS.HOME)
    }
  }

  if (newServers.length > 0) {
    ns.toast(
      `New servers available for hacking: ${newServers
        .map((s) => s.host)
        .join(', ')}`
    )
  }

  return newServers
}

const countServerThreads = (ns: NS, server: string) => {
  const scriptRam = Math.max(
    ns.getScriptRam(SCRIPTS.SIMPLE_GROW, server),
    ns.getScriptRam(SCRIPTS.SIMPLE_HACK, server),
    ns.getScriptRam(SCRIPTS.SIMPLE_WEAKEN, server)
  )

  let availableRam = ns.getServerMaxRam(server) - ns.getServerUsedRam(server)

  if (server === HOSTS.HOME) {
    availableRam = Math.max(0, availableRam - HOME_RESERVED_RAM_GB)
  }

  return Math.floor(availableRam / scriptRam)
}

const countThreads = (ns: NS, servers: Server[]) =>
  servers.reduce((acc, server) => acc + countServerThreads(ns, server.host), 0)

const getThreadsForGrow = (totalThreads: number) => {
  // TODO: Implement logic when Formulas API is available
  const growThreads = Math.floor((11 * totalThreads) / 12)
  const weakenThreads = totalThreads - growThreads

  return { growThreads, weakenThreads }
}

const getThreadsForHack = (totalThreads: number) => {
  // TODO: Implement logic when Formulas API is available

  const hackThreads = Math.floor((1 * totalThreads) / 36)
  const growThreads = Math.floor((32 * totalThreads) / 36)
  const weakenThreads = totalThreads - hackThreads - growThreads

  return {
    hackThreads,
    growThreads,
    weakenThreads,
  }
}

export async function main(ns: NS) {
  ns.disableLog('ALL')

  const target = ns.args[0] as string

  if (!target) {
    ns.tprint('Missing target argument')
    ns.exit()
  }

  const activeServers: Server[] = []

  const minSecurity = ns.getServerMinSecurityLevel(target)
  const maxMoney = ns.getServerMaxMoney(target)

  const ui = new UI(ns, target, { minSecurity, maxMoney }, 'Hack v5')

  ns.atExit(() => {
    ui.destroy()
  })

  while (true) {
    ns.print('Looking for new servers...')
    const newServers = nukeServers(ns, activeServers)
    activeServers.push(...newServers)

    if (newServers.length > 0) {
      ns.print(
        `Found ${newServers.length} new servers: ${newServers
          .map((s) => s.host)
          .join(', ')}`
      )
    } else {
      ns.print('No new servers found')
    }

    const totalThreads = countThreads(ns, activeServers)
    const curSecurity = ns.getServerSecurityLevel(target)
    const curMoney = ns.getServerMoneyAvailable(target)

    ui.setSecurity(curSecurity)
    ui.setMoney(curMoney)

    if (totalThreads === 0) {
      // Happens when hack-all.js is killed while hacking scripts are running
      ns.print('No threads available. Waiting...')
      await ns.sleep(1000)
      continue
    }

    const events: Event[] = []

    const pushEvent = (
      script: Event['script'],
      threads: number,
      startT: number,
      endT: number
    ) => {
      events.push({
        type: 'script-start',
        script,
        threads,
        t: startT,
      })
      events.push({
        type: 'script-end',
        script,
        t: endT,
      })
    }

    if (curSecurity > minSecurity) {
      const weakenTime = ns.getWeakenTime(target)

      ui.addTimer(`Weaken (${totalThreads})`, weakenTime)

      pushEvent('weaken', totalThreads, 0, weakenTime)
    } else if (curMoney < maxMoney) {
      const { growThreads, weakenThreads } = getThreadsForGrow(totalThreads)
      const growTime = ns.getGrowTime(target)
      const weakenTime = ns.getWeakenTime(target)
      const weakenDelay = Math.max(0, growTime - weakenTime + OFFSET_MS)

      ui.addTimer(`Grow (${growThreads})`, growTime)
      ui.addTimer(`Weaken (${weakenThreads})`, weakenDelay + weakenTime)

      pushEvent('grow', growThreads, 0, growTime)
      pushEvent('weaken', weakenThreads, weakenDelay, weakenDelay + weakenTime)
    } else {
      const { hackThreads, growThreads, weakenThreads } =
        getThreadsForHack(totalThreads)
      const hackTime = ns.getHackTime(target)
      const growTime = ns.getGrowTime(target)
      const weakenTime = ns.getWeakenTime(target)
      const growDelay = Math.max(0, hackTime - growTime + OFFSET_MS)
      const weakenDelay = Math.max(
        0,
        growDelay + growTime - weakenTime + OFFSET_MS
      )

      ui.addTimer(`Hack (${hackThreads})`, hackTime)
      ui.addTimer(`Grow (${growThreads})`, growDelay + growTime)
      ui.addTimer(`Weaken (${weakenThreads})`, weakenDelay + weakenTime)

      pushEvent('hack', hackThreads, 0, hackTime)
      pushEvent('grow', growThreads, growDelay, growDelay + growTime)
      pushEvent('weaken', weakenThreads, weakenDelay, weakenDelay + weakenTime)
    }

    events.sort((a, b) => a.t - b.t)
    let elapsedTime = 0

    for (const event of events) {
      await ns.sleep(event.t - elapsedTime)
      elapsedTime = event.t

      const script =
        event.script === 'grow'
          ? SCRIPTS.SIMPLE_GROW
          : event.script === 'hack'
          ? SCRIPTS.SIMPLE_HACK
          : SCRIPTS.SIMPLE_WEAKEN

      if (event.type === 'script-start') {
        let threadCnt = 0

        for (const server of activeServers) {
          const availableThreads = countServerThreads(ns, server.host)
          const nThreads = Math.min(availableThreads, event.threads - threadCnt)
          nThreads > 0 && ns.exec(script, server.host, nThreads, target)
          threadCnt += nThreads
        }

        ns.print(
          `Started ${script} with ${threadCnt} threads (expected: ${event.threads})`
        )
      } else {
        // Wait for all scripts to finish
        for (const server of activeServers) {
          if (ns.isRunning(script, server.host, target)) {
            await ns.sleep(SCRIPT_FINISH_WAIT_TIME_MS)
            elapsedTime += SCRIPT_FINISH_WAIT_TIME_MS
          }
        }

        if (event.script === 'grow' || event.script === 'hack') {
          ui.setMoney(ns.getServerMoneyAvailable(target))
        }
        ui.setSecurity(ns.getServerSecurityLevel(target))

        ns.print(`Finished running ${script}`)
      }
    }
  }
}
