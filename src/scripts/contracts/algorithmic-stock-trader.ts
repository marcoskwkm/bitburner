import { NS } from '@ns'

type Input = [number, number[]]
const input: Input = [
  2,
  [
    16, 188, 133, 38, 163, 94, 43, 43, 135, 17, 107, 39, 78, 199, 84, 78, 158,
    72, 158, 71, 6, 123, 145, 55, 87, 127, 32, 29, 26, 164, 142, 141, 166,
  ],
]

export const solve = (input: Input) => {
  const [k, arr] = input
  const n = arr.length

  const dp = [...Array(k + 1)].map(() => Array(n).fill(0))

  for (let kk = 1; kk <= k; kk++) {
    for (let i = 1; i < n; i++) {
      dp[kk][i] = Math.max(dp[kk][i - 1], dp[kk - 1][i])
      for (let j = i - 1; j >= 0; j--) {
        if (arr[i] > arr[j]) {
          dp[kk][i] = Math.max(dp[kk][i], dp[kk - 1][j] + arr[i] - arr[j])
        }
      }
    }
  }

  return dp[k][n - 1]
}

export const solvers = {
  'Algorithmic Stock Trader IV': solve,
  'Algorithmic Stock Trader III': (input: number[]) => solve([2, input]),
  'Algorithmic Stock Trader II': (input: number[]) =>
    solve([input.length, input]),
  'Algorithmic Stock Trader I': (input: number[]) => solve([1, input]),
}

export async function main(ns: NS) {
  ns.tprint(solve(input))
}
