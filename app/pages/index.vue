<template>
  <div class="home-page max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <section class="hero-panel mb-8">
      <div class="hero-grid-overlay"></div>
      <div class="hero-content">
        <p class="hero-tag">EASYIMG // IMAGE TERMINAL</p>
        <h1 class="hero-title">上传、管理、分发图片的极客工作台</h1>
        <p class="hero-subtitle">
          支持批量上传、右键快捷操作与格式化链接复制，保留你熟悉的流程，只升级视觉体验。
        </p>
        <div class="hero-stats">
          <div class="hero-stat-item">
            <span class="hero-stat-label">图库</span>
            <strong class="hero-stat-value">{{ imagesStore.images.length }}</strong>
          </div>
          <div class="hero-stat-item">
            <span class="hero-stat-label">状态</span>
            <strong class="hero-stat-value">{{ authStore.isAuthenticated ? 'Admin Online' : 'Guest Mode' }}</strong>
          </div>
        </div>
      </div>
      <div class="hero-glow"></div>
    </section>

    <!-- 公告组件 - 顶部横幅形式显示在上传区域上方 -->
    <Announcement />

    <!-- 上传区域 -->
    <section class="mb-8">
      <UploadArea />
    </section>

    <!-- 批量操作栏 -->
    <div
      v-if="authStore.isAuthenticated && imagesStore.hasSelection"
      class="sticky top-20 z-30 mb-4 p-4 card batch-toolbar flex items-center justify-between"
    >
      <div class="flex items-center gap-4">
        <button
          @click="imagesStore.toggleSelectAll"
          class="btn-secondary text-sm"
        >
          {{ imagesStore.isAllSelected ? '取消全选' : '全选' }}
        </button>
        <span class="text-sm text-gray-600 dark:text-gray-400">
          已选择 {{ imagesStore.selectedIds.length }} 张图片
        </span>
      </div>
      <div class="flex items-center gap-2">
        <button
          @click="imagesStore.clearSelection"
          class="btn-secondary text-sm"
        >
          取消选择
        </button>
        <button
          @click="showBatchDeleteModal = true"
          class="btn-danger text-sm"
        >
          批量删除
        </button>
      </div>
    </div>

    <!-- 图片列表 -->
    <section>
      <!-- 加载状态 -->
      <div v-if="imagesStore.loading && imagesStore.images.length === 0" class="flex justify-center py-12">
        <Loading size="lg" />
      </div>

      <!-- 空状态 -->
      <div
        v-else-if="imagesStore.images.length === 0"
        class="text-center py-16"
      >
        <Icon name="heroicons:photo" class="w-24 h-24 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">暂无图片</h3>
        <p class="text-gray-500 dark:text-gray-400">上传你的第一张图片吧</p>
      </div>

      <!-- 瀑布流图片列表 - 使用多列 Flexbox 布局避免加载新图片时位置变化 -->
      <div v-else class="masonry-container">
        <div
          v-for="(column, columnIndex) in imageColumns"
          :key="columnIndex"
          class="masonry-column"
        >
          <div
            v-for="(image, imageIndex) in column"
            :key="image.id"
            class="masonry-item"
          >
            <ImageCard
              :image="image"
              :selected="imagesStore.selectedIds.includes(image.id)"
              :selectable="authStore.isAuthenticated"
              @click="openViewer(image)"
              @select="imagesStore.toggleSelect(image.id)"
              @delete="confirmDelete(image)"
              @contextmenu="handleImageContextMenu"
            />
          </div>
        </div>
      </div>

      <!-- 加载更多 - 只在已有图片且有更多数据时显示，避免与初始加载 loading 重复 -->
      <div
        v-if="imagesStore.hasMore && imagesStore.images.length > 0"
        ref="loadMoreTrigger"
        class="flex justify-center py-8"
      >
        <Loading v-if="imagesStore.loading" />
        <button
          v-else
          @click="imagesStore.loadMore"
          class="btn-secondary"
        >
          加载更多
        </button>
      </div>
    </section>

    <!-- 图片查看器 -->
    <ImageViewer
      :visible="viewerVisible"
      :src="viewerImage?.url || ''"
      :alt="viewerImage?.filename || ''"
      :info="viewerImageInfo"
      @close="closeViewer"
    />

    <!-- 删除确认弹窗 -->
    <Modal
      :visible="showDeleteModal"
      title="确认删除"
      confirm-text="删除"
      confirm-type="danger"
      @close="showDeleteModal = false"
      @confirm="handleDelete"
    >
      <p class="text-gray-600 dark:text-gray-400">
        确定要删除这张图片吗？删除后可在设置页面进行硬删除。
      </p>
    </Modal>

    <!-- 批量删除确认弹窗 -->
    <Modal
      :visible="showBatchDeleteModal"
      title="确认批量删除"
      confirm-text="删除"
      confirm-type="danger"
      @close="showBatchDeleteModal = false"
      @confirm="handleBatchDelete"
    >
      <p class="text-gray-600 dark:text-gray-400">
        确定要删除选中的 {{ imagesStore.selectedIds.length }} 张图片吗？
      </p>
    </Modal>

    <!-- 图片右键菜单 -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="contextMenuVisible"
          ref="contextMenuRef"
          class="fixed z-50 min-w-[160px] bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          :style="{ left: contextMenuX + 'px', top: contextMenuY + 'px' }"
        >
          <!-- 复制链接子菜单 -->
          <div class="py-1">
            <div class="px-3 py-1.5 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase">
              {{ copyMenuTitle }}
            </div>
            <button
              v-for="item in copyOptions"
              :key="item.type"
              @click="handleCopyFromMenu(item.type)"
              class="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <Icon name="heroicons:clipboard-document" class="w-4 h-4 text-gray-400" />
              {{ item.label }}
            </button>
          </div>

          <!-- 分隔线 -->
          <div v-if="authStore.isAuthenticated" class="border-t border-gray-200 dark:border-gray-700"></div>

          <!-- 设置为背景图/Logo（仅登录用户可见） -->
          <div v-if="authStore.isAuthenticated" class="py-1">
            <button
              @click="handleSetAsBackgroundFromMenu"
              class="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <Icon name="heroicons:photo" class="w-4 h-4 text-gray-400" />
              设为全局背景
            </button>
            <button
              @click="handleSetAsLogoFromMenu"
              class="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <Icon name="heroicons:sparkles" class="w-4 h-4 text-gray-400" />
              设为网站Logo
            </button>
          </div>

          <!-- 分隔线 -->
          <div v-if="authStore.isAuthenticated" class="border-t border-gray-200 dark:border-gray-700"></div>

          <!-- 删除选项（仅登录用户可见） -->
          <div v-if="authStore.isAuthenticated" class="py-1">
            <button
              @click="handleDeleteFromMenu"
              class="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
            >
              <Icon name="heroicons:trash" class="w-4 h-4" />
              删除图片
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- 返回顶部按钮 -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-4 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-4 scale-95"
    >
      <button
        v-show="showBackToTop"
        @click="scrollToTop"
        class="fixed bottom-6 right-6 z-50 w-12 h-12 flex items-center justify-center bg-primary-500 hover:bg-primary-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
        aria-label="返回顶部"
        title="返回顶部"
      >
        <Icon name="heroicons:arrow-up" class="w-6 h-6 flex-shrink-0" />
      </button>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'

