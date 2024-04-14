import { getDocument } from 'scripts/utils/dom'

export const PAGE_ID = 'infiltration-main'

export const isCurrentPage = () => {
  const el = getDocument().querySelector('.css-1hdp5y0')
  return Boolean(
    el &&
      'innerText' in el &&
      typeof el.innerText === 'string' &&
      el.innerText?.includes('Infiltration is a series of short minigames')
  )
}

export const init = () => {
  const container = getDocument().querySelector('.css-llg1yp')

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
