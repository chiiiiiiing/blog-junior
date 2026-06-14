# chiiiiiiing's blog junior — 全栈个人博客系统

一个前后端分离的现代个人博客系统，采用极简高留白的设计风格（类 Medium/Notion），完美支持 Markdown、代码高亮和 LaTeX 数学公式渲染。

---

## 1. 项目架构与目录结构

```
blog-XLab/
├── backend/                     # 后端服务 (Express + Prisma)
│   ├── package.json
│   ├── tsconfig.json
│   ├── prisma/
│   │   ├── schema.prisma        # 数据模型定义 (User/Post/Comment/Like)
│   │   ├── seed.ts              # 种子数据脚本
│   │   ├── dev.db               # SQLite 数据库文件（自动生成）
│   │   └── migrations/          # 数据库迁移记录
│   └── src/
│       ├── index.ts             # Express 服务入口，路由挂载
│       ├── routes/
│       │   ├── auth.ts          # 用户认证 (注册/登录/获取当前用户)
│       │   ├── posts.ts         # 博客文章 CRUD + 分页列表
│       │   ├── comments.ts      # 评论发表与删除
│       │   └── likes.ts         # 点赞/取消点赞切换
│       ├── middleware/
│       │   └── auth.ts          # JWT 认证与角色鉴权中间件
│       └── utils/
│           └── jwt.ts           # JWT Token 签发与校验
│
├── frontend/                    # 前端应用 (Vite + React + Tailwind)
│   ├── package.json
│   ├── vite.config.ts           # Vite 配置（含 API 代理）
│   ├── index.html               # HTML 入口
│   └── src/
│       ├── main.tsx             # React 入口
│       ├── App.tsx              # 路由配置（BrowserRouter）
│       ├── index.css            # 全局样式 + Tailwind + KaTeX
│       ├── api/
│       │   └── axios.ts         # Axios 实例 + 拦截器
│       ├── contexts/
│       │   └── AuthContext.tsx   # 全局认证状态管理
│       ├── types/
│       │   └── index.ts         # TypeScript 类型定义
│       ├── pages/
│       │   ├── Home.tsx         # 首页 — 文章列表 + 分页
│       │   ├── PostDetail.tsx   # 文章详情 — Markdown 渲染 + 评论
│       │   ├── Login.tsx        # 登录页
│       │   ├── Register.tsx     # 注册页
│       │   ├── AdminDashboard.tsx # 管理后台 — 文章管理列表
│       │   └── AdminEditPost.tsx  # 文章编辑器 — 双栏实时预览
│       └── components/
│           ├── Navbar.tsx           # 导航栏（认证状态感知）
│           ├── PostCard.tsx         # 文章卡片
│           ├── MarkdownRenderer.tsx # Markdown/LaTeX/代码渲染
│           ├── LikeButton.tsx       # 点赞按钮（Optimistic UI）
│           ├── CommentSection.tsx   # 评论区组件
│           └── Pagination.tsx       # 分页导航
│
└── README.md                    # 本文件
```

---

## 2. 核心技术栈

### 后端

| 技术 | 用途 |
|------|------|
| **Node.js + TypeScript** | 运行环境与类型安全 |
| **Express** | HTTP 框架，路由与中间件 |
| **Prisma** | ORM，类型安全的数据库操作 |
| **SQLite** | 轻量级本地数据库（零配置） |
| **JWT (jsonwebtoken)** | 无状态用户认证 |
| **bcryptjs** | 密码哈希 |
| **Zod** | 请求体校验 |

### 前端

| 技术 | 用途 |
|------|------|
| **Vite** | 构建工具，极速 HMR |
| **React 19 + TypeScript** | UI 框架 |
| **React Router v7** | 客户端路由 |
| **Tailwind CSS v4** | 原子化 CSS，极简风格 |
| **Axios** | HTTP 请求 + 拦截器 |
| **react-markdown** | Markdown → React 组件 |
| **remark-gfm** | GFM 扩展（表格/删除线等） |
| **remark-math** | Markdown 数学公式语法解析 |
| **rehype-highlight** | 代码语法高亮（highlight.js） |
| **rehype-katex** | LaTeX 数学公式渲染 |
| **KaTeX** | 快速数学公式排版 |

### 数据库模型关系

