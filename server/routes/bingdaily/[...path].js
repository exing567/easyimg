import { extname, basename } from 'path'
import { readBingImage } from '../../utils/bingDaily.js'

const CONTENT_TYPES = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp'
}

export default defineEventHandler(async (event) => {
  try {
    const pathSegments = event.context.params?.path

    if (!pathSegments) {
      throw createError({ statusCode: 400, message: '无效路径' })
    }

    const filename = Array.isArray(pathSegments)
      ? pathSegments[pathSegments.length - 1]
      : pathSegments.split('/').pop()

    const safeFilename = basename(filename || '')
    if (!safeFilename) {
      throw createError({ statusCode: 400, message: '无效文件名' })
    }

    const fileBuffer = await readBingImage(safeFilename)
    const ext = extname(safeFilename).toLowerCase()

    setHeader(event, 'Content-Type', CONTENT_TYPES[ext] || 'application/octet-stream')
    setHeader(event, 'Cache-Control', 'public, max-age=86400')

    return fileBuffer
  } catch (error) {
    if (error.statusCode) {
      throw error
    }

    throw createError({ statusCode: 404, message: '图片不存在' })
  }
})
