export const directionStyles: Record<string, string> = {
  lady: 'border-purple-600 bg-purple-100 hover:bg-purple-200',
  пар: 'border-orange-600 bg-orange-100 hover:bg-orange-200',
  растяжка: 'border-blue-600 bg-blue-100 hover:bg-blue-200',
  stretching: 'border-blue-600 bg-blue-100 hover:bg-blue-200',
  общее: 'border-teal-600 bg-teal-100 hover:bg-teal-200',
  party: 'border-red-600 bg-red-100 hover:bg-red-200',
  вечеринка: 'border-red-600 bg-red-100 hover:bg-red-200',
}

export const getDirectionClass = (direction: string): string => {
  const lower = direction.toLowerCase()
  for (const [key, value] of Object.entries(directionStyles)) {
    if (lower.includes(key)) return value
  }
  return 'border-amber-600 bg-amber-100 hover:bg-amber-200'
}
