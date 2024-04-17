import { NS } from '@ns'

import * as proper2ColoringOfAGraph from 'contracts/proper-2-coloring-of-a-graph'
import * as algorithmicStockTrader from 'contracts/algorithmic-stock-trader'
import * as rleCompression from 'contracts/rle-compression'
import * as lzCompression from 'contracts/lz-compression'
import * as findAllValidMathExpressions from 'contracts/find-all-valid-math-expressions'
import * as totalWaysToSum from 'contracts/total-ways-to-sum'
import * as findLargestPrimeFactor from 'contracts/find-largest-prime-factor'
import * as generateIPAddresses from 'contracts/generate-ip-addresses'
import * as uniquePathsInAGrid from 'contracts/unique-paths-in-a-grid'
import * as subarrayWithMaximumSum from 'contracts/subarray-with-maximum-sum'
import * as viginereCipher from 'contracts/vigenere-cipher'
import * as hammingCodes from 'contracts/hamming-codes'
import * as arrayJumpingGame from 'contracts/array-jumping-game'
import * as caesarCipher from 'contracts/caesar-cipher'
import * as spiralizeMatrix from 'contracts/spiralize-matrix'
import * as mergeOverlappingIntervals from 'contracts/merge-overlapping-intervals'
import * as shortestPathInAGrid from 'contracts/shortest-path-in-a-grid'
import * as sanitizeParenthesisInExpression from 'contracts/sanitize-parenthesis-in-expression'
import * as minimumPathSumInATriangle from 'contracts/minimum-path-sum-in-a-triangle'

const solvers: Record<string, (...args: any[]) => any> = {
  ...proper2ColoringOfAGraph.solvers,
  ...algorithmicStockTrader.solvers,
  ...rleCompression.solvers,
  ...lzCompression.solvers,
  ...findAllValidMathExpressions.solvers,
  ...totalWaysToSum.solvers,
  ...findLargestPrimeFactor.solvers,
  ...generateIPAddresses.solvers,
  ...uniquePathsInAGrid.solvers,
  ...subarrayWithMaximumSum.solvers,
  ...viginereCipher.solvers,
  ...hammingCodes.solvers,
  ...arrayJumpingGame.solvers,
  ...caesarCipher.solvers,
  ...spiralizeMatrix.solvers,
  ...mergeOverlappingIntervals.solvers,
  ...shortestPathInAGrid.solvers,
  ...sanitizeParenthesisInExpression.solvers,
  ...minimumPathSumInATriangle.solvers,
}

export const solve = (ns: NS, host: string, filename: string) => {
  const name = ns.codingcontract.getContractType(filename, host)
  const data = ns.codingcontract.getData(filename, host)

  const solver = solvers[name]

  if (!solver) {
    ns.toast(`Solver for contract "${name}" not implemented.`, 'warning', 5000)
    return
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
