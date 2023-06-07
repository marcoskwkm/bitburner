import { NS } from '@ns'

type Input = [number, number[]]
const input: Input = [5, [1, 2]]

export const solve = (input: Input) => {
  const [n, arr] = input

  const dp = Array(n + 1).fill(0)
  dp[0] = 1

  for (const x of arr) {
    for (let i = x; i <= n; i++) {
      dp[i] += dp[i - x]
    }
  }

  return dp[n]
}

export const solvers = {
  'Total Ways to Sum': (input: number) =>
    solve([input, [...Array(n - 1)].map((_, idx) => idx + 1)]),
  'Total Ways to Sum II': solve,
}

export async function main(ns: NS) {
  ns.tprint(solve(input))
}
