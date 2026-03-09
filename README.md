# EasyImg

_✨ 简单易用的个人图床系统，基于 Nuxt.js 构建 ✨_

<a href="https://github.com/chaos-zhu/easyimg/releases/latest">
  <img src="https://img.shields.io/github/v/release/chaos-zhu/easyimg?color=brightgreen" alt="release">
</a>

<a href="https://github.com/chaos-zhu/easyimg">
  <img src="https://img.shields.io/badge/Apache-License2.0-green" alt="License">
</a>

<a href="https://github.com/chaos-zhu/easyimg">
  <img src="https://img.shields.io/badge/EasyImg-图床-blue" alt="easyimg">
</a>



[功能特性](#功能特性) • [快速开始](#快速开始) • [配置说明](#配置说明) • [API 文档](#api-文档) • [常见问题](#常见问题)

</div>

## 项目预览

<details>
<summary>点击展开查看项目截图</summary>

![项目预览1](md-images/img1.jpg)

![项目预览2](md-images/img2.jpg)

![项目预览3](md-images/img3.jpg)

![项目预览4](md-images/img4.jpg)

![项目预览5](md-images/img5.jpg)

![项目预览6](md-images/img6.jpg)

![项目预览7](md-images/img7.jpg)

![项目预览8](md-images/img8.jpg)

</details>

## 功能特性

### 🖼️ 图片管理
- **多种上传方式**：支持点击、拖拽、粘贴上传，支持多图批量上传
- **URL 上传**：支持从 URL 直接下载图片到本地图库
- **瀑布流展示**：响应式瀑布流布局，自适应不同屏幕尺寸
- **图片预览**：支持大图预览，显示图片详细信息
- **批量操作**：支持批量选择、批量删除图片
- **回收站**：软删除机制，支持清空回收站释放空间

### 🔐 权限控制
- **公共/私有上传**：支持访客上传和登录后私有上传两种模式
- **API Key 管理**：支持创建多个 API Key，方便第三方工具调用
- **IP 黑名单**：支持手动或自动拉黑恶意 IP

### 🛡️ 内容安全
- **NSFW 检测**：支持多种鉴黄服务（nsfwdet.com、elysiatools.com、自建 nsfw_detector）
- **自动处理**：违规图片自动软删除，可选自动拉黑上传者 IP
- **违规管理**：支持查看违规图片列表，可手动取消违规标记

### 📊 数据统计
- **存储统计**：实时统计活跃图片数、存储空间占用
- **分类统计**：区分公共上传和私有上传数量
- **内容安全统计**：检测图片总数、违规图片数、违规率

### 🔔 通知推送
- **多种通知方式**：支持 Webhook、Telegram、Email、Server酱
- **事件通知**：登录通知、图片上传通知、鉴黄检测结果通知
- **自定义模板**：Webhook 支持自定义请求体模板

### ⚙️ 系统设置
- **应用配置**：自定义应用名称、Logo、全局背景图片
- **公告系统**：支持弹窗和横幅两种公告展示形式
- **上传配置**：可配置允许的格式、文件大小限制、WebP 压缩等
- **频率限制**：支持配置同一 IP 的请求频率限制

### 🎨 界面特性
- **深色模式**：支持亮色/深色主题切换
- **响应式设计**：完美适配桌面端和移动端
- **毛玻璃效果**：支持背景图片毛玻璃模糊效果

## 快速开始

### Docker Compose 部署（推荐）

```bash
# 1. 创建 easyimg 目录
mkdir -p /root/easyimg && cd /root/easyimg


# 2. 下载docker-compose.yml文件
wget https://git.221022.xyz/https://raw.githubusercontent.com/chaos-zhu/easyimg/refs/heads/main/docker-compose.yml

# 使用 docker-compose
docker compose up -d
```

### Docker run部署

```bash
docker run -d --name easyimg -p 3000:3000 -v ./db:/app/db -v ./uploads:/app/uploads ghcr.io/chaos-zhu/easyimg:latest
```


### 手动部署

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建生产版本
pnpm build

# 启动生产服务
node .output/server/index.mjs
```

### 默认账户

首次启动后，使用以下默认账户登录：

- **用户名**：`easyimg`
- **密码**：`easyimg`

> ⚠️ 请登录后立即修改默认用户名密码！

<!-- ## 配置说明

### 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `PORT` | 服务端口 | `3000` |
| `HOST` | 监听地址 | `0.0.0.0` |
| `NODE_ENV` | 运行环境 | `production` | -->

### 数据持久化

- `db/` - 数据库文件（NeDB）
- `uploads/` - 上传的图片文件

使用 Docker 部署时，请确保挂载数据目录：

```yaml
volumes:
  - ./data:/app/data
  - ./uploads:/app/uploads
```

## 常见问题

### Q: 如何重置管理员密码？

删除 `db/admin.db` 文件后重启服务，系统会重新创建默认账户。

### Q: 如何备份数据？

备份 `db和uploads` 目录即可，包含所有数据库文件和上传的图片。

### Q: 支持哪些图片格式？

默认支持：JPEG、JPG、PNG、GIF、WebP、AVIF、SVG、BMP、ICO、APNG、TIFF

## 作者其他项目

- [EasyNode](https://github.com/chaos-zhu/easynode) - 多功能 Linux & Windows 服务器 WEB 终端面板
- [EasyNavTab](https://github.com/chaos-zhu/easynavtab) - 开源浏览器插件，自定义新标签页

## 交流反馈

- **Telegram 频道**：[https://t.me/easynode_notify](https://t.me/easynode_notify)
- **GitHub Issues**：[提交问题](https://github.com/chaos-zhu/easyimg/issues)

## 开源协议

[Apache-License2.0](LICENSE)

