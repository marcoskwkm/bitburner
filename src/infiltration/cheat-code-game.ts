import { getDocument, getElementSelectorFromRootByPath } from 'utils/dom'

export const PAGE_ID = 'cheat-code-game'

const upArrowSymbol = '↑'
const downArrowSymbol = '↓'
const leftArrowSymbol = '←'
const rightArrowSymbol = '→'

function getArrow(event: KeyboardEvent): string | undefined {
  switch (event.key) {
    case 'ArrowUp':
      return upArrowSymbol
    case 'ArrowLeft':
      return leftArrowSymbol
    case 'ArrowDown':
      return downArrowSymbol
    case 'ArrowRight':
      return rightArrowSymbol
    default:
      return undefined
  }
}

const containerPath = [2, 1, 1, 3]

export const isCurrentPage = () => {
  const el = getDocument().querySelector(
    getElementSelectorFromRootByPath(containerPath.concat(1))
  )
  return Boolean(
    el &&
      'innerText' in el &&
      typeof el.innerText === 'string' &&
      el.innerText?.includes('Enter the Code')
  )
}

export const init = () => {
  const f = (event: Event) => {
    const seq = [
      ...(getDocument().querySelector(
        getElementSelectorFromRootByPath(containerPath.concat(2, 1))
      )?.children ?? []),
    ].map((el) => (el as HTMLElement).innerText)

    let nextKey = ''

    seq.forEach((key) => key !== '?' && (nextKey = key))

    if (getArrow(event as KeyboardEvent) !== nextKey) {
      event.preventDefault()
      event.stopImmediatePropagation()
      return
    }
  }

  getDocument().addEventListener('keydown', f, true)
  return () => getDocument().removeEventListener('keydown', f, true)
}

export const update = () => {} // eslint-disable-line @typescript-eslint/no-empty-function
