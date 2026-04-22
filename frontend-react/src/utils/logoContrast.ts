/**
 * Оценивает, нужна ли тёмная подложка под светлым логотипом (как во Vue App.vue).
 */
export const shouldUseLogoContrastBackground = async (logoUrl: string | null): Promise<boolean> => {
  if (!logoUrl) return false

  const image = new Image()
  image.crossOrigin = 'anonymous'
  image.src = logoUrl

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve()
    image.onerror = () => reject(new Error('Logo load failed'))
  })

  const sampleSize = 48
  const canvas = document.createElement('canvas')
  canvas.width = sampleSize
  canvas.height = sampleSize
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) return false

  context.clearRect(0, 0, sampleSize, sampleSize)
  context.drawImage(image, 0, 0, sampleSize, sampleSize)
  const pixels = context.getImageData(0, 0, sampleSize, sampleSize).data

  let visiblePixels = 0
  let brightPixels = 0
  let luminanceSum = 0
  for (let index = 0; index < pixels.length; index += 4) {
    const alpha = pixels[index + 3] / 255
    if (alpha < 0.05) continue

    visiblePixels += 1
    const red = pixels[index]
    const green = pixels[index + 1]
    const blue = pixels[index + 2]
    const luminance = (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255
    luminanceSum += luminance
    if (luminance > 0.72) {
      brightPixels += 1
    }
  }

  if (visiblePixels === 0) return false

  const brightRatio = brightPixels / visiblePixels
  const averageLuminance = luminanceSum / visiblePixels

  return brightRatio > 0.35 || averageLuminance > 0.68
}
