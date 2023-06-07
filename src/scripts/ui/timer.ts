import { formatTime } from 'scripts/utils/time'

const CONTAINER_ID = 'custom-ui-container'

const init = () => {
  const doc = eval('document') as Document

  if (doc.getElementById(CONTAINER_ID)) {
    return
  }

  const container = doc.createElement('div')
  container.id = CONTAINER_ID
  container.style.position = 'fixed'
  container.style.bottom = '2rem'
  container.style.right = '0'
  container.style.display = 'flex'
  container.style.flexDirection = 'column'
  container.style.alignItems = 'end'
  container.style.fontFamily =
    '"Lucida Console", "Lucida Sans Unicode", "Fira Mono", Consolas, "Courier New", Courier, monospace, "Times New Roman"'
  container.style.zIndex = '100'
  container.style.color = '#0c0'

  doc.body.append(container)
}

export const createTimer = (label: string, time: number) => {
  const doc = eval('document') as Document

  init()

  const now = performance.now()
  const target = now + time

  const el = doc.createElement('div')
  el.style.padding = '1rem 0.5rem'
  el.style.borderStyle = 'solid'
  el.style.borderColor = 'rgb(128, 128, 128)'
  el.style.borderWidth = '1px'

  const container = doc.getElementById(CONTAINER_ID)

  const refresh = () => {
    const remTime = target - performance.now()

    if (remTime < 0) {
      container?.removeChild(el)
      return
    }

    el.innerText = `${label}: ${formatTime(remTime)}`
    setTimeout(refresh, 100)
  }

  refresh()

  container?.append(el)
}

export async function main(): Promise<void> {
  init()

  createTimer('Test', 30000)
}
