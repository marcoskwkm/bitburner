export const formatTime = (timeMs: number) => {
  const seconds = Math.floor(timeMs / 1000)
  const minutes = Math.floor(seconds / 60)
  const remSeconds = seconds - minutes * 60
  return `${minutes.toString().padStart(2, '0')}:${remSeconds
    .toString()
    .padStart(2, '0')}`
}
