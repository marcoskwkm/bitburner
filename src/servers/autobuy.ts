import { NS } from '@ns'
import { getPurchasedServerName } from 'utils/servers'

export async function main(ns: NS): Promise<void> {
  const INITIAL_EXP = 8

  for (let e = INITIAL_EXP; e <= 20; e++) {
    const ram = Math.pow(2, e)

    for (let i = 0; i < ns.getPurchasedServerLimit(); i++) {
      ns.print(`Waiting for server ${i}...`)
      const hostname = getPurchasedServerName(i)

      if (ns.serverExists(hostname) && ns.getServerMaxRam(hostname) >= ram) {
        ns.print('Server exists and has enough ram. Skipping...')
        continue
      }

      const cost = ns.serverExists(hostname)
        ? ns.getPurchasedServerUpgradeCost(hostname, ram)
        : ns.getPurchasedServerCost(ram)

      while (ns.getServerMoneyAvailable('home') < cost) {
        await ns.sleep(1000)
      }

      if (ns.serverExists(hostname)) {
        ns.upgradePurchasedServer(hostname, ram)
      } else {
        ns.purchaseServer(hostname, ram)
      }

      ns.toast(`Purchased server ${i}`)
    }
  }
}
