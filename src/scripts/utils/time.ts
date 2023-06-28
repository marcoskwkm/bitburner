export const formatTime = (timeMs: number) => {
  const seconds = Math.floor(timeMs / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const remSeconds = seconds - minutes * 60
  const remMinutes = minutes - hours * 60

  return [hours > 0 ? hours : null, remMinutes, remSeconds]
    .filter((x): x is number => x !== null)
    .map((x) => x.toString().padStart(2, '0'))
    .join(':')
}
