# chiiiiiiing's blog junior — 全栈个人博客系统

一个前后端分离的现代个人博客系统，支持 Markdown、代码高亮、LaTeX 数学公式渲染、文章标签、目录导航和搜索。

---

## 1. 项目架构

```
blog-XLab/
├── backend/                     # 后端：处理数据存储和业务逻辑
│   ├── prisma/
│   │   ├── schema.prisma        # 数据库表结构定义
│   │   ├── seed.ts              # 初始测试数据
│   │   └── dev.db               # SQLite 数据库文件（自动生成）
│   └── src/
│       ├── index.ts             # 服务入口
│       ├── routes/              # API 接口
│       ├── middleware/          # 权限校验
│       └── utils/               # 工具函数
│
├── frontend/                    # 前端：用户看到的页面
│   └── src/
│       ├── pages/               # 页面（首页、文章详情、登录、管理后台等）
│       ├── components/          # 可复用组件（导航栏、文章卡片、目录等）
│       ├── api/                 # 与后端通信的配置
│       ├── contexts/            # 全局状态（登录状态）
│       └── types/               # TypeScript 类型定义
│
└── README.md
```

> **新人理解**：这个项目分两块——`backend`（后端）负责存数据、处理登录、提供 API；`frontend`（前端）负责网页界面。浏览器访问前端 → 前端调后端 API → 后端查数据库 → 返回数据给前端显示。

---

## 2. 核心技术栈

### 2.1 运行时与框架

| 技术 | 一句话解释 | 为什么选它 |
|------|-----------|-----------|
| **Node.js** | 让 JavaScript 能在服务器上运行 | 前后端同一种语言，不用学两套 |
| **TypeScript** | 给 JavaScript 加了"类型标注"，写代码时就能发现错误 | 避免 `undefined` 之类的运行时崩溃 |
| **Express** | Node.js 最流行的 Web 框架，处理 HTTP 请求 | 简单、稳定、教程多 |
| **React 19** | 把网页拆成可复用的"组件"，数据变了自动更新界面 | 生态最大，出了问题容易搜到答案 |
| **Vite** | 前端构建工具，开发时秒级热更新 | 比旧工具（Webpack）快几十倍 |

### 2.2 数据库

| 技术 | 一句话解释 | 为什么选它 |
|------|-----------|-----------|
| **SQLite** | 数据库就是一个文件 `dev.db`，不需要安装数据库软件 | 零配置，备份就是复制文件，个人博客绰绰有余 |
| **Prisma** | 用 TypeScript 代码操作数据库，不用手写 SQL | 写错字段名编译时就报错，不会上线才发现 |

### 2.3 认证与安全

| 技术 | 一句话解释 |
|------|-----------|
| **JWT** | 登录后发一个加密令牌（Token），之后请求带上它就能识别身份——服务器不用记谁登录了 |
| **bcryptjs** | 密码不会明文存数据库，而是经过不可逆的哈希变换，即使数据库泄露密码也不会暴露 |
| **Zod** | 校验前端发来的数据格式对不对（比如邮箱是不是合法格式） |

### 2.4 Markdown 渲染

你写的 Markdown 文本，经过一条"流水线"变成网页：

```
Markdown 文本
  → 解析表格、删除线（remark-gfm）
  → 识别数学公式 $...$（remark-math）
  → 代码语法高亮（rehype-highlight，支持 190+ 语言）
  → 公式渲染为 HTML（rehype-katex）
  → 显示在网页上
```

### 2.5 样式

| 技术 | 一句话解释 |
|------|-----------|
| **Tailwind CSS v4** | 直接在 HTML 标签上写样式（如 `class="text-blue-600"` 就是蓝色文字），不用在 CSS 文件和 HTML 之间来回切换 |

---

## 3. 本地运行指南

> **新人理解**：你在自己电脑上先把项目跑起来看看效果，确认没问题再部署到服务器。

### 前置条件

