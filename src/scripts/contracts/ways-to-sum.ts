import { NS } from '@ns'

interface Input {
  n: number
  vals: number[]
}

const input = {
  n: 115,
  vals: [1, 2, 4, 5, 8, 9, 10, 11, 13, 14, 16],
}

export const solve = (input: Input) => {
  const { n, vals } = input

  const dp = Array(n + 1).fill(0)
  dp[0] = 1

  for (const val of vals) {
    for (let i = val; i <= n; i++) {
      dp[i] += dp[i - val]
    }
  }

  return dp[n]
}

export async function main(ns: NS) {
  ns.tprint(solve(input))
}

console.log(solve(input))
