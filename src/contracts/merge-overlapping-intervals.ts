import { NS } from '@ns'

export const solve = (input: number[][]) => {
  if (input.length === 0) {
    return []
  }

  input.sort(([a], [b]) => a - b)

  const ans = []

  let [curL, curR] = input[0]

  for (const [l, r] of input) {
    if (l > curR) {
      ans.push([curL, curR])
      curL = l
    }

    curR = Math.max(curR, r)
  }

  ans.push([curL, curR])
  return ans
}

export const solvers = {
  'Merge Overlapping Intervals': solve,
}

export async function main(ns: NS) {
  ns.tprint(
    solve([
      [4, 8],
      [9, 12],
      [15, 18],
      [7, 16],
      [4, 11],
      [23, 30],
      [13, 21],
      [25, 35],
      [10, 11],
      [23, 32],
      [5, 10],
      [16, 26],
      [13, 19],
      [10, 20],
      [7, 9],
      [21, 22],
      [25, 33],
      [25, 26],
    ])
  )
}
