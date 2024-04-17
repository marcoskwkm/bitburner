import { NS } from '@ns'

export const solve = (input: [string, number]) => {
  const shift = input[1] % 26

  const solveWord = (w: string) =>
    w
      .split('')
      .map((c) =>
        String.fromCharCode(
          ((c.charCodeAt(0) - 'A'.charCodeAt(0) - shift + 2 * 26) % 26) +
            'A'.charCodeAt(0)
        )
      )
      .join('')

  return input[0].split(' ').map(solveWord).join(' ')
}

export const solvers = {
  'Encryption I: Caesar Cipher': solve,
}

export async function main(ns: NS) {
  ns.tprint(solve(['DE A', 3]))
}
