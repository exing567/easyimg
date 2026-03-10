<template>
  <div class="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-md">
      <!-- 登录卡片 -->
      <div class="card p-6">
        <!-- 标题 -->
        <div class="text-center mb-4">
          <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
            <Icon name="heroicons:photo" class="w-8 h-8 text-white" />
          </div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">管理员登录</h1>
          <div class="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
            <p>欢迎NECT家人回家！</p>
          </div>
        </div>

        <!-- 登录表单 -->
        <form @submit.prevent="handleLogin" class="space-y-6">
          <!-- 用户名 -->
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              用户名
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon name="heroicons:user" class="w-5 h-5 text-gray-400" />
              </div>
              <input
                id="username"
                v-model="form.username"
                type="text"
                required
                autocomplete="username"
                class="input !pl-10"
                placeholder="请输入用户名"
                :disabled="loading"
              />
            </div>
          </div>

          <!-- 密码 -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              密码
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon name="heroicons:lock-closed" class="w-5 h-5 text-gray-400" />
              </div>
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                required
                autocomplete="current-password"
                class="input !pl-10 !pr-10"
                placeholder="请输入密码"
                :disabled="loading"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <Icon
                  v-if="showPassword"
                  name="heroicons:eye-slash"
                  class="w-5 h-5 text-gray-400 hover:text-gray-600"
                />
                <Icon
                  v-else
                  name="heroicons:eye"
                  class="w-5 h-5 text-gray-400 hover:text-gray-600"
                />
              </button>
            </div>
          </div>

          <!-- 登录按钮 -->
          <button
            type="submit"
            class="w-full btn-primary py-3 flex items-center justify-center gap-2"
            :disabled="loading"
          >
            <Loading v-if="loading" size="sm" class="text-white" />
            <span>{{ loading ? '登录中...' : '登录' }}</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useToastStore } from '~/stores/toast'

const router = useRouter()
const authStore = useAuthStore()
const toastStore = useToastStore()

// 表单数据
const form = ref({
  username: '',
  password: ''
})

// 状态
const loading = ref(false)
const showPassword = ref(false)

// 如果已登录，重定向到首页
onMounted(() => {
  if (authStore.isAuthenticated) {
    router.push('/')
  }
})

// 登录处理
async function handleLogin() {
  if (!form.value.username || !form.value.password) {
    toastStore.error('请输入用户名和密码')
    return
  }

  loading.value = true

  try {
    const result = await authStore.login(form.value.username, form.value.password)

    if (result.success) {
      toastStore.success('登录成功')
      router.push('/')
    } else {
      toastStore.error(result.message || '用户名或密码错误')
    }
  } catch (err) {
    toastStore.error('登录失败，请稍后重试')
  } finally {
    loading.value = false
  }
}
</script>