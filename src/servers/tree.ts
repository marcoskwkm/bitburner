import { NS } from '@ns'

import { getAllServers } from 'utils/servers'
import { HOSTS } from 'utils/constants'

export async function main(ns: NS): Promise<void> {
  const servers = getAllServers(ns)

  const printTree = (root: string, level = 0) => {
    ns.tprint(Array(level).join('    ') + root)
    for (const server of servers) {
      if (server.parent === root) {
        printTree(server.host, level + 1)
      }
    }
  }

  printTree(HOSTS.HOME)
}