```
User (1) ─────< (N) Post
User (1) ─────< (N) Comment
User (1) ─────< (N) Like
Post  (1) ─────< (N) Comment  (级联删除)
Post  (1) ─────< (N) Like     (级联删除)
Like  [userId, postId] 联合唯一索引
```

---

## 3. 开发环境运行指南

### 前置要求

- Node.js ≥ 18
- npm ≥ 9

### 3.1 启动后端

```bash
cd backend

# 安装依赖
npm install

# 初始化数据库（生成 SQLite + 运行迁移 + 注入种子数据）
npx prisma migrate dev --name init
npm run db:seed

# 启动开发服务器（端口 3001，支持热重载）
npm run dev
```

种子数据包含：

- **管理员**: `admin@blog-xlab.com` / `admin123`
- **普通用户**: `zhangsan@blog-xlab.com` / `user123`
- **普通用户**: `lisi@blog-xlab.com` / `user456`
- **3 篇**带有 Markdown、代码块和 LaTeX 数学公式的示例文章

### 3.2 启动前端

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器（端口 5173，Vite 自动代理 /api 到后端 3001）
npm run dev
```

访问 `http://localhost:5173` 即可查看博客。

### 3.3 开发阶段常用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动后端 / 前端开发服务器 |
| `npm run build` | 生产环境构建 |
| `npx prisma studio` | 打开 Prisma 数据管理 GUI |
| `npm run db:seed` | 重新注入种子数据 |
| `npm run db:push` | 同步 Schema 到数据库（跳过迁移） |

---

## 4. 部署到公有网络（⭐ 核心章节）

下面提供**五种**部署方案，按难度从低到高排列。如果你是第一次部署，建议从**方案 D（宝塔面板）** 或 **方案 A（云服务器）** 开始。

### 📋 部署前准备

无论选哪种方案，你都需要准备两样东西：

| 必需品 | 说明 | 参考花费 |
|--------|------|----------|
| **一台服务器** | 可以是云服务器（VPS）、家里的电脑、树莓派，或者 Serverless 平台 | ¥30–100/月（VPS），或免费（Serverless） |
| **一个域名**（推荐）| 让用户通过 `blog.xxx.com` 访问。国内域名需备案 | ¥30–60/年 |

**推荐的云服务器购买渠道：**

- 国内：阿里云 ECS / 腾讯云轻量应用服务器（新人¥68/年）
- 海外：AWS Lightsail / Vultr / DigitalOcean（$5–6/月）
- 免费：Oracle Cloud Always Free（永久免费 VPS，4核 24G RAM）

> 💡 **关于备案**：如果你使用国内服务器 + 国内域名，根据法规需要做 ICP 备案（约 15-20 个工作日）。不想备案可以选择**香港/海外服务器**，或**方案 C / E（Serverless）**。

---

### 方案 A：云服务器（VPS）手动部署 ⭐⭐⭐⭐⭐

这是最经典、最灵活的方案。适合任何云服务器（阿里云/腾讯云/AWS/任意 VPS）。

#### A.1 连接到服务器

```bash
# 将下面地址换成你自己的服务器 IP
ssh root@你的服务器IP
```

#### A.2 安装 Node.js 环境

```bash
# 使用 NodeSource 安装 Node.js 20.x（LTS）
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证安装
node -v    # 应输出 v20.x.x
npm -v     # 应输出 10.x.x
```

如果用的是 CentOS / Rocky Linux，将 `apt-get` 换成 `yum`。

#### A.3 安装 PM2、Nginx 和 Git

```bash
# PM2：进程守护，保证后端 7×24 运行
sudo npm install -g pm2

# Nginx：高性能 Web 服务器，负责接收公网请求并转发
sudo apt-get install -y nginx

# Git：拉取代码（如果通过 GitHub 管理代码）
sudo apt-get install -y git
```

#### A.4 克隆项目到服务器

```bash
# 创建部署目录
mkdir -p /home/deploy
cd /home/deploy

# 方式一：从 GitHub 克隆（推荐）
git clone https://github.com/你的用户名/blog-XLab.git

# 方式二：手动上传（用 scp 或 SFTP 工具）
# scp -r ./blog-XLab root@你的IP:/home/deploy/

cd blog-XLab
```

#### A.5 构建后端

