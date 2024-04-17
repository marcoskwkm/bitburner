import { getDocument, getElementSelectorFromRootByPath } from 'utils/dom'

export const PAGE_ID = 'minesweeper-game'

const containerPath = [2, 1, 1, 3]

export const isCurrentPage = () => {
  const el = getDocument().querySelector(
    getElementSelectorFromRootByPath(containerPath.concat(1))
  )
  return Boolean(
    el &&
      'innerText' in el &&
      typeof el.innerText === 'string' &&
      el.innerText?.includes('all the mines')
  )
}

const memo = {
  mines: [] as number[],
}

const getGrid = () =>
  [
    ...(getDocument().querySelector(
      getElementSelectorFromRootByPath(containerPath.concat(2))
    )?.children ?? []),
  ] as HTMLElement[]

const preventDeathHandler = (event: Event) => {
  if (!('key' in event) || event.key !== ' ' || !memo.mines.length) {
    return
  }

  const idx = getGrid().findIndex(
    (el) => getComputedStyle(el).color === 'rgb(102, 153, 255)'
  )

  if (!memo.mines.includes(idx)) {
    event.preventDefault()
    event.stopImmediatePropagation()
  }
}

export const init = () => {
  memo.mines = []

  getGrid().forEach((el, idx) => {
    if (el.children.length > 0) {
      memo.mines.push(idx)
    }
  })

  getDocument().addEventListener('keydown', preventDeathHandler, true)
  return () =>
    getDocument().removeEventListener('keydown', preventDeathHandler, true)
}

export const update = () => {
  getGrid().forEach((el, idx) => {
    if (memo.mines.includes(idx) && el.children.length === 0) {
      el.style.borderColor = 'red'
    }
  })

  const f = (event: KeyboardEvent) => {
    if (event.key !== 'Enter') {
      return
    }

    let curIdx = -1
    const grid = [
      ...(getDocument().querySelector(
        getElementSelectorFromRootByPath(containerPath.concat(2))
      )?.children ?? []),
    ] as HTMLElement[]

    grid.forEach((el, idx) => {
      const child = el.children[0] as HTMLElement | undefined

      if (child?.dataset.testid === 'CloseIcon') {
        curIdx = idx
      }
    })

    if (!memo.mines.includes(curIdx)) {
      event.preventDefault()
      event.stopImmediatePropagation()
      return
    }
  }

  getDocument().addEventListener('keydown', f, true)
  return () => getDocument().removeEventListener('keydown', f, true)
}
