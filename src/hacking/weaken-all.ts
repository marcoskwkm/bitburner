import { NS } from '@ns'

import { FILES, HOSTS, SCRIPTS } from 'utils/constants'
import { getPurchasedServerName } from 'utils/servers'
import { getServersByPort, type Server } from 'utils/servers'
import { LOOP_FLAG } from 'hacking/simple-weaken'
import { nuke } from 'hacking/nuke'

const PROGRAMS_LIST = Object.values(FILES)

export async function main(ns: NS): Promise<void> {
  const target = ns.args[0] as string

  const FILES_TO_COPY = [SCRIPTS.SIMPLE_WEAKEN]

  const getAvailableRam = (host: string) =>
    ns.getServerMaxRam(host) - ns.getServerUsedRam(host)

  const weakRam = ns.getScriptRam(SCRIPTS.SIMPLE_WEAKEN)

  const runScript = (host: string) => {
    ns.scp(FILES_TO_COPY, host, HOSTS.HOME)
    const threads = Math.floor(getAvailableRam(host) / weakRam)
    if (threads > 0) {
      ns.exec(SCRIPTS.SIMPLE_WEAKEN, host, threads, target, LOOP_FLAG)
    }
  }

  for (let i = 0; i < ns.getPurchasedServerLimit(); i++) {
    const host = getPurchasedServerName(i)
    if (ns.serverExists(host)) {
      runScript(host)
    }
  }

  const servers = getServersByPort(ns)

  const getRemServersCount = (lists: Server[][]) =>
    lists.reduce((sum, list) => sum + list.length, 0)

  while (getRemServersCount(servers) > 0) {
    const programCount = PROGRAMS_LIST.reduce(
      (cnt, file) => cnt + (ns.fileExists(file, HOSTS.HOME) ? 1 : 0),
      0
    )

    for (let i = 0; i <= programCount; i++) {
      if (
        servers[i].length > 0 &&
        ns.getHackingLevel() >= servers[i][0].reqHack
      ) {
        nuke(ns, servers[i][0].host)
        runScript(servers[i][0].host)
        servers[i] = servers[i].slice(1)
      }
    }

    await ns.sleep(1000)
  }
}
