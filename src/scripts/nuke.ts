import { NS } from '@ns'

import { FILES, HOSTS, SCRIPTS } from 'scripts/utils/constants'

export const nuke = (ns: NS, serverName: string, hackTarget?: string) => {
  const FILES_TO_COPY = [
    SCRIPTS.HACK,
    SCRIPTS.CONSTANTS,
    SCRIPTS.SIMPLE_GROW,
    SCRIPTS.SIMPLE_HACK,
    SCRIPTS.SIMPLE_WEAKEN,
    SCRIPTS.UTILS_TIME,
  ]

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

  ns.scp(FILES_TO_COPY, serverName, 'home')

  const canRun =
    ns.getServerMaxRam(serverName) - ns.getServerUsedRam(serverName) >
    ns.getScriptRam(SCRIPTS.HACK)

  if (canRun) {
    ns.exec(
      SCRIPTS.HACK,
      serverName,
      1,
      ...[hackTarget].filter((x): x is string => !!x)
    )

    ns.toast(`Running hack-v4 on ${serverName}`, 'success')
  }
}

export async function main(ns: NS): Promise<void> {
  if (ns.args.length === 0) {
    ns.tprint('Missing server name')
    ns.exit()
  }

  const serverName = ns.args[0] as string
  const hackTarget = ns.args[1] as string

  nuke(ns, serverName, hackTarget)
}
