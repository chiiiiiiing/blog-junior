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

### 2.1 后端技术

#### 运行时与框架

| 技术 | 用途 | 选型理由 |
|------|------|----------|
| **Node.js** (≥18) | JavaScript 运行时，基于 V8 引擎 | 前后端统一语言，生态丰富，非阻塞 I/O 适合博客类 IO 密集型场景 |
| **TypeScript** | 为 JS 添加静态类型系统 | 编译期发现类型错误，智能代码补全，提升大型项目可维护性 |
| **Express** | 轻量级 HTTP 框架 | 最成熟的 Node.js 框架，中间件生态完善，学习成本低，灵活性高 |

#### 数据库与 ORM

| 技术 | 用途 | 选型理由 |
|------|------|----------|
| **SQLite** | 嵌入式关系型数据库 | **零配置零依赖**，数据就是一个单文件 `dev.db`，备份只需复制文件；轻量级博客场景性能完全够用（单机 QPS 可达数万） |
| **Prisma** | 下一代 Node.js ORM | 类型安全的数据库操作，Schema-first 定义数据模型，自动生成迁移脚本，提供 GUI 管理工具 Prisma Studio |

#### 认证与安全

| 技术 | 用途 | 选型理由 |
|------|------|----------|
| **JWT** (jsonwebtoken) | 无状态用户认证 | 服务端不存 Session，水平扩展友好；Token 内包含用户 ID + 角色，中间件直接解析无需查库 |
| **bcryptjs** | 密码哈希（加盐 + 多轮散列） | 纯 JS 实现无需编译原生模块，跨平台兼容性好；10 轮 salt 足够防御彩虹表攻击 |
| **Zod** | 请求体校验 | TypeScript-first 的 Schema 校验库，定义一次 Schema 自动推导 TS 类型，避免重复定义 |

### 2.2 前端技术

#### 核心框架与构建

| 技术 | 用途 | 选型理由 |
|------|------|----------|
| **Vite** | 构建工具与开发服务器 | 基于 ESM 原生模块，冷启动 < 1 秒，HMR 热更新极快；Rollup 生产打包，产物优化到位 |
| **React 19** | UI 组件化框架 | 函数组件 + Hooks 心智模型简洁，并发特性（useTransition 等）提升交互体验，生态最庞大 |
| **TypeScript** | 类型安全 | 组件 Props 类型校验，API 响应类型定义，避免运行时 undefined 错误 |
| **React Router v7** | 客户端路由 | 声明式路由配置，支持嵌套路由、懒加载、路由守卫 |

#### 样式与 UI

| 技术 | 用途 | 选型理由 |
|------|------|----------|
| **Tailwind CSS v4** | 原子化 CSS 框架 | 直接在 HTML 中写样式，无需命名 class、无需切换文件；构建时摇树，生产包极小；v4 使用 CSS-first 配置，性能更好 |

#### 数据请求

| 技术 | 用途 | 选型理由 |
|------|------|----------|
| **Axios** | HTTP 客户端 | 请求/响应拦截器自动附加 JWT Token、统一处理 401；比原生 fetch 更简洁的错误处理和超时控制 |

#### Markdown 渲染管线

整个 Markdown 渲染使用 **unified 生态**的管道式处理，每一步职责单一：

```
Markdown 原始文本
  → remark.parse (解析为 AST)
  → remark-gfm (GFM 扩展：表格、删除线、任务列表)
  → remark-math (识别 $...$ 和 $$...$$ 数学公式)
  → remark-rehype (转换 MDAST → HAST，即 HTML AST)
  → rehype-highlight (代码块语法高亮，基于 highlight.js)
  → rehype-katex (数学公式渲染为 HTML + CSS)
  → rehype-stringify (序列化为 HTML 字符串)
  → React 组件渲染
```

| 技术 | 用途 |
|------|------|
| **react-markdown** | 将 Markdown 渲染为 React 组件，替代 dangerouslySetInnerHTML，安全且可自定义 |
| **remark-gfm** | GitHub Flavored Markdown 扩展 —— 表格、删除线、自动链接、任务列表 |
| **remark-math** | 解析 Markdown 中的 LaTeX 数学公式语法（`$inline$` 和 `$$block$$`） |
| **rehype-highlight** | 基于 highlight.js 的代码语法高亮，支持 190+ 种语言 |
| **rehype-katex** | 将 LaTeX 公式渲染为 HTML + CSS，比 MathJax 快 5–10 倍 |
| **KaTeX** | 数学公式排版引擎，无依赖纯静态渲染，支持大部分 LaTeX 语法 |