definePageMeta({
  title: 'XJJ图床'
})
import { useAuthStore } from '~/stores/auth'
import { useImagesStore } from '~/stores/images'
import { useSettingsStore } from '~/stores/settings'
import { useToastStore } from '~/stores/toast'
import { copyToClipboard } from '../utils/clipboard'

const authStore = useAuthStore()
const imagesStore = useImagesStore()
const settingsStore = useSettingsStore()
const toastStore = useToastStore()

// 响应式列数
const columnCount = ref(2)

// 更新列数
function updateColumnCount() {
  const width = window.innerWidth
  if (width >= 1280) {
    columnCount.value = 5
  } else if (width >= 1024) {
    columnCount.value = 4
  } else if (width >= 640) {
    columnCount.value = 3
  } else {
    columnCount.value = 2
  }
}

// 将图片分配到各列（按顺序轮流分配，保持稳定性）
const imageColumns = computed(() => {
  const columns = Array.from({ length: columnCount.value }, () => [])

  imagesStore.images.forEach((image, index) => {
    // 按顺序轮流分配到各列，这样新图片只会追加到列末尾
    const columnIndex = index % columnCount.value
    columns[columnIndex].push(image)
  })

  return columns
})

// 图片查看器
const viewerVisible = ref(false)
const viewerImage = ref(null)

const viewerImageInfo = computed(() => {
  if (!viewerImage.value) return ''
  const { filename, width, height, size } = viewerImage.value
  return `${filename} · ${width}×${height} · ${formatFileSize(size)}`
})

// 删除相关
const showDeleteModal = ref(false)
const showBatchDeleteModal = ref(false)
const imageToDelete = ref(null)

// 返回顶部
const showBackToTop = ref(false)
const scrollThreshold = 300 // 滚动超过300px显示按钮

// 右键菜单相关
const contextMenuVisible = ref(false)
const contextMenuX = ref(0)
const contextMenuY = ref(0)
const contextMenuRef = ref(null)
const contextMenuImage = ref(null)

