import {
  getDocument,
  getElementSelectorFromRootByPath,
} from 'scripts/utils/dom'

export const PAGE_ID = 'bracket-game'

const containerPath = [2, 1, 1, 3]

export const isCurrentPage = () => {
  const el = getDocument().querySelector(
    getElementSelectorFromRootByPath(containerPath.concat(1))
  )
  return Boolean(
    el &&
      'innerText' in el &&
      typeof el.innerText === 'string' &&
      el.innerText?.includes('Close the brackets')
  )
}

export const init = () => {
  const brackets =
    (
      getDocument().querySelector(
        getElementSelectorFromRootByPath(containerPath.concat(2))
      ) as HTMLElement | undefined
    )?.innerText
      .slice(0, -1)
      .split('')
      .reverse()
      .join('') ?? ''

  const f = (event: Event) => {
    const curIdx =
      ((
        getDocument().querySelector(
          getElementSelectorFromRootByPath(containerPath.concat(2))
        ) as HTMLElement | undefined
      )?.innerText.length ?? 0) -
      1 -
      brackets.length

    const nextKey = brackets[curIdx]

    const solutionMap: Record<string, string> = {
      '(': ')',
      '[': ']',
      '{': '}',
      '<': '>',
    }

    if ((event as KeyboardEvent).key !== solutionMap[nextKey]) {
      event.preventDefault()
      event.stopImmediatePropagation()
    }
  }

  getDocument().addEventListener('keydown', f, true)
  return () => getDocument().removeEventListener('keydown', f, true)
}

export const update = () => {} // eslint-disable-line @typescript-eslint/no-empty-function