### 2.3 数据库模型关系

```
User (1) ─────< (N) Post        # 一个用户写多篇文章
User (1) ─────< (N) Comment     # 一个用户发表多条评论
User (1) ─────< (N) Like        # 一个用户点赞多篇文章
Post  (1) ─────< (N) Comment    # 一篇文章有多条评论 (级联删除)
Post  (1) ─────< (N) Like       # 一篇文章有多个点赞 (级联删除)
Like  [userId, postId] 联合唯一索引  # 同一用户对同一文章只能点赞一次
```

#### 表结构速览

**User（用户表）**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Int (自增) | 主键 |
| username | String (唯一) | 用户名 |
| email | String (唯一) | 邮箱，登录凭据 |
| passwordHash | String? | bcrypt 密码哈希（GitHub 用户可为空） |
| role | String | `ADMIN` 或 `USER`，默认 USER |
| githubId | String? (唯一) | GitHub OAuth 绑定的 ID |
| avatar | String? | 头像 URL |
| createdAt | DateTime | 注册时间 |

**Post（文章表）**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Int (自增) | 主键 |
| title | String | 文章标题 |
| slug | String (唯一) | URL 友好的英文标识，用于路由 |
| content | String | Markdown 正文 |
| published | Boolean | 是否发布（false = 草稿） |
| authorId | Int (外键) | 关联 User.id |
| createdAt / updatedAt | DateTime | 创建/更新时间 |

**Comment（评论表）**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Int (自增) | 主键 |
| content | String | 评论内容 |
| postId | Int (外键) | 关联 Post.id（级联删除） |
| authorId | Int (外键) | 关联 User.id |
| createdAt | DateTime | 评论时间 |

**Like（点赞表）**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Int (自增) | 主键 |
| postId | Int (外键) | 关联 Post.id（级联删除） |
| userId | Int (外键) | 关联 User.id |
| createdAt | DateTime | 点赞时间 |
| @@unique([userId, postId]) | 联合唯一 | 数据库层面防重复点赞 |

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
| `npx prisma studio` | 打开 Prisma 数据管理 GUI（可视化查看/编辑数据库） |
| `npm run db:seed` | 重新注入种子数据 |
| `npm run db:push` | 同步 Schema 到数据库（跳过迁移） |

### 3.4 本地数据库查看

数据库文件位于 `backend/prisma/dev.db`（SQLite 单文件），有三种方式查看：

#### 方式一：Prisma Studio（推荐，图形界面）

```bash
cd backend
npx prisma studio
```

浏览器会自动打开 `http://localhost:5555`，可以**可视化**浏览和编辑所有表数据（User、Post、Comment、Like）。

#### 方式二：命令行快速查询

```bash
cd backend
npx prisma db execute --stdin
```

然后输入 SQL 查询，例如：

```sql
-- 查看所有用户
SELECT id, username, email, role FROM User;

-- 查看所有文章
SELECT id, title, slug, published FROM Post;
```

按 `Ctrl+D` 执行。

#### 方式三：sqlite3 命令行（需单独安装）

```bash
# 安装 sqlite3（如果没装）
# Windows: choco install sqlite / winget install SQLite.SQLite
# Mac: brew install sqlite
# Linux: sudo apt-get install sqlite3

# 连接数据库
sqlite3 backend/prisma/dev.db

# 常用命令
.tables              # 列出所有表
.schema User         # 查看 User 表结构
SELECT * FROM User;  # 查询所有用户
.quit                # 退出
```

### 3.5 常见启动问题

#### ❓ 登录失败（管理员账户登不进去）

**必须确保后端已启动**，后端不运行则 API 无法响应。

检查后端是否在运行：

```bash
# Windows: 查看端口 3001 是否被占用
netstat -ano | findstr :3001

# Mac / Linux
lsof -i :3001
```

如果没有输出，说明后端未启动，执行：

```bash
cd backend
npm run dev
```

> ⚠️ **注意**：前端和后端需要**同时运行**（开两个终端），访问 `http://localhost:5173` 而非直接打开 `index.html`。

#### ❓ 页面空白 / API 请求失败

