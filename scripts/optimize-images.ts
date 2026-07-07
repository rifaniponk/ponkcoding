/**
 * Post-build image optimizer.
 *
 * Vite copies public/ into dist/ without transforming its files. This script
 * recompresses supported raster images in dist/ only, preserving the original
 * source assets and their public URLs.
 */
import { copyFile, readdir, rm, stat } from 'node:fs/promises'
import { extname, join } from 'node:path'
import sharp from 'sharp'

const DIST_DIR = join(process.cwd(), 'dist')
const SUPPORTED_EXTENSIONS = new Set(['.avif', '.jpeg', '.jpg', '.png', '.webp'])

async function findImages(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name)
      if (entry.isDirectory()) return findImages(path)
      return SUPPORTED_EXTENSIONS.has(extname(entry.name).toLowerCase()) ? [path] : []
    }),
  )
  return files.flat()
}

function optimizerFor(path: string) {
  const image = sharp(path, { animated: true }).rotate()

  switch (extname(path).toLowerCase()) {
    case '.jpg':
    case '.jpeg':
      return image.jpeg({ quality: 82, progressive: true, mozjpeg: true })
    case '.png':
      return image.png({ compressionLevel: 9, adaptiveFiltering: true })
    case '.webp':
      return image.webp({ quality: 82, effort: 6 })
    case '.avif':
      return image.avif({ quality: 55, effort: 6 })
    default:
      return image
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  return `${(bytes / 1024).toFixed(1)} KB`
}

async function optimize(path: string) {
  const before = (await stat(path)).size
  const temporaryPath = `${path}.optimized`

  try {
    await optimizerFor(path).toFile(temporaryPath)
    const after = (await stat(temporaryPath)).size

    if (after >= before) {
      await rm(temporaryPath)
      return { before, after: before, changed: false }
    }

    await copyFile(temporaryPath, path)
    await rm(temporaryPath)
    return { before, after, changed: true }
  } catch (error) {
    await rm(temporaryPath, { force: true })
    throw error
  }
}

async function run() {
  const images = await findImages(DIST_DIR)
  let beforeTotal = 0
  let afterTotal = 0
  let changedTotal = 0

  for (const image of images) {
    const result = await optimize(image)
    beforeTotal += result.before
    afterTotal += result.after
    if (result.changed) changedTotal += 1
  }

  const saved = beforeTotal - afterTotal
  console.log(
    `[images] optimized ${changedTotal}/${images.length} image(s): ` +
      `${formatBytes(beforeTotal)} → ${formatBytes(afterTotal)} ` +
      `(${formatBytes(saved)} saved)`,
  )
}

run().catch((error) => {
  console.error('[images] optimization failed', error)
  process.exit(1)
})
