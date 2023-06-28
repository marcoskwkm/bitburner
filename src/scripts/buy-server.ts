import { NS } from '@ns'

export async function main(ns: NS) {
  const [level, name] = ns.args

  if (!level || typeof level !== 'number') {
    ns.tprint('Invalid level argument')
    ns.exit()
  }

  if (!name || typeof name !== 'string') {
    ns.tprint('Missing or invalid server name')
    ns.exit()
  }

  const ram = Math.pow(2, level)
  const price = ns.getPurchasedServerCost(ram)

  await ns
    .prompt(
      `Do you want to purchase a ${ns.formatRam(
        ram
      )} server for ${ns.formatNumber(price)}?`
    )
    .then((choice) => {
      if (choice) {
        ns.purchaseServer(name, ram)
      }
    })
}
