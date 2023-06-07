import { NS } from '@ns'

type Input = [string, number]

const input: Input = ['5872910', -70]

const solve = (input: Input) => {
  const [s, target] = input

  const exp: string[] = []
  for (const c of s) {
    exp.push('')
    exp.push(c)
  }

  const ans: string[] = []

  const doit = (i: number) => {
    if (i === s.length) {
      const res = exp.join('')
      if (eval(res) === target) {
        ans.push(res)
      }

      return
    }

    let ops = ['', '+', '-', '*']

    if (i > 0 && s[i - 1] === '0') {
      ops = ops.filter((x) => x !== '')
    }

    if (i === 0) {
      ops = ['']
    }

    ops.forEach((op) => {
      exp[2 * i] = op
      doit(i + 1)
    })
  }

  doit(0)
  return ans
}

export const solvers = {
  'Find All Valid Math Expressions': solve,
}

export async function main(ns: NS) {
  ns.tprint(solve(input))
}
