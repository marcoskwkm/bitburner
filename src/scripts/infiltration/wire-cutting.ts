import {
  getDocument,
  getElementSelectorFromRootByPath,
} from 'scripts/utils/dom'

export const PAGE_ID = 'wire-cutting'

const containerPath = [2, 1, 1, 3]

export const isCurrentPage = () => {
  const el = getDocument().querySelector(
    getElementSelectorFromRootByPath(containerPath.concat(1))
  )
  return Boolean(
    el &&
      'innerText' in el &&
      typeof el.innerText === 'string' &&
      el.innerText?.includes('Cut the wires')
  )
}

export const init = () => {
  if (getDocument().querySelector('#wire-cutting-solution')) {
    return
  }

  const instructions = [
    ...getDocument().querySelectorAll(
      getElementSelectorFromRootByPath(containerPath) + ' > p'
    ),
  ].map((el) => (el as HTMLElement).innerText.slice(0, -1))

  if (instructions.length === 0) {
    return
  }

  const grid = [
    ...(getDocument().querySelector(
      getElementSelectorFromRootByPath(containerPath) + ' :last-child'
    )?.children ?? []),
  ] as HTMLElement[]

  const N = grid.filter((el) => el.style.color === 'rgb(0, 204, 0)').length

  const wireHasColor = (wire: number, color: string) => {
    for (let i = N + wire - 1; i < grid.length; i += N) {
      if (grid[i].style.color === color) {
        return true
      }
    }
    return false
  }

  const solution = new Set<string>()

  instructions.forEach((instruction) => {
    if (instruction.split(' ').slice(-2)[0] === 'number') {
      solution.add(instruction.split(' ').slice(-1)[0])
      return
    }

    const [color] = instruction.split(' ').slice(-1)

    for (let i = 1; i <= N; i++) {
      if (wireHasColor(i, color === 'yellow' ? 'rgb(255, 193, 7)' : color)) {
        solution.add(i.toString())
      }
    }
  })

  const infoElement = getDocument().createElement('p')
  infoElement.id = 'wire-cutting-solution'
  infoElement.innerText = `Solution: ${[...solution]
    .sort((a, b) => parseInt(a) - parseInt(b))
    .join(', ')}`
  infoElement.style.color = 'yellow'
  infoElement.style.fontFamily =
    '"Lucida Console", "Lucida Sans Unicode", "Fira Mono", Consolas, "Courier New", Courier, monospace, "Times New Roman"'
  infoElement.style.fontStyle = 'italic'

  getDocument()
    .querySelector(getElementSelectorFromRootByPath(containerPath))
    ?.appendChild(infoElement)

  const f = (event: KeyboardEvent) => {
    if (!solution.has(event.key)) {
      event.preventDefault()
      event.stopImmediatePropagation()
      return
    }
  }

  getDocument().addEventListener('keydown', f, true)
  return () => getDocument().removeEventListener('keydown', f, true)
}

export const update = init
