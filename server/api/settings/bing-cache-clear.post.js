import { authMiddleware } from '../../utils/authMiddleware.js'
import { clearBingDailyCache } from '../../utils/bingDaily.js'

export default defineEventHandler(async (event) => {
  await authMiddleware(event)

  const { deletedCount } = await clearBingDailyCache()
  return {
    success: true,
    message: `已清空 Bing 缓存（${deletedCount} 张）`,
    data: { deletedCount }
  }
})
