import { NS } from '@ns'

export async function main(ns: NS): Promise<void> {
  const HACK_FILE = 'scripts/hack.js'
  const FILES_TO_COPY = [HACK_FILE, 'scripts/Server/index.js']
  const SERVER_RAM = 64

  const nThreads = Math.floor(SERVER_RAM / ns.getScriptRam(HACK_FILE))

  for (let i = 0; i < ns.getPurchasedServerLimit(); i++) {
    ns.print(`Waiting for server ${i}...`)

    while (
      ns.getServerMoneyAvailable('home') < ns.getPurchasedServerCost(SERVER_RAM)
    ) {
      await ns.sleep(1000)
    }

    const hostname = ns.purchaseServer(`s${i}`, SERVER_RAM)
    ns.scp(FILES_TO_COPY, hostname, 'home')
    ns.exec(HACK_FILE, hostname, nThreads)
    ns.print(`Purchased server ${i}`)
  }
}
