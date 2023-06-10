import { NS } from '@ns'

import { FILES, HOSTS } from 'scripts/utils/constants'

export const nuke = (ns: NS, serverName: string) => {
  ns.fileExists(FILES.BRUTE_SSH, HOSTS.HOME) && ns.brutessh(serverName)
  ns.fileExists(FILES.FTP_CRACK, HOSTS.HOME) && ns.ftpcrack(serverName)
  ns.fileExists(FILES.RELAY_SMTP, HOSTS.HOME) && ns.relaysmtp(serverName)
  ns.fileExists(FILES.HTTP_WORM, HOSTS.HOME) && ns.httpworm(serverName)
  ns.fileExists(FILES.SQL_INJECT, HOSTS.HOME) && ns.sqlinject(serverName)

  ns.nuke(serverName)

  if (!ns.hasRootAccess(serverName)) {
    ns.tprintf('Failed to nuke %s, aborting.', serverName)
    ns.exit()
  }
}

export async function main(ns: NS): Promise<void> {
  if (ns.args.length === 0) {
    ns.tprint('Missing server name')
    ns.exit()
  }

  const serverName = ns.args[0] as string

  nuke(ns, serverName)
}
