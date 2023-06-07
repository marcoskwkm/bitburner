import { NS } from '@ns'

type Input = string

const input: Input = 'zzzzzzzzzzzzzzzzzzz'

export const solve = (input: Input) => {
  let lastChar = ''
  let lastCnt = 0

  const ans = []

  for (const c of input) {
    if (c !== lastChar || lastCnt === 9) {
      if (lastCnt > 0) {
        ans.push(lastCnt)
        ans.push(lastChar)
      }
      lastCnt = 0
      lastChar = c
    }
    lastCnt++
  }

  ans.push(lastCnt)
  ans.push(lastChar)
  return ans.join('')
}

export const solvers = {
  'Compression I: RLE Compression': solve,
}

export async function main(ns: NS) {
  ns.tprint(solve(input))
}