```bash
cd backend
npm install
npx prisma generate
npx prisma db push

# 可选：注入初始数据
npm run db:seed

# TypeScript 编译
npm run build

# 用 PM2 启动后端进程
pm2 start dist/index.js --name blog-xlab-api

# 验证后端是否启动成功
curl http://localhost:3001/api/health
# 预期输出：{"status":"ok","timestamp":"..."}
```

#### A.6 构建前端

```bash
cd ../frontend
npm install
npm run build

# 产物在 frontend/dist/ 目录下
ls dist/
# 应有 index.html 和 assets/ 目录
```

#### A.7 配置 Nginx 反向代理

创建 Nginx 配置文件：

```bash
sudo nano /etc/nginx/sites-available/blog-xlab
```

写入以下内容（将 `你的域名.com` 替换为实际域名，如果没有域名暂时用服务器 IP）：

```nginx
server {
    listen 80;
    server_name 你的域名.com;   # 没有域名就填服务器公网 IP

    # ========== 前端静态文件 ==========
    root /home/deploy/blog-XLab/frontend/dist;
    index index.html;

    # Gzip 压缩（减小传输体积）
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript image/svg+xml;
    gzip_min_length 1000;

    # 静态资源强缓存（文件名带 hash，可放心缓存一年）
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA 路由回退：所有非文件请求都返回 index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # ========== API 反向代理 ==========
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 上传限制（Markdown 文章可能包含 base64 图片）
        client_max_body_size 10m;
    }
}
```

启用配置并重载 Nginx：

```bash
# 创建软链接启用站点
sudo ln -s /etc/nginx/sites-available/blog-xlab /etc/nginx/sites-enabled/

# 删除默认站点（避免冲突）
sudo rm -f /etc/nginx/sites-enabled/default

# 检查配置语法
sudo nginx -t

# 重载 Nginx
sudo systemctl reload nginx
```

#### A.8 配置防火墙

```bash
# 如果你用 ufw（Ubuntu 默认）
sudo ufw allow 22/tcp     # SSH
sudo ufw allow 80/tcp     # HTTP
sudo ufw allow 443/tcp    # HTTPS
sudo ufw enable

# ⚠️ 如果是云服务器（阿里云/腾讯云/AWS 等），还需要在网页控制台的
#    「安全组」/「防火墙」中添加入站规则，放行 80 和 443 端口。
#    这一步非常容易遗漏！
```

#### A.9 配置 HTTPS（SSL 证书）

有了 HTTPS，浏览器地址栏才有那个绿色小锁。使用 Let's Encrypt 免费证书：

```bash
# 安装 Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# 自动获取证书并配置 Nginx
sudo certbot --nginx -d 你的域名.com

# 按提示操作：输入邮箱 → 同意条款 → 选择是否重定向 HTTP 到 HTTPS（选 2）
```

Certbot 会自动修改 Nginx 配置并设置证书自动续期。验证自动续期是否正常：

```bash
sudo certbot renew --dry-run
# 看到 "Congratulations" 即表示正常
```

#### A.10 设置 PM2 开机自启

```bash
# 让 PM2 随系统启动
pm2 startup systemd
# 按照屏幕提示复制并执行那条 sudo 命令

# 保存当前进程列表（重启后自动恢复）
pm2 save
```

#### A.11 验证部署结果

```bash
# 本地检查
pm2 status                     # blog-xlab-api 应为 online
sudo systemctl status nginx    # 应为 active (running)
curl http://localhost/api/health

# 公网检查：在浏览器访问 https://你的域名.com
# 应看到博客首页，3 篇示例文章正常显示
```

---

### 方案 B：Docker Compose 一键部署 ⭐⭐⭐⭐

如果你熟悉 Docker，这是最干净的方式。所有依赖打包在容器内，不污染宿主机。

#### B.1 在服务器上安装 Docker

```bash
# 官方一键安装脚本
curl -fsSL https://get.docker.com | sudo bash

# 将当前用户加入 docker 组（免 sudo）
sudo usermod -aG docker $USER
newgrp docker

# 验证
docker --version
docker compose version
```

#### B.2 创建后端 Dockerfile

在项目 `backend/` 目录下新建 `Dockerfile`：

