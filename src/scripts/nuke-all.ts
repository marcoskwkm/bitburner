import { NS } from '@ns'

import { FILES, HOSTS } from 'scripts/utils/constants'
import { nuke } from 'scripts/nuke'
import { getPurchasedServerName } from 'scripts/buy-servers'
import { getServersByPort, type Server } from 'scripts/utils/servers'

const PROGRAMS_LIST = Object.values(FILES)

export async function main(ns: NS): Promise<void> {
  const hackTarget = ns.args[0] as string

  for (let i = 0; i < ns.getPurchasedServerLimit(); i++) {
    const host = getPurchasedServerName(i)
    ns.serverExists(host) && nuke(ns, host, hackTarget)
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
        nuke(ns, servers[i][0].host, hackTarget)
        servers[i] = servers[i].slice(1)
      }
    }

    await ns.sleep(1000)
  }
}
