import { NS } from '@ns'

const input: Input = '12615128104'

type Input = string

export const solve = (input: Input) => {
  const ip: string[] = []
  const ans: string[] = []

  for (const c of input) {
    ip.push(c)
    ip.push('')
  }

  ip.pop()

  const rec = (i: number, cnt: number, last: number) => {
    if (cnt > 3 || i - last > 3) {
      return
    }

    if (i === input.length - 1) {
      if (cnt === 3 && parseInt(input.substring(last + 1, i + 1)) < 256) {
        ans.push(ip.join(''))
      }
      return
    }

    ip[2 * i + 1] = ''
    rec(i + 1, cnt, last)

    if (parseInt(input.substring(last + 1, i + 1)) < 256) {
      if (input[last + 1] !== '0' || i - last === 1) {
        ip[2 * i + 1] = '.'
        rec(i + 1, cnt + 1, i)
      }
    }
  }

  rec(0, 0, -1)

  return ans
}

export const solvers = {
  'Generate IP Addresses': solve,
}

export async function main(ns: NS) {
  ns.tprint(solve(input))
}
