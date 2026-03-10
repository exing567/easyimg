<template>
  <div class="min-h-screen flex flex-col relative">
    <!-- 全局背景图片 -->
    <div
      v-if="currentBackgroundUrl"
      class="fixed inset-0 z-0"
    >
      <img
        :src="currentBackgroundUrl"
        alt="背景"
        class="w-full h-full object-cover"
      />
      <div
        v-if="backgroundBlur > 0"
        class="absolute inset-0"
        :style="{ backdropFilter: `blur(${backgroundBlur}px)`, WebkitBackdropFilter: `blur(${backgroundBlur}px)` }"
      ></div>
      <!-- 背景遮罩层，确保内容可读性 -->
      <div class="absolute inset-0 bg-white/30 dark:bg-gray-900/50"></div>
    </div>

    <!-- 顶部导航栏 -->
    <header class="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16 gap-2">
          <!-- 左侧：Logo + 应用名称 -->
          <NuxtLink to="/" class="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity flex-shrink-0">
            <img
              v-if="appLogo"
              :src="appLogo"
              :alt="appName"
              class="h-8 w-8 rounded-lg object-cover"
            />
            <div
              v-else
              class="h-8 w-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center"
            >
              <Icon name="heroicons:photo" class="w-5 h-5 text-white" />
            </div>
            <span class="text-lg sm:text-xl font-bold text-gray-900 dark:text-white whitespace-nowrap">{{ appName }}</span>
          </NuxtLink>

          <!-- 右侧：导航菜单 - 移动端可横向滚动 -->
          <nav class="flex items-center gap-0.5 sm:gap-2 overflow-x-auto scrollbar-hide">
            <!-- 首页 -->
            <NuxtLink
              to="/"
              class="nav-link nav-link-icon sm:nav-link-text"
              :class="{ 'nav-link-active': route.path === '/' }"
              title="首页"
            >
              <Icon name="heroicons:home" class="w-5 h-5 flex-shrink-0" />
              <span class="hidden sm:inline">首页</span>
            </NuxtLink>

            <!-- API -->
            <NuxtLink
              v-if="authStore.isAuthenticated"
              to="/api"
              class="nav-link nav-link-icon sm:nav-link-text"
              :class="{ 'nav-link-active': route.path === '/api' }"
              title="API"
            >
              <Icon name="heroicons:code-bracket" class="w-5 h-5 flex-shrink-0" />
              <span class="hidden sm:inline">API</span>
            </NuxtLink>

            <!-- 设置 -->
            <NuxtLink
              v-if="authStore.isAuthenticated"
              to="/settings"
              class="nav-link nav-link-icon sm:nav-link-text"
              :class="{ 'nav-link-active': route.path === '/settings' }"
              title="设置"
            >
              <Icon name="heroicons:cog-6-tooth" class="w-5 h-5 flex-shrink-0" />
              <span class="hidden sm:inline">设置</span>
            </NuxtLink>

            <!-- 统计 -->
            <NuxtLink
              v-if="authStore.isAuthenticated"
              to="/stats"
              class="nav-link nav-link-icon sm:nav-link-text"
              :class="{ 'nav-link-active': route.path === '/stats' }"
              title="统计"
            >
              <Icon name="heroicons:chart-bar" class="w-5 h-5 flex-shrink-0" />
              <span class="hidden sm:inline">统计</span>
            </NuxtLink>

            <!-- 通知 -->
            <NuxtLink
              v-if="authStore.isAuthenticated"
              to="/notification"
              class="nav-link nav-link-icon sm:nav-link-text"
              :class="{ 'nav-link-active': route.path === '/notification' }"
              title="通知"
            >
              <Icon name="heroicons:bell" class="w-5 h-5 flex-shrink-0" />
              <span class="hidden sm:inline">通知</span>
            </NuxtLink>

            <!-- 关于 -->
            <NuxtLink
              to="/about"
              class="nav-link nav-link-icon sm:nav-link-text"
              :class="{ 'nav-link-active': route.path === '/about' }"
              title="关于"
            >
              <Icon name="heroicons:information-circle" class="w-5 h-5 flex-shrink-0" />
              <span class="hidden sm:inline">关于</span>
            </NuxtLink>

            <!-- 分隔线 -->
            <div class="w-px h-6 bg-gray-400 dark:bg-gray-600 flex-shrink-0"></div>

            <!-- 登录/登出 -->
            <button
              v-if="authStore.isAuthenticated"
              @click="handleLogout"
              class="nav-link nav-link-icon sm:nav-link-text text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              title="登出"
            >
              <Icon name="heroicons:arrow-right-on-rectangle" class="w-5 h-5 flex-shrink-0" />
              <span class="hidden sm:inline">登出</span>
            </button>
            <NuxtLink
              v-else
              to="/login"
              class="nav-link nav-link-icon sm:nav-link-text"
              :class="{ 'nav-link-active': route.path === '/login' }"
              title="登录"
            >
              <Icon name="heroicons:arrow-left-on-rectangle" class="w-5 h-5 flex-shrink-0" />
              <span class="hidden sm:inline">登录</span>
            </NuxtLink>

            <!-- 暗黑模式切换 -->
            <ThemeToggle class="flex-shrink-0" />
          </nav>
        </div>
      </div>
    </header>

    <!-- 主内容区域 -->
    <main class="flex-1 relative z-10">
      <slot />
    </main>

    <!-- Toast 组件 -->
    <Toast />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useSettingsStore } from '~/stores/settings'
