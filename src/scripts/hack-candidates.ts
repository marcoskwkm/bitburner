import { NS } from '@ns'

import { getAllServers } from 'scripts/utils/servers'

export async function main(ns: NS): Promise<void> {
  const candidates = getAllServers(ns)
    .filter((s) => ns.hasRootAccess(s.host))
    .sort((sa, sb) => sb.maxMoney - sa.maxMoney)
    .slice(0, 10)

  candidates.forEach((s) =>
    ns.tprint(
      `${s.host}:\n\tMax money = $${s.maxMoney}\n\tMin security = ${s.minSecurity}\n\tReq hack lvl = ${s.reqHack}`
    )
  )
}
