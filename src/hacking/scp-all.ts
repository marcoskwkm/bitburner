import { NS } from '@ns'

import { HOSTS } from 'utils/constants'

export async function main(ns: NS): Promise<void> {
  const dest = (ns.args[0] as string) ?? ns.getHostname()

  if (!dest) {
    ns.tprint('Missing destination argument')
    ns.exit()
  }

  const files = ns.ls(HOSTS.HOME).filter((f) => f.endsWith('.js'))

  ns.scp(files, dest, HOSTS.HOME)
}
