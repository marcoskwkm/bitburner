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
  ns.disableLog('ALL')

  while (true) {
    ns.print('Looking for contracts...')

    const contracts = findContracts(ns)

    for (const contract of contracts) {
      ns.print(
        `Attempting to solve ${contract.filename} at ${contract.host}...`
      )

      solve(ns, contract.host, contract.filename)
    }

    await ns.sleep(15000)
  }
}