```dockerfile
FROM node:20-alpine
WORKDIR /app

# 安装依赖
COPY package*.json ./
RUN npm ci

# 复制源码
COPY . .

# 生成 Prisma Client + 编译 TypeScript
RUN npx prisma generate
RUN npm run build

EXPOSE 3001

# 启动时先同步数据库，再启动服务
CMD sh -c "npx prisma db push && node dist/index.js"
```

#### B.3 创建前端 Dockerfile

在项目 `frontend/` 目录下新建 `Dockerfile`：

```dockerfile
# ===== 构建阶段 =====
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ===== 运行阶段 =====
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx 配置文件
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### B.4 创建前端 Nginx 配置

在 `frontend/` 目录下新建 `nginx.conf`：

```nginx
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript image/svg+xml;
    gzip_min_length 1000;

    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://backend:3001;    # 注意：这里是 Docker 服务名
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 10m;
    }
}
```

#### B.5 编写 docker-compose.yml

在项目根目录创建 `docker-compose.yml`：

```yaml
services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: blog-xlab-api
    restart: always
    environment:
      - PORT=3001
      - JWT_SECRET=请换成你自己的随机字符串至少32位
    volumes:
      # 持久化 SQLite 数据库，容器删了数据还在
      - blog-data:/app/prisma

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: blog-xlab-web
    restart: always
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  blog-data:
```

#### B.6 启动

```bash
# 在项目根目录执行
docker compose up -d --build

# 查看运行状态
docker compose ps

# 查看日志
docker compose logs -f
```

#### B.7 配置 HTTPS（Certbot + Nginx 宿主机方案）

Docker 环境下 HTTPS 有两种做法，推荐在宿主机上跑 Nginx + Certbot 然后反代到 Docker 容器的 80 端口，步骤同**方案 A 的 A.7 和 A.9**，只是 `proxy_pass` 的目标换成 `http://127.0.0.1:80`。

---

### 方案 C：Serverless 零服务器部署（省钱方案）⭐⭐⭐

适合不想花钱买服务器的场景。核心思路：前端放 Vercel/Netlify，后端放 Railway/Render。

#### C.1 后端部署到 Railway

