import { NS } from '@ns'

type Input = [string, string]

const input: Input = ['DASHBOAD', 'LINUX']

const solve = (input: Input) => {
  const getLetter = (a: string, b: string) => {
    const base = 'A'.charCodeAt(0)
    const ba = a.charCodeAt(0) - base
    const bb = b.charCodeAt(0) - base
    return String.fromCharCode(((ba + bb) % 26) + base)
  }

  const [s, k] = input

  const ans = []

  for (let i = 0; i < s.length; i++) {
    ans.push(getLetter(s[i], k[i % k.length]))
  }

  return ans.join('')
}

export const solvers = {
  'Encryption II: Vigenère Cipher': solve,
}

export async function main(ns: NS) {
  ns.tprint(solve(input))
}
