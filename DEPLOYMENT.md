# AI Partner 部署教程

本项目是一个基于 Next.js + NestJS + Prisma + PostgreSQL 构建的 AI 学习伙伴应用。本教程将指导您如何配置数据库并部署整个应用。

## 1. 环境准备

在开始之前，请确保您的服务器或本地环境已安装以下软件：

- **Node.js**: v20 或更高版本
- **PNPM**: 建议使用最新版本 (`npm install -g pnpm`)
- **PostgreSQL**: 16 或更高版本 (也可以使用 Docker 部署)
- **Docker & Docker Compose**: (可选，推荐用于快速启动数据库)

## 2. 数据库配置

本项目使用 Prisma ORM 连接 PostgreSQL 数据库。

### 方式 A：使用 Docker Compose (推荐)

我们在项目根目录提供了 `docker-compose.yml`，可以一键启动数据库：

```bash
docker compose up -d
```

这将启动一个 PostgreSQL 容器，默认配置：
- **地址**: `localhost:5432`
- **数据库名**: `aipartner`
- **用户名**: `postgres`
- **密码**: `postgres`

### 方式 B：使用本地/云数据库

如果您有现成的 PostgreSQL 数据库，请确保：
1. 创建一个名为 `aipartner` 的数据库。
2. 记录数据库连接字符串 (URL)。

## 3. 环境变量配置

在项目根目录创建 `.env` 文件（可以从 `.env.example` 复制）：

```bash
cp .env.example .env
```

编辑 `.env` 文件，填入必要的配置：

```env
# 数据库配置
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/aipartner"

# JWT 配置 (用于身份验证，请修改为随机长字符串)
JWT_SECRET="your-secret-key-here"
JWT_EXPIRES_IN="7d"

# OpenAI/AI 服务配置
OPENAI_API_KEY="sk-your-openai-api-key"
# 如果使用代理或国内加速服务，请配置 Base URL (不带 /v1)
# OPENAI_BASE_URL="https://api.openai.com"
```

> **注意**: 默认情况下，前端运行在 3000 端口，后端运行在 3001 端口。

## 4. 安装与初始化

### 4.1 安装依赖
```bash
pnpm install
```

### 4.2 初始化数据库结构
使用 Prisma 同步数据库模型并生成客户端：
```bash
# 生成 Prisma Client
pnpm prisma:generate

# 推送数据库结构并运行种子数据 (如果是首次部署)
npx prisma db push
pnpm prisma:seed
```

## 5. 运行应用

### 开发模式 (Development)
同时启动前端和后端进行开发：
```bash
# 启动前端 (Next.js, 默认访问 http://localhost:3000)
pnpm dev

# 启动后端 (NestJS, 默认访问 http://localhost:3001, 在另一个终端)
pnpm server:dev
```

### 生产模式 (Production)
编译并部署：
1. **构建项目**:
   ```bash
   # 构建前端
   pnpm build
   # 构建后端
   pnpm server:build
   ```

2. **启动服务**:
   ```bash
   # 启动前端
   pnpm start

   # 启动后端 (在另一个终端)
   pnpm server:start
   ```

## 6. 常见问题 (FAQ)

- **Q: 无法连接数据库？**
  A: 请检查 `.env` 中的 `DATABASE_URL` 是否正确。如果使用 Docker，请确保容器已运行 (`docker ps`)。
- **Q: AI 回复报错？**
  A: 检查 `OPENAI_API_KEY` 是否有效。如果使用中转 API，请务必设置 `OPENAI_BASE_URL`。
- **Q: 端口冲突？**
  A: 如果 3000 或 3001 端口被占用，可以通过修改环境变量 `PORT` 来更改后端端口，或使用 `pnpm dev -- -p <PORT>` 更改前端端口。

---

如果遇到其他问题，请查阅 [README.md](./README.md) 或提交反馈。