const copyOptions = [
  { type: 'direct', label: '直链' },
  { type: 'html', label: 'HTML' },
  { type: 'markdown', label: 'Markdown' },
  { type: 'bbcode', label: 'BBCode' }
]

// 计算复制链接的标题
const copyMenuTitle = computed(() => {
  if (imagesStore.selectedIds.length > 1) {
    return `复制链接(已选${imagesStore.selectedIds.length}张)`
  }
  return '复制链接'
})

// 处理滚动事件
function handleScroll() {
  showBackToTop.value = window.scrollY > scrollThreshold
  // 滚动时关闭右键菜单
  hideContextMenu()
}

// 滚动到顶部
function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

// 加载更多触发器
const loadMoreTrigger = ref(null)
let observer = null

// 格式化文件大小
function formatFileSize(bytes) {
  if (!bytes) return '0 B'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

// 打开图片查看器
function openViewer(image) {
  viewerImage.value = image
  viewerVisible.value = true
}

// 关闭图片查看器
function closeViewer() {
  viewerVisible.value = false
  viewerImage.value = null
}

// 确认删除
function confirmDelete(image) {
  imageToDelete.value = image
  showDeleteModal.value = true
}

// 执行删除
async function handleDelete() {
  if (!imageToDelete.value) return

  const result = await imagesStore.deleteImage(imageToDelete.value.id)
  if (result.success) {
    toastStore.success('删除成功')
  } else {
    toastStore.error(result.message)
  }

  showDeleteModal.value = false
  imageToDelete.value = null
}

// 执行批量删除
async function handleBatchDelete() {
  const result = await imagesStore.batchDelete()
  if (result.success) {
    toastStore.success(result.message)
  } else {
    toastStore.error(result.message)
  }

  showBatchDeleteModal.value = false
}

// 显示右键菜单
function handleImageContextMenu(event, image) {
  // 计算菜单位置，确保不超出视口
  const menuWidth = 160
  const menuHeight = authStore.isAuthenticated ? 280 : 200

  let x = event.clientX
  let y = event.clientY

  // 检查右边界
  if (x + menuWidth > window.innerWidth) {
    x = window.innerWidth - menuWidth - 10
  }

  // 检查下边界
  if (y + menuHeight > window.innerHeight) {
    y = window.innerHeight - menuHeight - 10
  }

  contextMenuX.value = x
  contextMenuY.value = y
  contextMenuImage.value = image
  contextMenuVisible.value = true
}

// 隐藏右键菜单
function hideContextMenu() {
  contextMenuVisible.value = false
}

// 点击外部关闭菜单
function handleClickOutside(event) {
  if (contextMenuRef.value && !contextMenuRef.value.contains(event.target)) {
    hideContextMenu()
  }
}

// 从菜单复制链接
function handleCopyFromMenu(type) {
  // 如果有多选，复制所有选中图片的链接
  if (imagesStore.selectedIds.length > 1) {
    const urls = imagesStore.images
      .filter(img => imagesStore.selectedIds.includes(img.id))
      .map(img => window.location.origin + img.url)
    handleCopyMultiple(type, urls)
  } else if (contextMenuImage.value) {
    const fullUrl = window.location.origin + contextMenuImage.value.url
    handleCopy(type, fullUrl)
  }
  hideContextMenu()
}

// 从菜单设置背景
function handleSetAsBackgroundFromMenu() {
  if (contextMenuImage.value) {
    const fullUrl = window.location.origin + contextMenuImage.value.url
    handleSetAsBackground(fullUrl)
  }
  hideContextMenu()
}

// 从菜单设置Logo
function handleSetAsLogoFromMenu() {
  if (contextMenuImage.value) {
    const fullUrl = window.location.origin + contextMenuImage.value.url
    handleSetAsLogo(fullUrl)
  }
  hideContextMenu()
}

// 从菜单删除
function handleDeleteFromMenu() {
  if (contextMenuImage.value) {
    confirmDelete(contextMenuImage.value)
  }
  hideContextMenu()
}

// 复制链接
function handleCopy(type, url) {
  let text = ''
  switch (type) {
    case 'direct':
      text = url
      break
    case 'html':
      text = `<img src="${url}" alt="image" />`
      break
    case 'markdown':
      text = `![image](${url})`
      break
    case 'bbcode':
      text = `[img]${url}[/img]`
      break
  }

  copyToClipboard(text).then(() => {
    toastStore.success('已复制到剪贴板')
  }).catch(() => {
    toastStore.error('复制失败')
  })
}

// 复制多张图片链接
function handleCopyMultiple(type, urls) {
  let texts = []
  switch (type) {
    case 'direct':
      texts = urls
      break
    case 'html':
      texts = urls.map(url => `<img src="${url}" alt="image" />`)
      break
    case 'markdown':
      texts = urls.map(url => `![image](${url})`)
      break
    case 'bbcode':
      texts = urls.map(url => `[img]${url}[/img]`)
      break
  }

  const text = texts.join('\n')
  copyToClipboard(text).then(() => {
    toastStore.success(`已复制 ${urls.length} 张图片链接到剪贴板`)
  }).catch(() => {
    toastStore.error('复制失败')
  })
}

// 设置为全局背景图
async function handleSetAsBackground(url) {
  const result = await settingsStore.updateAppSetting({ backgroundUrl: url })

  if (result.success) {
    toastStore.success('已设置为全局背景')
  } else {
    toastStore.error(result.message || '设置失败')
  }
}

// 设置为网站 Logo
async function handleSetAsLogo(url) {
  const result = await settingsStore.updateAppSetting({ appLogo: url })

  if (result.success) {
    toastStore.success('已设置为网站 Logo')
  } else {
    toastStore.error(result.message || '设置失败')
  }
}

// 设置 Intersection Observer 实现无限滚动
function setupIntersectionObserver() {
  if (observer) {
    observer.disconnect()
  }

  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && imagesStore.hasMore && !imagesStore.loading) {
        imagesStore.loadMore()
      }
    },
    { threshold: 0.1 }
  )

  if (loadMoreTrigger.value) {
    observer.observe(loadMoreTrigger.value)
  }
}

