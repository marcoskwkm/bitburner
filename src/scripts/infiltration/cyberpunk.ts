import {
  getDocument,
  getElementSelectorFromRootByPath,
} from 'scripts/utils/dom'

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

export const update = () => {
  const sequence = [
    ...(getDocument().querySelector(
      getElementSelectorFromRootByPath(containerPath.concat(2))
    )?.children ?? []),
  ]

  const curIdx = sequence.findIndex(
    (el: HTMLElement) => el.style.color === 'rgb(102, 153, 255)'
  )

  const curSymbol = sequence[curIdx]?.innerText.trim()
  const nextSymbol = sequence[curIdx + 1]?.innerText.trim()

  ;[
    ...(getDocument().querySelector(
      getElementSelectorFromRootByPath(containerPath.concat(4))
    )?.children ?? []),
  ].forEach((el: HTMLElement) => {
    if (el.innerText.trim() === curSymbol) {
      el.style.color = 'red'
    } else if (el.innerText.trim() === nextSymbol) {
      el.style.color = 'yellow'
    } else {
      el.style.color = ''
    }
  })
}

export const init = () => {
  const f = () => setTimeout(update)
  getDocument().addEventListener('keydown', f)
  update()
  return () => getDocument().removeEventListener('keydown', f)
}
