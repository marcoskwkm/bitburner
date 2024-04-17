import {
  getDocument,
  getElementSelectorFromRootByPath,
} from 'scripts/utils/dom'

export const PAGE_ID = 'slash-game'

const containerPath = [2, 1, 1, 3]

export const isCurrentPage = () => {
  const el = getDocument().querySelector(
    getElementSelectorFromRootByPath(containerPath.concat(1))
  )
  return Boolean(
    el &&
      'innerText' in el &&
      typeof el.innerText === 'string' &&
      el.innerText?.includes('Attack when his guard is down')
  )
}

const getText = () =>
  (
    getDocument().querySelector(
      getElementSelectorFromRootByPath(containerPath) + ' > h4:nth-of-type(2)'
    ) as HTMLElement | undefined
  )?.innerText ?? ''

const syncSleep = (ms: number) => {
  const start = Date.now()
  while (Date.now() - start < ms);
}

const preventDeathHandler = (event: Event) => {
  if (!('key' in event) || event.key !== ' ') {
    return
  }

  if (getText().toLowerCase().includes('guarding')) {
    event.preventDefault()
    event.stopImmediatePropagation()
  }
}

export const init = () => {
  getDocument().addEventListener('keydown', preventDeathHandler, true)
  return () =>
    getDocument().removeEventListener('keydown', preventDeathHandler, true)
}

export const update = () => {
  if (getText().toLowerCase().includes('preparing')) {
    setTimeout(() => syncSleep(1000))
  }
}
