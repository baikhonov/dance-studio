interface WithId {
  id: number
}

export const generateId = <T extends WithId>(items: T[]): number =>
  Math.max(...items.map((item) => item.id), 0) + 1