import { useToastStore } from '~/stores/toast'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const settingsStore = useSettingsStore()
const toastStore = useToastStore()

// 应用配置
const appName = computed(() => settingsStore.appSettings.appName || 'EasyImg')
const appLogo = computed(() => settingsStore.appSettings.appLogo || '/favicon.png')
const backgroundUrl = computed(() => settingsStore.appSettings.backgroundUrl || '')
const backgroundBlur = computed(() => settingsStore.appSettings.backgroundBlur || 0)
const bingDailyBackgroundUrl = ref('')
const currentBackgroundUrl = computed(() => {
  if (route.path === '/') {
    return bingDailyBackgroundUrl.value || backgroundUrl.value
  }
  return backgroundUrl.value
})

// 获取 favicon MIME 类型
function getFaviconType(url) {
  if (url.endsWith('.svg')) return 'image/svg+xml'
  if (url.endsWith('.ico')) return 'image/x-icon'
  if (url.endsWith('.png')) return 'image/png'
  if (url.endsWith('.jpg') || url.endsWith('.jpeg')) return 'image/jpeg'
  if (url.endsWith('.gif')) return 'image/gif'
  if (url.endsWith('.webp')) return 'image/webp'
  return 'image/png'
}

// 立即更新 favicon（直接操作 DOM）
function updateFavicon(url) {
  if (typeof document === 'undefined') return

  // 移除所有现有的 favicon link 标签
  const existingLinks = document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]')
  existingLinks.forEach(link => link.remove())

  // 创建新的 favicon link 标签
  const link = document.createElement('link')
  link.rel = 'icon'
  link.type = getFaviconType(url)
  // 添加时间戳避免缓存
  link.href = url + (url.includes('?') ? '&' : '?') + '_t=' + Date.now()
  document.head.appendChild(link)
}

// 监听 appLogo 变化，立即更新 favicon
watch(appLogo, (newLogo) => {
  updateFavicon(newLogo)
}, { immediate: true })


watch(
  () => route.path,
  async (newPath) => {
    if (newPath === '/' && !bingDailyBackgroundUrl.value) {
      await fetchBingDailyBackground()
    }
  }
)

// 动态设置页面标题
useHead({
  title: appName
})


async function fetchBingDailyBackground() {
  try {
    const response = await $fetch('/api/bing/daily')
    if (response.success && response.data?.localUrl) {
      bingDailyBackgroundUrl.value = response.data.localUrl
    }
  } catch (error) {
    console.error('获取 Bing 每日背景失败:', error)
  }
}

// 初始化
onMounted(async () => {
  // 首页优先加载 Bing 每日图片作为背景
  if (route.path === '/') {
    await fetchBingDailyBackground()
  }

  // 先获取公共应用设置（无需登录，包含背景图片等）
  await settingsStore.fetchPublicAppSettings()

  // 验证 Token（authStore.init() 已在插件中调用）
  if (authStore.token) {
    await authStore.verify()
  }

  // 获取完整应用设置（如果已登录）
  if (authStore.isAuthenticated) {
    await settingsStore.fetchAppSettings()
  }
})

// 登出处理
async function handleLogout() {
  authStore.logout()
  toastStore.success('已退出登录')
  router.push('/')
}
</script>

<style scoped>
.nav-link {
  @apply rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-center flex-shrink-0;
}

/* 移动端图标样式 */
.nav-link-icon {
  @apply p-2;
}

/* 桌面端文字样式 */
@screen sm {
  .nav-link-text {
    @apply px-3 py-2;
  }
}

.nav-link-active {
  @apply bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400;
}

/* 隐藏滚动条但保持滚动功能 */
.scrollbar-hide {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;  /* Chrome, Safari and Opera */
}
</style>