import { NS } from '@ns'

export async function main(ns: NS): Promise<void> {
  const HACK_FILE = 'scripts/hack.js'
  const FILES_TO_COPY = [HACK_FILE, 'scripts/Server/index.js']

  if (ns.args.length === 0) {
    ns.tprint('Missing server name')
    ns.exit()
  }

  const serverName = ns.args[0] as string

  ns.brutessh(serverName)
  ns.ftpcrack(serverName)
  ns.nuke(serverName)

  if (!ns.hasRootAccess(serverName)) {
    ns.tprintf('Failed to nuke %s, aborting.', serverName)
    ns.exit()
  }

  ns.tprintf('Successfully nuked %s', serverName)

  ns.scp(FILES_TO_COPY, serverName, 'home')

  ns.tprintf('Successfully copied hack scripts to target server')

  const nThreads = Math.floor(
    (ns.getServerMaxRam(serverName) - ns.getServerUsedRam(serverName)) /
      ns.getScriptRam(HACK_FILE)
  )

  ns.exec(HACK_FILE, serverName, nThreads)
  ns.tprint(`Running hack with ${nThreads} threads on ${serverName}`)
}
