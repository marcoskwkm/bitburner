import { NS } from '@ns'

export const LOOP_FLAG = '--loop'

export async function main(ns: NS): Promise<void> {
  const host = ns.args[0] as string

  const shouldLoop = ns.args.includes(LOOP_FLAG)

  if (!host) {
    ns.print('Missing host argument')
    ns.exit()
  }

  if (shouldLoop) {
    while (true) {
      await ns.weaken(host)
    }
  } else {
    await ns.weaken(host)
  }
}
