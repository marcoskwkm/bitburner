import {
  getDocument,
  getElementSelectorFromRootByPath,
} from 'scripts/utils/dom'

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
  const f = (event: KeyboardEvent) => {
    const seq = [
      ...(getDocument().querySelector(
        getElementSelectorFromRootByPath(containerPath.concat(2, 1))
      )?.children ?? []),
    ].map((el) => el.innerText)

    let nextKey = ''

    seq.forEach((key) => key !== '?' && (nextKey = key))

    if (getArrow(event) !== nextKey) {
      event.preventDefault()
      event.stopImmediatePropagation()
      return
    }
  }

  getDocument().addEventListener('keydown', f, { useCapture: true })
  return () =>
    getDocument().removeEventListener('keydown', f, { useCapture: true })
}

export const update = () => {} // eslint-disable-line @typescript-eslint/no-empty-function