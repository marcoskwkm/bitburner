import { NS } from '@ns'

export const solve = (input: number[]) => {
  const n = input.length
  const dp = input.map(() => Infinity)

  dp[n - 1] = 0

  for (let i = n - 2; i >= 0; i--) {
    for (let j = 1; j <= input[i] && i + j < n; j++) {
      dp[i] = Math.min(dp[i], 1 + dp[i + j])
    }
  }

  return dp[0] === Infinity ? 0 : dp[0]
}

export const solvers = {
  'Array Jumping Game': (input: number[]) => (solve(input) ? 1 : 0),
  'Array Jumping Game II': solve,
}

export async function main(ns: NS) {
  ns.tprint(solve([1, 2, 0]))
}
