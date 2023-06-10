import { NS } from '@ns'

type Input = number[][]

const input: Input = [
  [0, 0, 0],
  [0, 1, 0],
  [0, 0, 0],
]

export const solve = (input: Input) => {
  const n = input.length
  const m = input[0].length

  const dp = [...new Array(n)].map(() => new Array(m).fill(0))

  dp[0][0] = 1
  for (let r = 0; r < n; r++) {
    for (let c = r === 0 ? 1 : 0; c < m; c++) {
      if (input[r][c] === 1) {
        continue
      }
      dp[r][c] = (r === 0 ? 0 : dp[r - 1][c]) + (c === 0 ? 0 : dp[r][c - 1])
    }
  }

  return dp[n - 1][m - 1]
}

export const solvers = {
  'Unique Paths in a Grid I': ([n, m]: number[]) =>
    solve([...Array(n)].map(() => Array(m).fill(0))),
  'Unique Paths in a Grid II': solve,
}

export async function main(ns: NS) {
  ns.tprint(solve(input))
}
