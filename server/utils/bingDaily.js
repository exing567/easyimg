import { mkdir, access, readFile, writeFile, unlink, readdir } from 'fs/promises'
import { constants } from 'fs'
import { join, basename } from 'path'

const BING_CACHE_DIR = join(process.cwd(), 'bingdaily')
const BING_META_URL = 'https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=zh-CN'

async function ensureBingDir() {
  await mkdir(BING_CACHE_DIR, { recursive: true })
}


async function getLatestCachedImage() {
  const files = await readdir(BING_CACHE_DIR)
  const imageFiles = files
    .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file))
    .sort((a, b) => b.localeCompare(a))

  if (imageFiles.length === 0) {
    return null
  }

  return {
    filename: imageFiles[0],
    localUrl: `/bingdaily/${imageFiles[0]}`,
    title: 'Bing Daily (cached)',
    copyright: '',
    fullStartDate: ''
  }
}

function getFileExtension(url = '') {
  const cleanUrl = url.split('?')[0]
  const last = cleanUrl.lastIndexOf('.')
  if (last === -1) return '.jpg'
  const ext = cleanUrl.slice(last)
  return ext && ext.length <= 5 ? ext : '.jpg'
}

export async function getBingDailyImage() {
  await ensureBingDir()

  try {
    const metaResponse = await fetch(BING_META_URL)
    if (!metaResponse.ok) {
      throw createError({ statusCode: 502, message: '获取 Bing 每日图片信息失败' })
    }

    const meta = await metaResponse.json()
    const image = meta.images?.[0]

    if (!image?.url) {
      throw createError({ statusCode: 502, message: 'Bing 图片信息无效' })
    }

    const imageUrl = image.url.startsWith('http') ? image.url : `https://www.bing.com${image.url}`
    const ext = getFileExtension(imageUrl)
    const filename = `${image.startdate || Date.now()}${ext}`
    const safeFilename = basename(filename)
    const filePath = join(BING_CACHE_DIR, safeFilename)

    try {
      await access(filePath, constants.F_OK)
    } catch {
      const imageResponse = await fetch(imageUrl)
      if (!imageResponse.ok) {
        throw createError({ statusCode: 502, message: '下载 Bing 每日图片失败' })
      }
      const buffer = Buffer.from(await imageResponse.arrayBuffer())
      await writeFile(filePath, buffer)
    }

    return {
      filename: safeFilename,
      localUrl: `/bingdaily/${safeFilename}`,
      title: image.title || '',
      copyright: image.copyright || '',
      fullStartDate: image.fullstartdate || ''
    }
  } catch (error) {
    const cached = await getLatestCachedImage()
    if (cached) {
      return cached
    }

    if (error.statusCode) {
      throw error
    }

    throw createError({ statusCode: 502, message: '暂时无法获取 Bing 每日图片' })
  }
}

export async function readBingImage(filename) {
  await ensureBingDir()
  const safeFilename = basename(filename)
  if (!safeFilename) {
    throw createError({ statusCode: 400, message: '文件名无效' })
  }

  const filePath = join(BING_CACHE_DIR, safeFilename)
  return readFile(filePath)
}

export async function clearBingDailyCache() {
  await ensureBingDir()
  const files = await readdir(BING_CACHE_DIR)
  let deletedCount = 0

  for (const file of files) {
    const filePath = join(BING_CACHE_DIR, file)
    await unlink(filePath)
    deletedCount++
  }

  return { deletedCount }
}
