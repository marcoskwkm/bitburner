import { NS } from '@ns'

const input: Input = 13

type Input = number

export const solve = (input: Input) => {
  let ans = 1
  let cur = 2

  while (cur <= input) {
    while (input % cur === 0) {
      ans = cur
      input = Math.round(input / cur)
    }
    cur++
  }

  return ans
}

export const solvers = {
  'Find Largest Prime Factor': solve,
}

export async function main(ns: NS) {
  ns.tprint(solve(input))
}
