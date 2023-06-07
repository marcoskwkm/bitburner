const grid = [
  0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
]

const n = 8
const m = 6

const solve = () => {
  const check = (r: number, c: number) => grid[r * m + c]

  const dp = [...new Array(n)].map(() => new Array(m).fill(0))

  dp[0][0] = 1
  for (let r = 0; r < n; r++) {
    for (let c = r === 0 ? 1 : 0; c < m; c++) {
      if (check(r, c) === 1) {
        continue
      }
      dp[r][c] = (r === 0 ? 0 : dp[r - 1][c]) + (c === 0 ? 0 : dp[r][c - 1])
    }
  }

  console.log(dp)
  console.log(dp[n - 1][m - 1])
}

solve()
