import { NS } from '@ns'

import { Server } from 'scripts/Server/index'

export async function main(ns: NS): Promise<void> {
  const serverName = (ns.args[0] as string) ?? 'joesguns'
  const server = new Server(ns, serverName)

  ns.printf('Hacking %s...', serverName)

  if (server.minDifficulty === undefined || server.maxMoney === undefined) {
    ns.print('Some server parameters are not defined. Aborting.')
    ns.exit()
  }

  const targetDifficulty = Math.max(
    1.3 * server.minDifficulty,
    server.minDifficulty + 5
  )
  const targetMoney = Math.min(0.7 * server.maxMoney, 2000000) as number

  while (true) {
    while (server.getDifficulty() > targetDifficulty) {
      ns.printf(
        'Lowering difficulty (current: %.3f, target: %.3f)',
        server.getDifficulty(),
        targetDifficulty
      )
      await ns.weaken(serverName)
    }

    while (server.getMoney() < targetMoney) {
      ns.printf(
        'Increasing available money (current: %d, target: %d)',
        server.getMoney(),
        targetMoney
      )
      await ns.grow(serverName)
    }

    await ns.hack(serverName)
  }
}
