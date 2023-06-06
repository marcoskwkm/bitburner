import { NS } from '@ns'

import { HOSTS } from 'scripts/utils/constants'

export interface Server {
  parent: string | null
  host: string
  ports: number
  reqHack: number
  maxMoney: number
  minSecurity: number
}

export const getServersByPort = (ns: NS): Server[][] => {
  const serversByPort: Server[][] = [[], [], [], [], [], []]
  const seen = new Set<string>()

  const dfs = (host: string, prv: string | null) => {
    const server = {
      parent: prv,
      host,
      ports: ns.getServerNumPortsRequired(host),
      reqHack: ns.getServerRequiredHackingLevel(host),
      maxMoney: ns.getServerMaxMoney(host),
      minSecurity: ns.getServerMinSecurityLevel(host),
    }

    serversByPort[server.ports].push(server)
    seen.add(host)

    for (const nxt of ns.scan(host)) {
      if (!seen.has(nxt)) {
        dfs(nxt, host)
      }
    }
  }

  dfs(HOSTS.HOME, null)

  for (let i = 0; i < 6; i++) {
    serversByPort[i].sort((sa, sb) => sa.reqHack - sb.reqHack)
  }

  return serversByPort
}

export const getAllServers = (ns: NS): Server[] => getServersByPort(ns).flat()
