import { NS } from '@ns'

export const solve = (input: string) => {
  const n = input.length
  const expr = input.split('')
  const ans = new Set<string>()

  let minCnt = 0
  let s = 0

  for (const c of input) {
    if (c === '(') {
      s++
    } else if (c === ')') {
      if (s === 0) {
        minCnt++
      } else {
        s--
      }
    }
  }

  minCnt += s

  const rec = (i: number, s: number, cnt: number) => {
    if (s < 0 || cnt > minCnt) {
      return
    }

    if (i === n) {
      if (s === 0) {
        ans.add(expr.join(''))
      }
      return
    }

    switch (input[i]) {
      case '(':
        expr[i] = input[i]
        rec(i + 1, s + 1, cnt)
        expr[i] = ''
        rec(i + 1, s, cnt + 1)
        break

      case ')':
        expr[i] = input[i]
        rec(i + 1, s - 1, cnt)
        expr[i] = ''
        rec(i + 1, s, cnt + 1)
        break

      default:
        expr[i] = input[i]
        rec(i + 1, s, cnt)
        break
    }
  }

  rec(0, 0, 0)

  return [...ans]
}

export const solvers = {
  'Sanitize Parentheses in Expression': solve,
}

export async function main(ns: NS) {
  ns.tprint(solve(')('))
}
