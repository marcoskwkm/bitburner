import {
  getDocument,
  getElementSelectorFromRootByPath,
} from 'scripts/utils/dom'

export const PAGE_ID = 'bribe-game'

const containerPath = [2, 1, 1, 3]

const positiveWords = [
  'affectionate',
  'agreeable',
  'bright',
  'charming',
  'creative',
  'determined',
  'energetic',
  'friendly',
  'funny',
  'generous',
  'polite',
  'likable',
  'diplomatic',
  'helpful',
  'giving',
  'kind',
  'hardworking',
  'patient',
  'dynamic',
  'loyal',
  'straightforward',
]

export const isCurrentPage = () => {
  const el = getDocument().querySelector(
    getElementSelectorFromRootByPath(containerPath.concat(1))
  )
  return Boolean(
    el &&
      'innerText' in el &&
      typeof el.innerText === 'string' &&
      el.innerText?.includes('Say something nice')
  )
}

const getTextElement = () =>
  getDocument().querySelector(
    getElementSelectorFromRootByPath(containerPath.concat(3))
  ) as HTMLElement | undefined

const preventDeathHandler = (event: Event) => {
  if (!('key' in event) || event.key !== ' ') {
    return
  }

  if (!positiveWords.includes(getTextElement()?.innerText ?? '')) {
    event.preventDefault()
    event.stopImmediatePropagation()
  }
}

export const init = () => {
  const upd = () =>
    setTimeout(() => {
      const el = getTextElement()

      if (!el) {
        return
      }

      if (positiveWords.includes(el.innerText)) {
        el.style.color = 'red'
      } else {
        el.style.color = ''
      }
    })

  upd()

  getDocument().addEventListener('keydown', upd)
  getDocument().addEventListener('keydown', preventDeathHandler, true)
  return () => {
    getDocument().removeEventListener('keydown', upd)
    getDocument().removeEventListener('keydown', preventDeathHandler, true)
  }
}

export const update = () => {} // eslint-disable-line @typescript-eslint/no-empty-function
