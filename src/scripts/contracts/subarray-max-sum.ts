const input = [
  -9, 8, -10, 9, 2, -9, -7, -5, 6, 9, 3, 2, 1, -1, 2, -9, 8, 5, -6, -6, 3, -3,
  6, 7, -1, 5, -7, -1,
]

export const solve = (arr: number[]) => {
  let best = arr[0]
  let sum = 0

  for (const x of arr) {
    sum += x

    if (sum > best) {
      best = sum
    }

    if (sum < 0) {
      sum = 0
    }
  }

  console.log(best)
}

solve(input)
