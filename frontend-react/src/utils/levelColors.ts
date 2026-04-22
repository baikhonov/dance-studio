export const DEFAULT_LEVEL_COLOR = '#f59e0b'

const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/

const clamp = (value: number) => Math.max(0, Math.min(255, Math.round(value)))

const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const clean = hex.replace('#', '')
  return {
    r: Number.parseInt(clean.slice(0, 2), 16),
    g: Number.parseInt(clean.slice(2, 4), 16),
    b: Number.parseInt(clean.slice(4, 6), 16),
  }
}

const rgbToHex = (r: number, g: number, b: number): string =>
  `#${clamp(r).toString(16).padStart(2, '0')}${clamp(g).toString(16).padStart(2, '0')}${clamp(b).toString(16).padStart(2, '0')}`

const lightenHex = (hex: string, amount: number): string => {
  const { r, g, b } = hexToRgb(hex)
  return rgbToHex(r + (255 - r) * amount, g + (255 - g) * amount, b + (255 - b) * amount)
}

const darkenHex = (hex: string, amount: number): string => {
  const { r, g, b } = hexToRgb(hex)
  return rgbToHex(r * (1 - amount), g * (1 - amount), b * (1 - amount))
}

export const normalizeLevelColor = (color: string | null | undefined): string =>
  typeof color === 'string' && HEX_COLOR_RE.test(color) ? color.toLowerCase() : DEFAULT_LEVEL_COLOR

export const getLevelCardStyle = (color: string | null | undefined) => {
  const normalized = normalizeLevelColor(color)
  return {
    borderLeftColor: darkenHex(normalized, 0.2),
    backgroundColor: lightenHex(normalized, 0.74),
  }
}
