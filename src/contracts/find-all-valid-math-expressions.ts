// TODO: Make this more efficient

import { NS } from '@ns'

type Input = [string, number]

const input: Input = ['82157004711', 88]

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
      if (
        !res.split(/[+\-*]/).every((num) => num.length === 1 || num[0] !== '0')
      ) {
        return
      }
      if (eval(res) === target) {
        ans.push(res)
      }

      return
    }

    let ops = ['', '+', '-', '*']

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
  const res = solve(input)
  ns.tprint(res.length)
  ns.tprint(new Set(res).size)
}