1. 把 `backend/` 推到一个 GitHub 仓库
2. 注册 [Railway](https://railway.app)，用 GitHub 登录
3. 点击 **New Project** → **Deploy from GitHub repo** → 选择你的仓库
4. Railway 自动检测到 Node.js 项目，但需要手动设置：
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npx prisma db push && node dist/index.js`
5. 在 **Variables** 中添加环境变量：
   - `JWT_SECRET` = 随机生成一个 32 位字符串
   - `PORT` = `3001`
6. 因为 Railway 的容器是无状态的，SQLite 数据库文件会在每次部署后丢失。你需要改用 **Turso**（免费 SQLite 云服务）或使用 Railway 的 Volume 功能（付费）来持久化数据。

#### C.2 前端部署到 Vercel

1. 把整个项目推到一个 GitHub 仓库
2. 注册 [Vercel](https://vercel.com)，用 GitHub 登录
3. 点击 **Add New Project** → 选择你的仓库
4. 配置：
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. 部署完成后，在 Vercel 项目设置中添加 Rewrite 规则：

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://你的Railway后端地址/api/:path*"
    }
  ]
}
```

这样前端的 `/api/*` 请求会被 Vercel 转发到 Railway 后端，无需修改前端代码。

---

### 方案 D：宝塔面板（⭐ 新手首选，可视化操作）

如果你不熟悉 Linux 命令行，**宝塔面板**提供全 Web 界面的服务器管理。

#### D.1 安装宝塔面板

服务器重装为干净系统后，SSH 登录执行：

```bash
# Ubuntu / Debian
wget -O install.sh https://download.bt.cn/install/install-ubuntu_6.0.sh
sudo bash install.sh

# CentOS / Rocky Linux
wget -O install.sh https://download.bt.cn/install/install_6.0.sh
sudo bash install.sh
```

安装完成后终端会输出面板地址、用户名和密码：

```
外网面板地址: http://你的IP:8888/xxxxxxxx
username: xxxxxxxx
password: xxxxxxxx
```

#### D.2 安装运行环境

登录宝塔面板后：

1. 进入 **软件商店**
2. 一键安装：
   - **Nginx**（最新稳定版）
   - **Node.js 版本管理器**（选 v20.x）
   - **PM2 管理器**

#### D.3 部署后端

1. 进入 **文件** → 在 `/www/wwwroot/` 下上传或创建 `blog-xlab` 目录
2. 把整个项目上传到 `/www/wwwroot/blog-xlab/`
3. 打开宝塔的 **终端** 功能，执行：

```bash
cd /www/wwwroot/blog-xlab/backend
npm install
npx prisma generate
npx prisma db push
npm run db:seed    # 可选：注入示例数据
npm run build
```

4. 进入 **网站** → **Node 项目** → **添加 Node 项目**
5. 填写：
   - 项目目录：`/www/wwwroot/blog-xlab/backend`
   - 启动文件：`dist/index.js`
   - 项目名称：`blog-xlab-api`
   - 运行端口：`3001`
6. 点击提交，PM2 会自动启动后端。

#### D.4 部署前端 + 配置 Nginx 反代

1. 构建前端：

```bash
cd /www/wwwroot/blog-xlab/frontend
npm install
npm run build
```

2. 进入 **网站** → **添加站点**
3. 填写你的域名，根目录选 `/www/wwwroot/blog-xlab/frontend/dist`
4. 点击站点右侧 **设置** → **配置文件**，在 `server` 块中加入：

```nginx
# SPA 路由回退
location / {
    try_files $uri $uri/ /index.html;
}

# 静态资源缓存
location /assets/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# API 反代到后端
location /api/ {
    proxy_pass http://127.0.0.1:3001;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    client_max_body_size 10m;
}
```

保存后宝塔会自动重载 Nginx。

#### D.5 免费 SSL 证书

1. 点击站点 → **SSL** → **Let's Encrypt**
2. 勾选域名 → 点击 **申请**
3. 勾选 **强制 HTTPS** → 保存

宝塔会自动处理证书续期。

---

### 方案 E：Cloudflare Tunnel（无需公网 IP，零成本）⭐⭐⭐

如果你没有云服务器，**可以用家里电脑或树莓派**来部署，通过 Cloudflare Tunnel 让外网访问。完全免费，自带 HTTPS。

#### E.1 准备工作

1. 注册 [Cloudflare](https://cloudflare.com) 账号
2. 把你的域名的 DNS 托管到 Cloudflare（免费）
3. 确保本地电脑/树莓派已按**方案 A** 的步骤完成构建，后端在 3001 端口，Nginx 在 80 端口

#### E.2 安装 cloudflared

```bash
# Linux (x86_64)
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o cloudflared
chmod +x cloudflared
sudo mv cloudflared /usr/local/bin/

# Mac
brew install cloudflared

# Windows (PowerShell 管理员)
winget install Cloudflare.cloudflared
```

#### E.3 创建隧道

```bash
# 登录 Cloudflare（会打开浏览器授权）
cloudflared tunnel login

# 创建一条隧道
cloudflared tunnel create blog-xlab

# 这时会输出隧道 ID 和凭证文件路径，记下来
```

#### E.4 编写隧道配置

创建 `~/.cloudflared/config.yml`：

```yaml
tunnel: <你创建的隧道ID>
credentials-file: /root/.cloudflared/<隧道ID>.json

ingress:
  # 前端（通过 Nginx 80 端口）
  - hostname: blog.你的域名.com
    service: http://localhost:80

  # 后端（直接走 3001）
  - hostname: api.你的域名.com
    service: http://localhost:3001

  # 未匹配的请求返回 404
  - service: http_status:404
```

#### E.5 配置 DNS 并启动

1. 在 Cloudflare 控制台 → DNS → 添加两条 CNAME 记录：
   - `blog` → `<隧道ID>.cfargotunnel.com`（开启橙色云朵代理）
   - `api` → `<隧道ID>.cfargotunnel.com`（开启橙色云朵代理）

2. 启动隧道：

```bash
# 前台运行（测试用）
cloudflared tunnel run blog-xlab

# 后台运行 + 开机自启
sudo cloudflared service install
sudo systemctl start cloudflared
sudo systemctl enable cloudflared
```

访问 `https://blog.你的域名.com`，Cloudflare 会自动提供 HTTPS 证书，且隐藏你家里的真实 IP。

---

### 🔧 运维锦囊（所有方案通用）

#### 数据库备份（极其重要！）

SQLite 是一个单文件数据库，备份就是复制文件：

```bash
# 👇 手动备份（一条命令）
cp /home/deploy/blog-XLab/backend/prisma/dev.db ~/backups/dev-$(date +%Y%m%d-%H%M).db

# 👇 设置定时任务：每天凌晨 3 点自动备份
crontab -e
# 粘贴下面这行：
0 3 * * * cp /home/deploy/blog-XLab/backend/prisma/dev.db ~/backups/dev-$(date +\%Y\%m\%d).db

# 👇 只保留最近 30 天的备份（加到 cron 里）
0 4 * * * find ~/backups -name "dev-*.db" -mtime +30 -delete
```

> ⚠️ 建议把备份目录 `~/backups/` 再同步到云存储（如阿里云 OSS / 腾讯云 COS / AWS S3），或至少定期下载到本地。

#### 更新部署流程

当你修改了代码后，按以下步骤更新线上环境：

```bash
# === 方案 A / D（手动部署）===
# 1. 拉取最新代码
cd /home/deploy/blog-XLab
git pull

# 2. 重新构建后端
cd backend
npm install               # 如果依赖有变化
npx prisma generate       # 如果 Schema 有变化
npx prisma db push        # 如果 Schema 有变化
npm run build

# 3. 重启后端
pm2 restart blog-xlab-api

# 4. 重新构建前端
cd ../frontend
npm install
npm run build

# 5. Nginx 不需要重启（静态文件直接覆盖了 dist 目录）

# === 方案 B（Docker）===
git pull
docker compose up -d --build

# === 方案 C（Serverless）===
git push   # 推送到 GitHub，Vercel / Railway 自动部署
```

#### 查看日志

```bash
# 后端日志
pm2 logs blog-xlab-api --lines 50

# Docker 日志
docker compose logs -f backend

# Nginx 访问日志
tail -f /var/log/nginx/access.log

# Nginx 错误日志（排查 502 等问题时必看）
tail -f /var/log/nginx/error.log
```

#### 常见问题排查

| 现象 | 可能原因 | 解决方法 |
|------|----------|----------|
| 浏览器显示"无法访问此网站" | 防火墙未放行 80/443；或云服务器安全组未配置 | `sudo ufw allow 80/tcp && sudo ufw allow 443/tcp`；**检查云服务器安全组入站规则** |
| 首页能访问，但 API 返回 502 | 后端进程挂了 | `pm2 status` 检查；`pm2 restart blog-xlab-api` |
| 页面空白 / JS 加载失败 | 前端文件路径问题 | 检查 Nginx 的 `root` 目录是否指向 `frontend/dist` |
| API 返回 401 且无限跳转登录页 | JWT_SECRET 变化导致旧 Token 失效 | 清除浏览器 localStorage；或重新登录 |
| 刷新页面后 404 | Nginx 未配置 SPA 路由回退 | 检查是否有 `try_files $uri $uri/ /index.html;` |
| 证书过期 / 不信任 | Let's Encrypt 自动续期失败 | `sudo certbot renew --force-renewal` |
| 上传大文章失败 | `client_max_body_size` 太小 | Nginx 中设为 `client_max_body_size 10m;` |
| PM2 进程频繁重启 | 代码有未捕获异常或内存泄漏 | `pm2 logs blog-xlab-api --err` 看错误堆栈 |
| SQLite 数据库损坏 | 非正常关机或磁盘满 | 用备份文件覆盖；检查磁盘空间 `df -h` |

#### 安全加固建议

1. **更换 JWT_SECRET**：绝对不要用代码里的默认值 `blog-xlab-secret-key-2024`。生成一个强随机字符串：
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   然后设为环境变量 `export JWT_SECRET=你生成的值`，并在 PM2 中配置：
   ```bash
   pm2 restart blog-xlab-api --update-env
   ```

2. **修改默认管理员密码**：上线后立即登录后台，然后通过 API 或直接改数据库修改管理员密码。

3. **限制 SSH 登录**：
   ```bash
   # 禁用 root 密码登录，改用密钥登录
   sudo sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
   sudo systemctl restart sshd
   ```

4. **安装 Fail2Ban**（防止暴力破解）：
   ```bash
   sudo apt-get install -y fail2ban
   sudo systemctl enable fail2ban
   ```

5. **定期更新系统**：
   ```bash
   sudo apt-get update && sudo apt-get upgrade -y
   ```

---

### 4.5 配置 GitHub OAuth 登录（可选）

要让用户通过 GitHub 账号一键登录，需要在 GitHub 创建一个 OAuth App：

**步骤 1：创建 GitHub OAuth App**

1. 登录 GitHub → Settings → Developer settings → OAuth Apps → **New OAuth App**
2. 填写：
   - **Application name**: `chiiiiiiing's blog junior`（或你的博客名）
   - **Homepage URL**: `https://你的域名.com`
   - **Authorization callback URL**: `https://你的域名.com/api/auth/github/callback`
3. 点击 Register application
4. 生成 **Client Secret** 并复制

**步骤 2：配置环境变量**

```bash
# 在服务器上设置环境变量
export GITHUB_CLIENT_ID="你的Client ID"
export GITHUB_CLIENT_SECRET="你的Client Secret"
export GITHUB_CALLBACK_URL="https://你的域名.com/api/auth/github/callback"
export FRONTEND_URL="https://你的域名.com"

# PM2 方式（推荐）
pm2 restart blog-xlab-api --update-env
```

设置后，登录页会自动出现 **「GitHub 登录」** 按钮。

**步骤 3：本地开发测试**

本地开发时，GitHub OAuth App 的 callback URL 设为：

```
http://localhost:3001/api/auth/github/callback
```

同时在 `backend/.env`（手动创建）中写入：

```
GITHUB_CLIENT_ID=你的Client ID
GITHUB_CLIENT_SECRET=你的Client Secret
FRONTEND_URL=http://localhost:5173
```

> 💡 没有配置环境变量时，后端会返回提示信息而不会崩溃，不影响邮箱密码登录。

---

### 4.6 通过 .md 文件创建文章

在管理后台的「新建文章」页面，可以直接**拖拽或点击上传** `.md` 文件：

- 拖拽一个 `.md` 文件到编辑器的上传区域
- 或点击上传区域选择文件
- 系统自动解析文件内容，提取 `# 标题` 作为文章标题，生成对应的 slug
- 也支持通过 API 上传：`POST /api/posts/upload-md`

---

## 5. API 接口速查

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| POST | `/api/auth/register` | 无 | 用户注册 |
| POST | `/api/auth/login` | 无 | 用户登录 |
| GET | `/api/auth/me` | JWT | 获取当前用户信息 |
| GET | `/api/posts?page=&pageSize=` | 无 | 文章列表（分页） |
| GET | `/api/posts/:slug` | 无 | 文章详情（按 slug） |
| GET | `/api/posts/:id` | 无 | 文章详情（按 ID） |
| POST | `/api/posts` | ADMIN | 创建文章 |
| PUT | `/api/posts/:id` | ADMIN | 更新文章 |
| DELETE | `/api/posts/:id` | ADMIN | 删除文章 |
| GET | `/api/posts/admin/all` | ADMIN | 全部文章（含草稿） |
| POST | `/api/posts/:id/comments` | JWT | 发表评论 |
| DELETE | `/api/comments/:id` | JWT | 删除评论（本人或管理员） |
| POST | `/api/posts/:id/like` | JWT | 点赞/取消点赞切换 |
| GET | `/api/posts/:id/like-status` | JWT | 查询当前用户点赞状态 |
| GET | `/api/auth/github` | 无 | GitHub OAuth 登录跳转 |
| GET | `/api/auth/github/callback` | 无 | GitHub OAuth 回调处理 |
| POST | `/api/posts/upload-md` | ADMIN | 上传 .md 文件并解析 |
| GET | `/api/health` | 无 | 健康检查 |

---

## 6. 设计亮点

- **Optimistic UI 点赞**：点击即响应，失败自动回滚，用户体验丝滑
- **JWT 双中间件**：`requireAuth`（强制认证）和 `optionalAuth`（可选认证），权限粒度精确
- **路由守卫**：管理后台由 `AuthContext` 保护，未登录自动跳转
- **Markdown 双栏编辑器**：管理后台编辑 + 实时预览，所见即所得
- **级联删除**：删除文章自动清理所有关联评论和点赞
- **联合唯一索引**：数据库层面保证同一用户对同一文章只能点赞一次
- **开发/生产环境解耦**：Vite proxy 处理开发环境跨域，Nginx 反代处理生产环境
