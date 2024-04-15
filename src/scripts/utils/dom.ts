export const getDocument = () => eval('document')

export const getElementSelectorFromRootByPath = (path: number[]) =>
  ['#root', ...path.map((n) => `:nth-child(${n})`)].join(' > ')
