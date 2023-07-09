import { NS } from '@ns'

const input: Input = '595414201'

type Input = string

export const solve = (input: Input) => {
  const ip: string[] = []
  const ans: string[] = []

  for (const c of input) {
    ip.push(c)
    ip.push('')
  }

  ip.pop()

  const rec = (i: number, cnt: number) => {
    if (cnt > 4) {
      return
    }

    if (i === input.length) {
      if (cnt === 4) {
        ans.push(ip.join(''))
      }

      return
    }

    for (let take = 1; take <= 3 && i + take - 1 < input.length; take++) {
      if (parseInt(input.substring(i, i + take)) >= 256) {
        break
      }

      if (i + take - 1 < input.length - 1) {
        ip[2 * (i + take - 1) + 1] = '.'
      }
      rec(i + take, cnt + 1)

      if (input[i] == '0') {
        break
      }

      ip[2 * (i + take - 1) + 1] = ''
    }
  }

  rec(0, 0)

  return ans
}

export const solvers = {
  'Generate IP Addresses': solve,
}

export async function main(ns: NS) {
  ns.tprint(solve(input))
}
