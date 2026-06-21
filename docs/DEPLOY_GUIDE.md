# 杏林题库 — 部署指南

> 适用于：前端 SPA (Vue 3 + Vite) 静态站点部署

---

## 一、本地构建

在你的电脑（非沙箱）上进入项目目录：

```bash
cd C:\Users\灰\Documents\个人网站\tcm-exam
pnpm install
pnpm run build
```

构建产物在 `dist/` 目录中：
```
dist/
├── index.html
├── favicon.svg
└── assets/
    ├── index-xxx.js          # 主 JS bundle
    ├── Dashboard-xxx.js      # 各页面按需加载
    ├── index-xxx.css         # 样式
    └── ...
```

---

## 二、部署方案

### 方案 A：Vercel（推荐，最快，免费）

**适合：无服务器经验，想快速上线**

1. 在电脑上安装 Node.js（参考下方说明）
2. 安装 Vercel CLI：

```bash
npm install -g vercel
# 或
pnpm add -g vercel
```

3. 在项目根目录执行：

```bash
cd C:\Users\灰\Documents\个人网站\tcm-exam
vercel --prod
```

4. 按提示登录（GitHub/GitLab/Email），选择默认配置
5. 几分钟后获得公网地址：`https://tcm-exam.vercel.app`

**Vercel 自动配置：**
- SSL/HTTPS 自动开启
- CDN 全球加速
- 每次 Git Push 自动重新部署
- 自定义域名（可选）

**或者不用命令行：**
直接把 `dist/` 文件夹拖到 [vercel.com](https://vercel.com) 网页控制台，导入即可。

---

### 方案 B：Nginx 自托管（适合自己拥有服务器）

**适合：有 Linux 服务器（阿里云/腾讯云/华为云等）**

#### 步骤 1：服务器准备

```bash
# Ubuntu/Debian
ssh root@你的服务器IP
apt update && apt install nginx -y

# 确保 Nginx 运行
systemctl status nginx
```

#### 步骤 2：上传文件

在你的电脑上：

```bash
# 确保先构建
cd C:\Users\灰\Documents\个人网站\tcm-exam
pnpm run build

# 用 scp 上传到服务器
scp -r dist/* root@你的服务器IP:/var/www/tcm-exam/
```

#### 步骤 3：配置 Nginx

```nginx
# /etc/nginx/sites-available/tcm-exam
server {
    listen 80;
    server_name tcm.你的域名.com;  # 换成你的域名

    root /var/www/tcm-exam;
    index index.html;

    # SPA 路由重写（关键！）
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip 压缩
    gzip on;
    gzip_types text/css application/javascript text/html;
}

# 启用站点
ln -s /etc/nginx/sites-available/tcm-exam /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

#### 步骤 4：配置 HTTPS（推荐使用 acme.sh / Certbot）

```bash
# 安装 Certbot
apt install certbot python3-certbot-nginx -y
certbot --nginx -d tcm.你的域名.com
```

#### 步骤 5：后续更新

```bash
# 本地构建
cd C:\Users\灰\Documents\个人网站\tcm-exam
pnpm run build

# 上传到服务器
scp -r dist/* root@你的服务器IP:/var/www/tcm-exam/
```

---

### 方案 C：Docker 部署

**适合：已有 Docker 环境的服务器**

#### 项目根目录创建 Dockerfile

```dockerfile
# 第一阶段：构建
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install
COPY . .
RUN pnpm run build

# 第二阶段：运行 (Nginx 托管静态文件)
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### 创建 nginx.conf

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### 构建和运行

```bash
# 在项目目录
docker build -t tcm-exam .
docker run -d -p 80:80 --name tcm-exam tcm-exam

# 查看运行状态
docker ps
docker logs tcm-exam
```

---

### 方案 D：使用 Windows 电脑做服务器

**适合：手边没有 Linux 服务器，想用自己的 Windows 电脑直接发布**

当前预览用的 `serve.cjs` 就是现成的静态服务器。在 Windows 上：

```bash
# 确保已构建
pnpm run build

# 运行内置静态服务器
node serve.cjs
```

然后局域网内其他设备可通过 `http://你的局域网IP:5173/` 访问。

如果需要让外网访问，可以用内网穿透：
- **Ngrok**：`ngrok http 5173`
- **Tailscale Funnel**：`tailscale funnel 5173`
- **Cloudflare Tunnel**：`cloudflared tunnel --url http://localhost:5173`

---

## 三、服务器选购参考

如果还没有服务器，推荐以下入门配置：

| 云厂商 | 最低配置 | 价格 | 用途 |
|--------|---------|------|------|
| 阿里云 ECS | 2核2G | ~68元/月 | 部署 Nginx + 后续后端 |
| 腾讯云轻量 | 2核2G | ~50元/月 | 性价比高 |
| 华为云 HECS | 2核2G | ~52元/月 | 稳定 |
| Vercel（免费） | — | 免费 | 前端托管，无需服务器 |

**推荐首选：Vercel（免费零配置），等需要后端时再买服务器。**

---

## 四、部署后端（未来规划）

当前项目只有前端，后续加入 NestJS 后端后，部署架构变为：

```
用户 ──▶ Nginx ──▶ /api/* ──▶ NestJS ──▶ PostgreSQL
              │                  │
              └──▶ 静态文件       └──▶ Redis
                   (dist/)
```

Docker Compose 用于编排所有服务：

```yaml
version: "3.8"
services:
  app:
    build: .
    ports: ["80:80"]
    depends_on: [api]
  api:
    build: ./apps/api
    ports: ["3000:3000"]
    env_file: .env
  db:
    image: postgres:16
    volumes: [pgdata:/var/lib/postgresql/data]
  redis:
    image: redis:7-alpine
volumes:
  pgdata:
```

---

## 五、快速启动推荐

**如果你现在就想上线，最简操作：**

1. 去 [vercel.com](https://vercel.com) 注册账号
2. 点击 "Add New → Project"
3. 选择 "Vercel CLI" 或直接拖拽项目文件夹
4. Vercel 自动识别 Vite 项目 → 自动构建 → 上线

全程不需要服务器、不需要配置域名、不需要操心 HTTPS。5 分钟搞定。

如果需要后续后端服务，再买一台服务器做 API。