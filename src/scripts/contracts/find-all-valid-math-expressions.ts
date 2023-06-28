import { NS } from '@ns'

type Input = [string, number]

const input: Input = ['259213024439', 86]

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

    if (s[i] === '0') {
      // single zero
      ['+', '-', '*'].forEach((op) => {
        exp[2 * i] = op
        if (i + 1 < s.length) {
          ['+', '-', '*'].forEach((op2) => {
            exp[2 * (i + 1)] = op2
            doit(i + 2)
          })
        } else {
          doit(i + 1)
        }
      })

      // prevent leading zero
      ops = ['']
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
  const res = solve(input)
  ns.tprint(res.length)
  ns.tprint(new Set(res).size)
}
