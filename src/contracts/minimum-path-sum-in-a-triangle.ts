import { NS } from '@ns'

const solve = (input: number[][]) => {
  const n = input.length

  const dp = input.map((row) => row.map(() => Infinity))
  dp[n - 1] = input[n - 1]

  for (let row = n - 2; row >= 0; row--) {
    for (let col = 0; col <= row; col++) {
      [col, col + 1]
        .filter((x) => x <= row + 1)
        .forEach(
          (c) =>
            (dp[row][col] = Math.min(
              dp[row][col],
              dp[row + 1][c] + input[row][col]
            ))
        )
    }
  }

  return dp[0][0]
}

export const solvers = {
  'Minimum Path Sum in a Triangle': solve,
}

export async function main(ns: NS) {
  ns.tprint(solve([[2], [3, 4], [6, 5, 7], [4, 1, 8, 3]]))
}
