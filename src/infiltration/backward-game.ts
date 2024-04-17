import { getDocument, getElementSelectorFromRootByPath } from 'utils/dom'

export const PAGE_ID = 'backward-game'

const containerPath = [2, 1, 1, 3]

export const isCurrentPage = () => {
  const el = getDocument().querySelector(
    getElementSelectorFromRootByPath(containerPath.concat(1))
  )
  return Boolean(
    el &&
      'innerText' in el &&
      typeof el.innerText === 'string' &&
      el.innerText?.includes('Type it backward')
  )
}

export const update = () => {
  if (getDocument().querySelector('#backward-game-solution')) {
    return
  }

  const text =
    (
      getDocument().querySelector(
        getElementSelectorFromRootByPath(containerPath.concat(2))
      ) as HTMLElement | undefined
    )?.innerText.trim() ?? ''

  const infoElement = getDocument().createElement('p')
  infoElement.id = 'backward-game-solution'
  infoElement.innerText = text
  infoElement.style.color = 'yellow'
  infoElement.style.fontFamily =
    '"Lucida Console", "Lucida Sans Unicode", "Fira Mono", Consolas, "Courier New", Courier, monospace, "Times New Roman"'
  infoElement.style.fontStyle = 'italic'

  getDocument()
    .querySelector(getElementSelectorFromRootByPath(containerPath))
    ?.appendChild(infoElement)

  const f = (event: KeyboardEvent) => {
    const curText =
      (
        getDocument().querySelector(
          getElementSelectorFromRootByPath(containerPath.concat(3))
        ) as HTMLElement | undefined
      )?.innerText.slice(0, -1) ?? ''

    const nextChar = text.charAt(curText.length)

    if (nextChar.toLowerCase() !== event.key.toLowerCase()) {
      event.preventDefault()
      event.stopImmediatePropagation()
      return
    }
  }

  getDocument().addEventListener('keydown', f, true)
  return () => getDocument().removeEventListener('keydown', f, true)
}

export const init = update