- **Node.js** ≥ 18（[下载地址](https://nodejs.org) — 选 LTS 版，一路下一步安装）
- **npm** ≥ 9（安装 Node.js 时自动附带）
- 一个终端（Windows 按 `Win+R` 输入 `cmd` 回车，或搜 PowerShell）

### 3.1 启动后端

```bash
cd backend                      # 进入后端目录

npm install                     # 安装依赖（根据 package.json 下载需要的库）
                                # 新人理解：类似手机装 App，只不过这里是装代码库

npx prisma migrate dev --name init  # 创建数据库表（根据 schema.prisma 生成）
                                    # 新人理解：在 dev.db 文件里建好 User、Post 等表格

npm run db:seed                 # 注入测试数据（创建管理员账号和 3 篇示例文章）
                                # 新人理解：往空表里插入初始数据，不用手动一条条写

npm run dev                     # 启动后端服务（端口 3001，代码改动自动重启）
```

看到 `Backend running on http://localhost:3001` 就是启动成功了。

种子数据中的测试账号：

| 角色 | 邮箱 | 密码 |
|------|------|------|
| 管理员 | `admin@blog-xlab.com` | `admin123` |
| 普通用户 | `zhangsan@blog-xlab.com` | `user123` |
| 普通用户 | `lisi@blog-xlab.com` | `user456` |

### 3.2 启动前端

**另开一个终端窗口**（后端那个不要关），执行：

```bash
cd frontend                     # 进入前端目录

npm install                     # 安装前端依赖

npm run dev                     # 启动前端开发服务器（端口 5173）
```

浏览器访问 **`http://localhost:5173`** 即可看到博客。

> **新人理解**：为什么前端后端要分开跑？因为开发时 Vite 会自动代理 `/api` 请求到后端 3001 端口——你在前端页面登录，请求实际发到了后端。部署到服务器后，这个职责由 Nginx 承担。

### 3.3 常用命令速查

| 命令 | 在哪个目录执行 | 做什么 |
|------|--------------|--------|
| `npm run dev` | backend 或 frontend | 启动开发服务器 |
| `npm run build` | backend 或 frontend | 编译为生产版本（部署前必须执行） |
| `npx prisma studio` | backend | 打开网页版数据库浏览器（`localhost:5555`） |
| `npm run db:seed` | backend | 重新注入测试数据（会清空现有数据！） |
| `npx prisma db push` | backend | 修改了 schema.prisma 后同步到数据库 |

### 3.4 查看本地数据库

数据库是一个文件：`backend/prisma/dev.db`。三种查看方式：

**方式一：Prisma Studio（推荐，有图形界面）**

```bash
cd backend
npx prisma studio
```

浏览器自动打开 `http://localhost:5555`，可以点表格浏览和编辑数据。

**方式二：sqlite3 命令行**

```bash
# 先装 sqlite3（Mac 自带，Windows 用 winget install SQLite.SQLite）
sqlite3 backend/prisma/dev.db

# 进去后：
.tables              # 看有哪些表
SELECT * FROM User;  # 查所有用户
.quit                # 退出
```

**方式三：宝塔面板**

服务器上登录宝塔 → 文件 → 找到 `dev.db` → 右键用 SQLite 工具打开。

### 3.5 常见问题

**❓ 登录失败**
后端没启动，或者启动了但前端连不上。确认两个终端都在运行，后端显示 `running on http://localhost:3001`。

**❓ 页面空白**
打开浏览器 F12 → Network（网络）标签 → 刷新页面 → 看红色报错是什么。通常是后端没启或者端口被占。

**❓ 端口被占用**
```bash
# Windows
netstat -ano | findstr :3001
# 记下 PID，任务管理器里结束进程

# Mac / Linux
lsof -i :3001
kill -9 <PID>
```

**❓ 数据库乱了想重置**
```bash
cd backend
rm -f prisma/dev.db
npx prisma db push
npm run db:seed
```

---

## 4. 更新部署流程

> **新人理解**：你在本地改了代码 → 推到 GitHub（代码托管网站） → 服务器从 GitHub 拉取最新代码 → 重新构建 → 网站就更新了。GitHub 相当于中转站。

### 流程图

```
你的电脑                GitHub              服务器 (47.97.204.202)
  │                      │                      │
  ├─ git push ──────────►│                      │
  │                      ├─ git pull ──────────►│
  │                      │                      ├─ npm run build
  │                      │                      ├─ pm2 restart
  │                      │                      └─ 刷新浏览器即生效
```

### 第 1 步：本地提交并推送（你的电脑上）

打开 **PowerShell** 或 **cmd**：

```powershell
cd D:\桌面\blog-XLab       # 进入项目目录

git add .                  # 把所有改动加入暂存区
                           # 新人理解：告诉 git "这些文件我要提交"

git commit -m "描述你改了什么"  # 创建一次提交（相当于保存一个快照）
                                # -m 后面引号里写备注，方便以后回顾

git push origin main       # 推送到 GitHub
                           # 新人理解：把本地提交同步到 GitHub 网站上
```

看到 `Writing objects: 100%` 表示推送成功。

> **什么是 Git / GitHub？** Git 是一个"版本控制"工具，能记录你每次修改了什么、谁改的、什么时候改的。GitHub 是一个网站，用来托管 Git 仓库，同时也作为本地和服务器之间的代码中转站。

### 第 2 步：服务器拉取代码

```bash
ssh root@47.97.204.202     # SSH 登录服务器
                           # 新人理解：远程连接到你的阿里云服务器

cd /home/deploy/blog-junior  # 进入服务器上的项目目录

git pull origin main       # 从 GitHub 拉取最新代码
                           # 新人理解：把 GitHub 上最新的代码下载到服务器
```

看到 `Updating xxxxx..yyyyy` 说明有新代码被拉下来了。

> 如果显示 `Already up to date`：说明第 1 步的 `git push` 没成功，回去检查。

### 第 3 步：重建构建

根据你改了什么，选对应的命令。**不确定就全量重建**：

```bash
# 全量重建（推荐，改什么都行）
cd /home/deploy/blog-junior/frontend && npm install --silent && npm run build && cd ../backend && npm install --silent && npm run build && pm2 restart blog-xlab-api
```

> **新人理解这条命令在做什么：**
> - `cd /home/deploy/blog-junior/frontend` — 进入前端目录
> - `npm install --silent` — 如果有新依赖就安装（没有也能正常跑）
> - `npm run build` — 编译 TypeScript + 打包前端资源 → 生成 `dist/` 目录
> - `cd ../backend` — 切换到后端目录
> - `npm run build` — 编译后端 TypeScript
> - `pm2 restart blog-xlab-api` — 重启后端进程，让新代码生效

按改动类型精简重建：

| 改了什么 | 执行什么 |
|---------|---------|
| 只改前端（页面、样式） | `cd /home/deploy/blog-junior/frontend && npm run build` |
| 只改后端（API） | `cd /home/deploy/blog-junior/backend && npm run build && pm2 restart blog-xlab-api` |
| 改了数据库结构 | `cd /home/deploy/blog-junior/backend && npx prisma generate && npx prisma db push && npm run build && pm2 restart blog-xlab-api` |

### 第 4 步：验证

```bash
# 后端健康检查
curl http://localhost:3001/api/health
# 正常返回 → {"status":"ok","timestamp":"..."}

# 首页是否返回
curl -s http://47.97.204.202/ | grep "<title>"
# 正常返回 → <title>chiiiiiiing's blog junior</title>

# 登录是否正常
curl -s -X POST http://47.97.204.202/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@blog-xlab.com","password":"admin123"}'
# 正常返回 → {"message":"登录成功","token":"...","user":{...}}
```

浏览器访问 `http://47.97.204.202`，**Ctrl+F5** 强制刷新（跳过浏览器缓存）。

### 常见故障

| 现象 | 可能原因 | 解决 |
|------|---------|------|
| `git push` 报 `Permission denied` | 没配 SSH Key | 见下方「配置 Git SSH Key」 |
| `git pull` 报 `Connection timed out` | 国内服务器连 GitHub 不稳定 | 多试几次，或用 scp 备选方案 |
| `Already up to date` 但代码确实改了 | 本地忘了 `git push` | 回到第 1 步 |
| `npm run build` 报编译错误 | 代码有 TypeScript 错误 | 看终端报错信息，修好后重新 push |
| 构建成功但浏览器没变化 | 浏览器缓存了旧页面 | Ctrl+F5 强制刷新 |
| 页面刷新后 404 | Nginx 配置问题 | 确认配置里有 `try_files $uri $uri/ /index.html;` |

### 备选方案：不用 GitHub，scp 直接传

如果服务器怎么都连不上 GitHub，在**本地 PowerShell** 用这一条命令上传 + 重建：

```powershell
scp -r D:\桌面\blog-XLab\frontend\src root@47.97.204.202:/home/deploy/blog-junior/frontend/ ; scp -r D:\桌面\blog-XLab\backend\src root@47.97.204.202:/home/deploy/blog-junior/backend/ ; ssh root@47.97.204.202 "cd /home/deploy/blog-junior/frontend && npm run build && cd ../backend && npm run build && pm2 restart blog-xlab-api"
```

> **新人理解**：`scp` 相当于通过 SSH 通道复制文件，把本地代码直接传到服务器上，绕过 GitHub。

---

## 5. 配置 Git SSH Key（让 git push/pull 不用输密码）

> **新人理解**：SSH Key 是一对"钥匙"——公钥放 GitHub，私钥在你电脑/服务器上。GitHub 看到你有对应的私钥，就允许你 push/pull，不用每次输密码。

### 5.1 在你本地电脑上

```powershell
# 生成 SSH 密钥（一路回车就行）
ssh-keygen -t ed25519 -C "your-email@example.com"

# 显示公钥
cat C:\Users\你的用户名\.ssh\id_ed25519.pub
```

复制输出的全部内容（以 `ssh-ed25519` 开头）。

1. 浏览器打开 https://github.com/settings/keys
2. 点 **New SSH key** → Title 随便写 → Key 粘贴 → **Add SSH key**

```powershell
# 测试是否配好
ssh -T git@github.com
# 看到 "Hi <你的用户名>!" 就是成功了

# 改本地仓库用 SSH 方式连接
cd D:\桌面\blog-XLab
git remote set-url origin git@github.com:chiiiiiiing/blog-junior.git
```

### 5.2 在服务器上也配（让服务器能 git pull）

```bash
ssh root@47.97.204.202

# 同样生成密钥
ssh-keygen -t ed25519 -C "server@blog-xlab"

# 显示公钥
cat ~/.ssh/id_ed25519.pub
```

同样把公钥加到 https://github.com/settings/keys（可以和本地是同一个公钥，也可以新建一个）。

```bash
# 测试
ssh -T git@github.com
# 看到 "Hi <用户名>!" 就 OK
```

---

## 6. GitHub OAuth 登录配置（用户用 GitHub 账号一键登录）

> **新人理解**：GitHub OAuth 就像一个"门禁系统"——用户在你的博客点「GitHub 登录」→ 跳转到 GitHub 授权页面 → 用户点同意 → GitHub 告诉你的博客"这人身份确认了" → 自动创建/登录账号。用户不用填邮箱密码。

### 6.1 创建 GitHub OAuth App

1. 浏览器登录 GitHub → 右上角头像 → **Settings**
2. 左侧菜单最下面 → **Developer settings** → **OAuth Apps**
3. 点 **New OAuth App**，填写：

| 字段 | 填写内容 | 说明 |
|------|---------|------|
| Application name | `chiiiiiiing's blog` | 随便起，会显示在 GitHub 授权页面上 |
| Homepage URL | `http://47.97.204.202` | 你的博客地址 |
| Authorization callback URL | `http://47.97.204.202/api/auth/github/callback` | **不能错**——GitHub 授权完后跳回这个地址 |

4. 点 **Register application**
5. 点 **Generate a new client secret** → 记下 **Client ID** 和 **Client Secret**（只显示一次！）

### 6.2 配置服务器环境变量

```bash
ssh root@47.97.204.202

# 告诉 PM2 这四个环境变量
pm2 restart blog-xlab-api --update-env \
  -e GITHUB_CLIENT_ID="你的ClientID" \
  -e GITHUB_CLIENT_SECRET="你的ClientSecret" \
  -e GITHUB_CALLBACK_URL="http://47.97.204.202/api/auth/github/callback" \
  -e FRONTEND_URL="http://47.97.204.202"
```

> **新人理解**：环境变量就是"藏在服务器上的配置"，代码里通过 `process.env.GITHUB_CLIENT_ID` 读取。不在代码里写死是为了安全——Client Secret 不能公开。

配好后，登录页会自动出现 **「GitHub 登录」** 按钮。没有配置时点击会提示"GitHub OAuth 未配置"，不影响邮箱密码登录。

### 6.3 本地开发时怎么测试

本地开发时 GitHub 回调地址不同，需要在 GitHub OAuth App 设置里**额外添加**一个 callback URL（或临时改成 localhost），然后在 `backend/.env` 里写入：

```
GITHUB_CLIENT_ID=你的ClientID
GITHUB_CLIENT_SECRET=你的ClientSecret
FRONTEND_URL=http://localhost:5173
```

重启后端 `npm run dev` 即可。

---

## 7. 自定义配置

### 7.1 修改友链

文件：`frontend/src/components/Blogroll.tsx`

```tsx
const LINKS = [
  { name: "轩神的blog", url: "https://haplotes405.xyz", desc: "" },
  // 照上面格式加新友链：
  // { name: "名称", url: "https://...", desc: "简介" },
];
```

修改后按第 4 章流程更新部署即可。

### 7.2 修改博客标题和副标题

文件：`frontend/src/pages/Home.tsx` 第 28-32 行附近。

### 7.3 修改网站图标 (favicon)

替换 `frontend/public/favicon.svg`，重新构建前端。

---

## 8. API 接口速查

| 方法 | 路径 | 需要登录 | 说明 |
|------|------|---------|------|
| GET | `/api/health` | 否 | 健康检查 |
| POST | `/api/auth/register` | 否 | 注册 |
| POST | `/api/auth/login` | 否 | 登录 |
| GET | `/api/auth/me` | 是 | 获取当前用户信息 |
| GET | `/api/auth/github` | 否 | GitHub OAuth 登录跳转 |
| GET | `/api/auth/github/callback` | 否 | GitHub OAuth 回调 |
| GET | `/api/posts?page=1&pageSize=10` | 否 | 文章列表（分页） |
| GET | `/api/posts?search=关键词` | 否 | 搜索文章 |
| GET | `/api/posts?tag=标签slug` | 否 | 按标签筛选 |
| GET | `/api/posts/:slug` | 否 | 文章详情 |
| POST | `/api/posts` | 管理员 | 创建文章 |
| PUT | `/api/posts/:id` | 管理员 | 更新文章 |
| DELETE | `/api/posts/:id` | 管理员 | 删除文章 |
| POST | `/api/posts/upload-md` | 管理员 | 上传 .md 文件 |
| POST | `/api/posts/:id/comments` | 是 | 发表评论 |
| DELETE | `/api/comments/:id` | 是 | 删除评论 |
| POST | `/api/posts/:id/like` | 是 | 点赞/取消 |
| GET | `/api/tags` | 否 | 获取所有标签 |
| POST | `/api/tags` | 管理员 | 创建标签 |

---

## 9. 设计亮点

- **Optimistic UI 点赞**：点击立刻显示效果，失败自动回滚——用户感觉不到延迟
- **JWT 双重中间件**：`requireAuth`（未登录拒绝）和 `optionalAuth`（可选的登录识别），权限粒度精确
- **Markdown 双栏编辑器**：左边写 Markdown，右边实时预览，所见即所得
- **article TOC 自动目录**：文章中的标题自动生成侧边栏目录导航，点击可跳转
- **标签系统**：文章可打标签，首页可按标签筛选
- **搜索功能**：支持按标题和正文关键词搜索
- **级联删除**：删除文章自动清理关联的评论和点赞
- **数据库层面防重复点赞**：联合唯一索引保证同一用户对同一文章只能点赞一次
- **拖拽上传 .md**：管理后台可直接拖入 Markdown 文件，自动提取标题生成文章