1. 确认后端终端显示 `Server running on http://localhost:3001`
2. 确认前端终端显示 `http://localhost:5173`
3. 打开浏览器开发者工具（F12）→ Network 面板，查看 `/api/` 请求是否返回错误

#### ❓ 数据库文件损坏或数据异常

重新初始化数据库：

```bash
cd backend
rm -f prisma/dev.db              # 删除旧数据库文件
npx prisma db push               # 重建表结构
npm run db:seed                  # 重新注入种子数据
```

#### ❓ 端口被占用

```bash
# Windows: 查看占用 3001 端口的进程
netstat -ano | findstr :3001
# 记下 PID，在任务管理器结束进程

# Mac / Linux
lsof -i :3001
kill -9 <PID>
```

### 3.6 自定义友链

友链配置文件位于 `frontend/src/components/Blogroll.tsx`，编辑 `LINKS` 数组即可增删改链接：

```tsx
const LINKS = [
  { name: "React", url: "https://react.dev", desc: "用于构建用户界面的 JavaScript 库" },
  // 添加友链示例：
  // { name: "显示名称", url: "https://example.com", desc: "一句话描述" },
];
```

修改后刷新页面即可看到效果，无需重启。

---

## 4. 部署到公有网络（⭐ 核心章节）

下面介绍云服务器（VPS）手动部署方式。

### 📋 部署前准备

你需要准备以下两样东西：

| 必需品 | 说明 | 参考花费 |
|--------|------|----------|
| **一台云服务器** | 云服务器（VPS），如阿里云/腾讯云/AWS 等 | ¥30–100/月 |
| **一个域名**（推荐）| 让用户通过 `blog.xxx.com` 访问。国内域名需备案 | ¥30–60/年 |

**推荐的云服务器购买渠道：**

- 国内：阿里云 ECS / 腾讯云轻量应用服务器（新人¥68/年）
- 海外：AWS Lightsail / Vultr / DigitalOcean（$5–6/月）
- 免费：Oracle Cloud Always Free（永久免费 VPS，4核 24G RAM）

> 💡 **关于备案**：如果你使用国内服务器 + 国内域名，根据法规需要做 ICP 备案（约 15-20 个工作日）。不想备案可以选择**香港/海外服务器**。

---

### 云服务器（VPS）手动部署

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

### 🔧 运维锦囊

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

每次修改代码后，按以下步骤更新线上环境。

**本地 → 服务器同步代码：**

```bash
# 方式一：通过 Git 同步（推荐）
# 先在本地 push 到 GitHub，然后 SSH 到服务器拉取

# 方式二：scp 直接上传修改的文件
scp -r ./backend/src root@你的IP:/home/deploy/blog-XLab/backend/
scp -r ./frontend/src root@你的IP:/home/deploy/blog-XLab/frontend/
```

**服务器端更新构建（SSH 到服务器后执行）：**

```bash
# === 完整更新流程 ===

# 1. 拉取最新代码（如果用 Git）
cd /home/deploy/blog-XLab
git pull

# 2. 重新构建后端
cd backend
npm install               # 如果 package.json 有变化
npx prisma generate       # 如果 prisma/schema.prisma 有变化
npx prisma db push        # 如果 Schema 有变化（不会丢数据）
npm run build
pm2 restart blog-xlab-api

# 3. 重新构建前端
cd ../frontend
npm install               # 如果 package.json 有变化
npm run build
# Nginx 不需要重启（静态文件直接覆盖了 dist 目录）

# 4. 验证
curl http://localhost:3001/api/health
# → {"status":"ok","timestamp":"..."}
```

**常用更新场景速查：**

| 改动内容 | 需要执行的命令 |
|---------|---------------|
| 只改了前端页面/样式 | `cd frontend && npm run build` |
| 只改后端路由/逻辑 | `cd backend && npm run build && pm2 restart blog-xlab-api` |
| 改了数据库 Schema | `cd backend && npx prisma generate && npx prisma db push && npm run build && pm2 restart blog-xlab-api` |
| 新增了 npm 依赖 | 在对应目录执行 `npm install` 后再 build |

> 💡 **提示**：可以将上面的更新流程写成一个 `update.sh` 脚本放在 `/home/deploy/` 下，以后每次更新只需执行 `bash /home/deploy/update.sh`。



#### 查看日志

```bash
# 后端日志
pm2 logs blog-xlab-api --lines 50

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
