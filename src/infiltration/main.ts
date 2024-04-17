import { getDocument, getElementSelectorFromRootByPath } from 'utils/dom'

export const PAGE_ID = 'infiltration-main'

const containerPath = [2, 1, 1, 2]

export const isCurrentPage = () => {
  const el = getDocument().querySelector(
    getElementSelectorFromRootByPath(containerPath.concat(1))
  )
  return Boolean(
    el &&
      'innerText' in el &&
      typeof el.innerText === 'string' &&
      el.innerText?.includes('Infiltration is a series of short minigames')
  )
}

export const init = () => {
  const container = getDocument().querySelector(
    getElementSelectorFromRootByPath(containerPath)
  )

  if (!container) {
    throw new Error('Infiltration main screen container not found')
  }

  const infoElement = getDocument().createElement('p')
  infoElement.innerText = 'Infiltration helper scripts loaded.'
  infoElement.style.color = 'yellow'
  infoElement.style.fontFamily =
    '"Lucida Console", "Lucida Sans Unicode", "Fira Mono", Consolas, "Courier New", Courier, monospace, "Times New Roman"'
  infoElement.style.fontStyle = 'italic'

  container.prepend(infoElement)
}

export const update = () => {} // eslint-disable-line @typescript-eslint/no-empty-function
