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

const syncSleep = (ms: number) => {
  const start = Date.now()
  while (Date.now() - start < ms);
}

export const init = () => {} // eslint-disable-line @typescript-eslint/no-empty-function

export const update = () => {
  const text =
    (
      getDocument().querySelector(
        getElementSelectorFromRootByPath(containerPath.concat(2))
      ) as HTMLElement | undefined
    )?.innerText ?? ''

  if (text.toLowerCase().includes('preparing')) {
    setTimeout(() => syncSleep(1000))
  }
}
