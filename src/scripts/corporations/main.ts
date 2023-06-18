import { NS } from '@ns'

// import * as Round1 from 'scripts/corporations/round-1'
// import * as Round2 from 'scripts/corporations/round-2'
import * as Round3 from 'scripts/corporations/round-3'

export async function main(ns: NS) {
  ns.disableLog('ALL')
  // await Round1.doit(ns)
  // await Round2.doit(ns)
  await Round3.doit(ns)
}