// 监听图片列表变化
watch(
  () => imagesStore.images.length,
  () => {
    nextTick(() => {
      setupIntersectionObserver()
    })
  }
)

// 监听认证状态变化，重新获取图片
watch(
  () => authStore.isAuthenticated,
  () => {
    imagesStore.fetchImages(true)
  }
)

onMounted(async () => {
  // 初始化列数
  updateColumnCount()
  window.addEventListener('resize', updateColumnCount)

  // 监听滚动事件
  window.addEventListener('scroll', handleScroll, { passive: true })

  // 监听点击事件关闭右键菜单
  document.addEventListener('click', handleClickOutside)

  // 获取图片列表（authStore.init() 已在插件中调用）
  await imagesStore.fetchImages(true)

  // 设置无限滚动
  setupIntersectionObserver()
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
  window.removeEventListener('resize', updateColumnCount)
  window.removeEventListener('scroll', handleScroll)
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.home-page {
  position: relative;
}

.hero-panel {
  position: relative;
  overflow: hidden;
  border-radius: 18px;
  border: 1px solid rgba(14, 165, 233, 0.28);
  background: radial-gradient(circle at 15% 20%, rgba(14, 165, 233, 0.24), transparent 40%),
              radial-gradient(circle at 85% 10%, rgba(168, 85, 247, 0.2), transparent 38%),
              linear-gradient(135deg, rgba(15, 23, 42, 0.96), rgba(17, 24, 39, 0.98));
  box-shadow: 0 24px 45px -30px rgba(14, 165, 233, 0.55);
}

.hero-grid-overlay {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(rgba(148, 163, 184, 0.16) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(148, 163, 184, 0.12) 1px, transparent 1px);
  background-size: 20px 20px;
  mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.25));
  pointer-events: none;
}

.hero-content {
  position: relative;
  z-index: 1;
  padding: 1.5rem;
}

.hero-tag {
  display: inline-block;
  margin-bottom: 0.75rem;
  color: #7dd3fc;
  font-size: 0.75rem;
  letter-spacing: 0.18em;
}

.hero-title {
  margin: 0;
  font-size: clamp(1.35rem, 3vw, 2rem);
  font-weight: 700;
  color: #f8fafc;
}

.hero-subtitle {
  margin: 0.75rem 0 1rem;
  max-width: 60ch;
  color: #cbd5e1;
  font-size: 0.95rem;
}

.hero-stats {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.hero-stat-item {
  min-width: 132px;
  padding: 0.6rem 0.85rem;
  border-radius: 12px;
  border: 1px solid rgba(125, 211, 252, 0.32);
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(2px);
}

.hero-stat-label {
  display: block;
  color: #94a3b8;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.hero-stat-value {
  color: #e2e8f0;
  font-size: 0.95rem;
}

.hero-glow {
  position: absolute;
  right: -56px;
  bottom: -70px;
  width: 220px;
  height: 220px;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(56, 189, 248, 0.24), rgba(56, 189, 248, 0));
  pointer-events: none;
}

.batch-toolbar {
  border: 1px solid rgba(148, 163, 184, 0.24);
  background: rgba(15, 23, 42, 0.72);
  backdrop-filter: blur(6px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.masonry-container {
  display: flex;
  gap: 16px;
}

.masonry-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.masonry-item {
  break-inside: avoid;
}

@media (max-width: 640px) {
  .hero-content {
    padding: 1.1rem;
  }
}
</style>
