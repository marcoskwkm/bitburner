import { NS } from '@ns'

type Input = string

const input: Input = 'aaaaaaaaaaaaa'

const decompress = (input: Input) => {
  const ans: string[] = []
  let cur = 0

  for (let k = 0; cur < input.length; k ^= 1) {
    const n = parseInt(input[cur++])

    if (n === 0) {
      continue
    }

    if (k === 0) {
      for (let i = 0; i < n; i++) {
        ans.push(input[cur++])
      }
    } else {
      const m = parseInt(input[cur++])

      for (let i = 0; i < n; i++) {
        ans.push(ans[ans.length - m])
      }
    }
  }

  return ans.join('')
}

const compress = (input: Input) => {
  const n = input.length
  const dp = [...Array(2)].map(() => Array(n).fill(Infinity))
  const op = [...Array(2)].map(() => Array(n).fill(''))

  dp[0][n] = dp[1][n] = 0

  for (let i = n - 1; i >= 0; i--) {
    // 0
    for (let j = 1; j <= 9 && i + j <= n; j++) {
      const val = 1 + j + dp[1][i + j]

      if (val < dp[0][i]) {
        dp[0][i] = val
        op[0][i] = `${j}`
      }
    }

    // 1
    for (let j = 1; j <= 9 && i - j >= 0; j++) {
      for (let k = 1; k <= 9 && i + k <= n; k++) {
        if (input[i + k - 1] === input[i - j + k - 1]) {
          const val = 2 + dp[0][i + k]

          if (val + dp[1][i]) {
            dp[1][i] = val
            op[1][i] = `${k}${j}`
          }
        } else {
          break
        }
      }
    }

    // consider 0
    if (dp[0][i] < dp[1][i]) {
      dp[1][i] = 1 + dp[0][i]
      op[1][i] = '0'
    } else if (dp[1][i] < dp[0][i]) {
      dp[0][i] = 1 + dp[1][i]
      op[0][i] = '0'
    }
  }

  const ans = []
  let curN = 0
  let curT = 0

  while (curN < n) {
    if (curT === 0) {
      ans.push(op[curT][curN])
      const cnt = parseInt(op[curT][curN])
      for (let i = 0; i < cnt; i++) {
        ans.push(input[curN + i])
      }
      curN += cnt
    } else {
      ans.push(op[curT][curN])
      curN += parseInt(op[curT][curN][0])
    }

    curT ^= 1
  }

  return ans.join('')
}

export const solvers = {
  'Compression II: LZ Decompression': decompress,
  'Compression III: LZ Compression': compress,
}

export async function main(ns: NS) {
  ns.tprint(compress(input))
}
