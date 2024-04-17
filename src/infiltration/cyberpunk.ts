import { getDocument, getElementSelectorFromRootByPath } from 'utils/dom'

export const PAGE_ID = 'cyperpunk'

const containerPath = [2, 1, 1, 3]

export const isCurrentPage = () => {
  const el = getDocument().querySelector(
    getElementSelectorFromRootByPath(containerPath.concat(1))
  )
  return Boolean(
    el &&
      'innerText' in el &&
      typeof el.innerText === 'string' &&
      el.innerText?.includes('Match the symbols')
  )
}

const getGrid = () =>
  [
    ...(getDocument().querySelector(
      getElementSelectorFromRootByPath(containerPath.concat(4))
    )?.children ?? []),
  ] as HTMLElement[]

export const update = () => {
  const sequence = [
    ...((getDocument().querySelector(
      getElementSelectorFromRootByPath(containerPath.concat(2))
    )?.children ?? []) as HTMLElement[]),
  ]

  const curIdx = sequence.findIndex(
    (el) => el.style.color === 'rgb(102, 153, 255)'
  )

  const curSymbol = sequence[curIdx]?.innerText.trim()
  const nextSymbol = sequence[curIdx + 1]?.innerText.trim()

  getGrid().forEach((el) => {
    if (el.innerText.trim() === curSymbol) {
      el.style.color = 'red'
    } else if (el.innerText.trim() === nextSymbol) {
      el.style.color = 'yellow'
    } else {
      el.style.color = ''
    }
  })
}

const preventFailHandler = (event: Event) => {
  if (!('key' in event) || event.key !== ' ') {
    return
  }

  const curEl = getGrid().find(
    (el) => getComputedStyle(el).borderColor === 'rgb(102, 153, 255)'
  )

  if (curEl?.style.color !== 'red') {
    event.preventDefault()
    event.stopImmediatePropagation()
  }
}

export const init = () => {
  const f = () => setTimeout(update)
  update()

  getDocument().addEventListener('keydown', f)
  getDocument().addEventListener('keydown', preventFailHandler, true)
  return () => {
    getDocument().removeEventListener('keydown', f)
    getDocument().removeEventListener('keydown', preventFailHandler, true)
  }
}
