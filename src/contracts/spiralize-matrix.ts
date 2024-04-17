import { NS } from '@ns'

export const solve = (input: number[][]) => {
  const rotate = (mat: number[][]) => {
    const n = mat.length

    if (n === 0) {
      return []
    }

    const m = mat[0].length

    const res: number[][] = [...Array(m)].map(() => [])

    for (let c = 0; c < m; c++) {
      for (let r = 0; r < n; r++) {
        res[c].push(mat[r].pop()!)
      }
    }

    return res
  }

  let ans: number[] = []

  while (input.length > 0) {
    ans = ans.concat(input[0])
    input = rotate(input.slice(1))
  }

  return ans
}

export const solvers = {
  'Spiralize Matrix': solve,
}

export async function main(ns: NS) {
  ns.tprint(
    solve([
      [1, 2, 3, 4],
      [5, 6, 7, 8],
      [9, 10, 11, 12],
    ])
  )
}
