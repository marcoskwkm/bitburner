import { NS } from '@ns'

export const solve = (input: number[][]) => {
  const dirs = [
    [1, 0, 'U'],
    [-1, 0, 'D'],
    [0, 1, 'L'],
    [0, -1, 'R'],
  ] as const

  const n = input.length
  const m = input[0].length

  if (input[0][0] === 1 || input[n - 1][m - 1] === 1) {
    return ''
  }

  const d = input.map((a) => a.map(() => Infinity))
  const op = input.map((a) => a.map(() => ''))
  const prv: number[][][] = input.map((a) => a.map(() => []))

  d[n - 1][m - 1] = 0

  let q = [[n - 1, m - 1]]

  while (q.length > 0) {
    const [r, c] = q[0]
    q = q.slice(1)

    for (const [dr, dc, dir] of dirs) {
      const nr = r + dr
      const nc = c + dc

      if (
        nr < 0 ||
        nc < 0 ||
        nr >= n ||
        nc >= m ||
        d[nr][nc] !== Infinity ||
        input[nr][nc] === 1
      ) {
        continue
      }

      d[nr][nc] = d[r][c] + 1
      op[nr][nc] = dir
      prv[nr][nc] = [r, c]
      q.push([nr, nc])
    }
  }

  if (d[0][0] === Infinity) {
    return ''
  }

  const ans = []
  let cr = 0
  let cc = 0

  while (cr !== n - 1 || cc !== m - 1) {
    ans.push(op[cr][cc])
    const [nr, nc] = prv[cr][cc]
    cr = nr
    cc = nc
  }

  return ans.join('')
}

export const solvers = {
  'Shortest Path in a Grid': solve,
}

export async function main(ns: NS) {
  ns.tprint(
    solve([
      [0, 1, 0, 0, 0],
      [0, 0, 0, 1, 0],
    ])
  )
}
