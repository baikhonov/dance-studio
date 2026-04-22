const ensureFaviconElement = (): HTMLLinkElement => {
  let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
  if (!link) {
    link = document.createElement('link')
    link.rel = 'icon'
    document.head.appendChild(link)
  }
  return link
}

export const resetFaviconToDefault = () => {
  const link = ensureFaviconElement()
  link.href = '/favicon.svg'
  link.type = 'image/svg+xml'
}

export const updateFaviconFromLogoUrl = async (logoUrl: string | null) => {
  const link = ensureFaviconElement()

  if (!logoUrl) {
    resetFaviconToDefault()
    return
  }

  const image = new Image()
  image.crossOrigin = 'anonymous'
  image.src = logoUrl

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve()
    image.onerror = () => reject(new Error('Logo load failed'))
  })

  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const context = canvas.getContext('2d')
  if (!context) {
    resetFaviconToDefault()
    return
  }

  context.clearRect(0, 0, 64, 64)
  const scale = Math.min(64 / image.width, 64 / image.height)
  const drawWidth = image.width * scale
  const drawHeight = image.height * scale
  const offsetX = (64 - drawWidth) / 2
  const offsetY = (64 - drawHeight) / 2
  context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight)
  link.href = canvas.toDataURL('image/png')
  link.type = 'image/png'
}
