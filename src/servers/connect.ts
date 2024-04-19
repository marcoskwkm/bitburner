import type { NS } from '@ns'
import { getAllServers } from 'utils/servers'

export async function main(ns: NS) {
  ns.disableLog('ALL')

  const server = ns.args[0].toString()

  if (!server) {
    ns.tprint('Missing server argument')
    return
  }

  const allServers = getAllServers(ns)

  const serverSeq: string[] = []

  let curServer = server

  while (curServer !== ns.getHostname()) {
    serverSeq.push(curServer)
    const serverObj = allServers.find((s) => s.host === curServer)

    if (!serverObj) {
      ns.tprint(`Server ${curServer} not found`)
      return
    }

    if (!serverObj.parent) {
      throw new Error(`Server ${curServer} has no parent`)
    }

    curServer = serverObj.parent
  }

  serverSeq.reverse().forEach((s) => ns.singularity.connect(s))
}
