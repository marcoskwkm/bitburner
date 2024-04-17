import { NS } from '@ns'

type Input = [number, [number, number][]]

const input: Input = [
  4,
  [
    [0, 2],
    [0, 3],
    [1, 2],
    [1, 3],
  ],
]

const solve = (arr: Input) => {
  const [n, edges] = arr
  const ans = Array(n).fill(-1)
  const adj = [...Array(n)].map(() => [] as number[])

  for (const [u, v] of edges) {
    adj[u].push(v)
    adj[v].push(u)
  }

  const dfs = (v: number, c = 0) => {
    ans[v] = c
    for (const w of adj[v]) {
      if (ans[w] === c) {
        return false
      } else if (ans[w] === -1) {
        if (!dfs(w, 1 - c)) {
          return false
        }
      }
    }
    return true
  }

  for (let v = 0; v < n; v++) {
    if (ans[v] === -1) {
      if (!dfs(v)) {
        return []
      }
    }
  }

  return ans
}

export const solvers = {
  'Proper 2-Coloring of a Graph': solve,
}

export async function main(ns: NS) {
  ns.tprint(solve(input))
}
