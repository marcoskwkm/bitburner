import { NS } from '@ns'

import * as proper2ColoringOfAGraph from 'scripts/contracts/proper-2-coloring-of-a-graph'
import * as algorithmicStockTrader from 'scripts/contracts/algorithmic-stock-trader'
import * as rleCompression from 'scripts/contracts/rle-compression'
import * as lzCompression from 'scripts/contracts/lz-compression'
import * as findAllValidMathExpressions from 'scripts/contracts/find-all-valid-math-expressions'
import * as totalWaysToSum from 'scripts/contracts/total-ways-to-sum'
import * as findLargestPrimeFactor from 'scripts/contracts/find-largest-prime-factor'
import * as generateIPAddresses from 'scripts/contracts/generate-ip-addresses'

const solvers: Record<string, (...args: any[]) => any> = {
  ...proper2ColoringOfAGraph.solvers,
  ...algorithmicStockTrader.solvers,
  ...rleCompression.solvers,
  ...lzCompression.solvers,
  ...findAllValidMathExpressions.solvers,
  ...totalWaysToSum.solvers,
  ...findLargestPrimeFactor.solvers,
  ...generateIPAddresses.solvers,
}

export const solve = (ns: NS, host: string, filename: string) => {
  const name = ns.codingcontract.getContractType(filename, host)
  const data = ns.codingcontract.getData(filename, host)

  const solver = solvers[name]

  if (!solver) {
    ns.toast(`Solver for contract "${name}" not implemented.`, 'warning', 5000)
  }

  const reward = ns.codingcontract.attempt(solver(data), filename, host)

  if (reward) {
    ns.toast(`Correctly solved contract. Reward: ${reward}`, 'success', 5000)
  } else {
    ns.toast('Failed to solve contract.', 'error', 5000)
    ns.tprint(`Failed to solve ${filename} at ${host}`)
    ns.exit()
  }
}

export async function main(ns: NS) {
  const [host, filename] = ns.args as string[]

  if (!host || !filename) {
    ns.tprint('Missing host or filename argument')
    ns.exit()
  }

  solve(ns, host, filename)
}
