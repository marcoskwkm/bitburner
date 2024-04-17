import { NS } from '@ns'

const isPow2 = (n: number) => (n & -n) === n

export const encode = (input: number) => {
  const bin = input.toString(2)
  const ans: number[] = []

  let cur = 0

  let largestPow = -2

  for (let i = 0; cur < bin.length; i++) {
    if (isPow2(i)) {
      ans.push(0)
      largestPow++
    } else {
      ans.push(parseInt(bin.charAt(cur++)))
    }
  }

  for (let i = largestPow; i >= 0; i--) {
    for (let j = 0; j < ans.length; j++) {
      if (j & (1 << i)) {
        ans[1 << i] ^= ans[j]
      }
    }
  }

  for (let j = 0; j < ans.length; j++) {
    ans[0] ^= ans[j]
  }

  return ans.join('')
}

export const decode = (input: string) => {
  const s = input.split('').map((x) => x.charCodeAt(0) - '0'.charCodeAt(0))
  let err = 0

  for (let i = 0; i < input.length; i++) {
    if (s[i] === 1) {
      err ^= i
    }
  }

  s[err] ^= 1

  const ans = []
  for (let i = 0; i < input.length; i++) {
    if (!isPow2(i)) {
      ans.push(s[i])
    }
  }

  return parseInt(ans.join(''), 2)
}

export const solvers = {
  'HammingCodes: Integer to Encoded Binary': encode,
  'HammingCodes: Encoded Binary to Integer': decode,
}

export async function main(ns: NS) {
  ns.tprint(decode('10110000'))
}
