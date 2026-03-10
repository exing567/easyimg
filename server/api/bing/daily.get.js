import { getBingDailyImage } from '../../utils/bingDaily.js'

export default defineEventHandler(async () => {
  const data = await getBingDailyImage()
  return {
    success: true,
    message: '获取 Bing 每日图片成功',
    data
  }
})
