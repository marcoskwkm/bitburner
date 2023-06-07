import { NS } from '@ns'

import { getAllServers } from 'scripts/utils/servers'
import { solve } from 'scripts/contracts/index'

interface Contract {
  host: string
  filename: string
}

export const findContracts = (ns: NS) => {
  const servers = getAllServers(ns)

  const allContracts: Contract[] = []

  for (const server of servers) {
    const contracts = ns.ls(server.host, '.cct')
    for (const filename of contracts) {
      allContracts.push({
        host: server.host,
        filename,
      })
    }
  }

  return allContracts
}

export async function main(ns: NS): Promise<void> {
  while (true) {
    const contracts = findContracts(ns)

    for (const contract of contracts) {
      solve(ns, contract.host, contract.filename)
    }

    await ns.sleep(15000)
  }
}
