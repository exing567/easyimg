<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-8">关于</h1>

    <div class="space-y-6">
      <!-- 项目信息 -->
      <div class="card p-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Icon name="heroicons:link" class="w-5 h-5 text-primary-500" />
          项目信息
        </h2>
        <div class="space-y-4">
          <div class="flex items-start gap-3">
            <Icon name="simple-icons:github" class="w-5 h-5 text-gray-800 dark:text-gray-200 mt-0.5" />
            <div class="space-y-1">
              <p class="text-gray-700 dark:text-gray-300 text-sm">
                本网站基于原仓库修改而来，下面同时保留本仓库与原仓库地址：
              </p>
              <div class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <Icon name="heroicons:lock-closed" class="w-4 h-4 text-amber-500" />
                <span>此图床专为 NECT 使用。</span>
              </div>

              <div class="flex flex-wrap items-center gap-2 text-sm">
                <span class="text-gray-700 dark:text-gray-300">本仓库:</span>
                <a
                  href="https://github.com/xjj-sh/easyimg"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-primary-600 dark:text-primary-400 hover:underline break-all"
                >
                  https://github.com/xjj-sh/easyimg
                </a>
              </div>
              <div class="flex flex-wrap items-center gap-2 text-sm">
                <span class="text-gray-700 dark:text-gray-300">原仓库:</span>
                <a
                  href="https://github.com/chaos-zhu/easyimg"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-primary-600 dark:text-primary-400 hover:underline break-all"
                >
                  https://github.com/chaos-zhu/easyimg
                </a>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <Icon name="heroicons:envelope" class="w-5 h-5 text-primary-500" />
            <span class="text-gray-700 dark:text-gray-300">Abuse 联系:</span>
            <a
              href="mailto:hello@xjj.sh"
              class="text-primary-600 dark:text-primary-400 hover:underline"
            >
              hello@xjj.sh
            </a>
          </div>
        </div>
      </div>

      <!-- 我的其他网站 -->
      <div class="card p-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Icon name="heroicons:globe-alt" class="w-5 h-5 text-primary-500" />
          我的其他网站
        </h2>
        <div class="space-y-4">
          <div class="border-l-4 border-primary-500 pl-4">
            <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-1">我的博客</h3>
            <a
              href="https://blog.xjj.sh"
              target="_blank"
              rel="noopener noreferrer"
              class="text-primary-600 dark:text-primary-400 hover:underline text-sm break-all"
            >
              https://blog.xjj.sh
            </a>
          </div>

          <div class="border-l-4 border-fuchsia-500 pl-4">
            <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-1">我的特殊页</h3>
            <a
              href="https://thenameofthiswebsiteisareallylongdomainnamethatyoucanregisteron.com"
              target="_blank"
              rel="noopener noreferrer"
              class="text-primary-600 dark:text-primary-400 hover:underline text-sm break-all"
            >
              https://thenameofthiswebsiteisareallylongdomainnamethatyoucanregisteron.com
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  title: '关于'
})
</script>
