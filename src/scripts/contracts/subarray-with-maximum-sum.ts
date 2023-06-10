import { NS } from '@ns'

type Input = number[]

const input: Input = [
  -9, 8, -10, 9, 2, -9, -7, -5, 6, 9, 3, 2, 1, -1, 2, -9, 8, 5, -6, -6, 3, -3,
  6, 7, -1, 5, -7, -1,
]

const solve = (input: Input) => {
  let best = input[0]
  let sum = 0

  for (const x of input) {
    sum += x

    if (sum > best) {
      best = sum
    }

    if (sum < 0) {
      sum = 0
    }
  }

  return best
}

export const solvers = {
  'Subarray with Maximum Sum': solve,
}

export async function main(ns: NS) {
  ns.tprint(solve(input))
}
