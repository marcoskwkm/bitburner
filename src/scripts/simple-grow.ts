import { NS } from '@ns'

export async function main(ns: NS): Promise<void> {
  const host = ns.args[0] as string

  if (!host) {
    ns.print('Missing host argument')
    ns.exit()
  }

  await ns.grow(host)
}
