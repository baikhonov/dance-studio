export const parseNumericId = (value: string): number | null => {
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed <= 0) return null
  return parsed
}

export const parseOptionalNumeric = (value: unknown): number | null => {
  if (value === null || value === undefined) return null
  if (typeof value !== 'number' || !Number.isInteger(value) || value <= 0) return null
  return value
}

export const parseTeacherIds = (value: unknown): number[] => {
  if (!Array.isArray(value)) return []
  return value
    .filter((id): id is number => typeof id === 'number' && Number.isInteger(id) && id > 0)
    .filter((id, index, self) => self.indexOf(id) === index)
}

export const parseLevelIds = (value: unknown): number[] => {
  if (!Array.isArray(value)) return []
  return value
    .filter((id): id is number => typeof id === 'number' && Number.isInteger(id) && id > 0)
    .filter((id, index, self) => self.indexOf(id) === index)
}
