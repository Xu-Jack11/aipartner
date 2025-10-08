# AI 学习搭子 - 技术路径与实现方法概述

> 这是 [repository-technical-report.md](./repository-technical-report.md) 的精简版本，提供快速了解项目的技术概览。

## 🎯 项目简介

**AI 学习搭子** 是一个智能学习辅助平台，结合 Next.js 15 前端和 NestJS 后端，提供：

- 💬 **AI 智能对话** - 多轮对话，知识答疑
- 📋 **学习计划生成** - AI 自动生成结构化学习计划
- 📊 **进度追踪** - 学习时长统计、连续天数计算
- 🎓 **学习总览** - 综合学习数据分析

## 🏗️ 技术架构

### 整体架构

```
前端 (Next.js 15)  ←→  后端 (NestJS 10)  ←→  数据库 (PostgreSQL)
  React 19              REST API              Prisma ORM
  Ant Design            JWT 认证              关系型数据
  TypeScript            模块化设计            索引优化
```

### 核心技术栈

| 层级 | 技术选型 |
|------|---------|
| **前端** | Next.js 15 + React 19 + Ant Design 5 + Tailwind CSS 4 |
| **后端** | NestJS 10 + Express + Passport JWT + Prisma 6 |
| **AI** | Vercel AI SDK + OpenAI 兼容 API |
| **数据库** | PostgreSQL + Prisma ORM |
| **语言** | TypeScript 5 (全栈) |
| **代码质量** | Ultracite (Biome) + Husky |
| **包管理** | pnpm |

## 📦 功能模块

### 1. 认证模块 (Authentication)
- **技术**: JWT + bcryptjs + Passport.js
- **功能**: 用户注册、登录、Token 验证
- **安全**: 密码加密、Token 过期管理

### 2. AI 对话模块 (Dialogue)
- **技术**: Vercel AI SDK + 会话管理
- **功能**: 
  - 创建对话会话
  - 多轮对话上下文管理
  - AI 回复生成和存储
  - Markdown 消息渲染
- **特色**: 支持多种 OpenAI 兼容 API

### 3. 学习计划模块 (Planning)
- **技术**: AI 生成 + 任务管理
- **功能**:
  - 从对话生成学习计划
  - 计划拆分为可执行任务
  - 任务状态管理 (todo/in-progress/done)
  - 进度跟踪
- **特色**: AI 驱动的计划生成

### 4. 进度追踪模块 (Progress)
- **技术**: 学习记录 + 统计分析
- **功能**:
  - 记录学习会话（时长、主题）
  - 连续学习天数算法
  - 学习统计（本周/本月时长）
  - 学习趋势可视化
- **特色**: 智能连续天数计算

### 5. 学习总览模块 (Learning)
- **技术**: 数据聚合
- **功能**: 综合展示进度、计划、对话数据
- **特色**: 一站式学习状态视图

### 6. AI 模型管理 (AI Models)
- **技术**: 动态模型列表
- **功能**: 获取可用 AI 模型、支持刷新
- **特色**: 支持多 AI 提供商

## 🗄️ 数据库设计

### 核心表结构

```
User (用户)
 ├── Session (对话会话)
 │    └── ChatMessage (消息记录)
 ├── Plan (学习计划)
 │    └── Task (任务)
 ├── StudySession (学习记录)
 └── ProgressSnapshot (进度快照)
```

### 关键特性
- ✅ 外键约束保证数据一致性
- ✅ 复合索引优化查询性能
- ✅ 级联删除自动清理关联数据
- ✅ UUID 主键避免冲突

## 🎨 前端架构

### 目录结构
```
src/
├── app/                    # Next.js App Router
│   ├── login/              # 登录页
│   ├── chat/               # 对话页
│   ├── plan/               # 计划页
│   ├── progress/           # 进度页
│   └── persona/            # 总览页
├── lib/
│   ├── api/                # API 客户端
│   └── hooks/              # 自定义 Hooks
└── types/                  # 类型定义
```

### 设计特点
- 📱 响应式设计（支持平板和桌面）
- ♿ 无障碍性 (a11y) 支持
- 🎯 类型安全（全量 TypeScript）
- 🚀 性能优化（Turbopack + Server Components）

## 🔧 后端架构

### 模块结构
```
apps/server/src/
├── auth/           # 认证模块
├── ai/             # AI 服务模块
├── dialogue/       # 对话模块
├── planning/       # 计划模块
├── progress/       # 进度模块
├── learning/       # 学习总览模块
├── users/          # 用户模块
└── prisma/         # 数据库模块
```

### 架构模式
- 🏗️ **三层架构**: Controller → Service → Repository
- 💉 **依赖注入**: NestJS DI 容器
- 🎯 **单一职责**: 每个模块专注一个业务域
- 🔒 **JWT 守卫**: 统一认证保护

## 🤖 AI 服务集成

### 支持的 AI 提供商
- OpenAI (官方 API)
- DeepSeek
- Azure OpenAI
- Moonshot AI (Kimi)
- 智谱 AI (GLM)
- 阿里云通义千问
- LocalAI / Ollama
- 其他 OpenAI 兼容服务

### 配置方式
```env
OPENAI_API_KEY=your_api_key
OPENAI_BASE_URL=https://api.provider.com/v1  # 可选
```

### 设计模式
- 🎨 **策略模式**: 抽象 AI Provider 接口
- 🔌 **可插拔**: 易于添加新的 AI 提供商
- 📡 **流式响应**: 支持实时输出

## 📊 核心算法

### 连续学习天数计算

```typescript
// 算法逻辑：从最近一次学习日期往前查找
// 遇到中断（相邻日期差 > 1 天）则停止计数
// 时间复杂度: O(n)

const sessions = await prisma.studySession.findMany({
  where: { userId },
  orderBy: { recordedAt: 'desc' }
});

let streak = 0;
let lastDate = null;

for (const session of sessions) {
  const currentDate = dayjs(session.recordedAt).startOf('day');
  
  if (!lastDate) {
    streak = 1;
    lastDate = currentDate;
  } else {
    const daysDiff = lastDate.diff(currentDate, 'day');
    if (daysDiff === 1) {
      streak++;
      lastDate = currentDate;
    } else {
      break;  // 中断则停止
    }
  }
}
```

## 🔐 安全设计

### 认证与授权
- 🔑 JWT Token 认证
- 🔒 密码 bcrypt 加密 (salt rounds: 10)
- 👤 用户数据隔离（所有查询自动过滤 userId）
- ⏰ Token 过期时间控制

### 输入验证
- ✅ class-validator 自动验证
- 🛡️ Prisma 参数化查询防 SQL 注入
- 🚫 XSS 防护（前端转义）

### 环境变量
- 🔐 敏感信息不提交到 Git
- 📝 使用 .env.example 作为模板
- 🏭 生产环境强制密钥配置

## 🚀 性能优化

### 数据库优化
- 📈 复合索引优化查询
- 🔍 Prisma select 减少查询字段
- 📄 分页查询避免大量数据加载

### 前端优化
- ⚡ Turbopack 极速构建
- 🎯 代码分割自动优化
- 🖼️ Next.js Image 组件优化

### API 优化
- 🔄 数据库连接池
- ⚡ 异步非阻塞处理
- 🎭 乐观 UI 更新

## 📈 代码质量

### 代码规范
- ✨ Ultracite (Biome) 代码检查
- 📏 TypeScript 严格模式
- ♿ 无障碍性 (a11y) 规则
- 🎨 统一代码格式

### 类型安全
- 💯 全栈 TypeScript
- 🎯 端到端类型推断
- 🚨 编译时错误检测

### Git Hooks
- 🎣 Husky 预提交检查
- ✅ 代码格式化验证
- 🔍 TypeScript 类型检查

## 🛠️ 开发流程

### 启动项目
```bash
# 安装依赖
pnpm install

# 数据库迁移
pnpm prisma:generate
pnpm prisma migrate dev

# 启动后端 (http://localhost:4000)
pnpm server:dev

# 启动前端 (http://localhost:3000)
pnpm dev
```

### 代码检查
```bash
# 检查代码质量
pnpm ultracite check

# 自动修复
pnpm ultracite fix
```

### 构建生产版本
```bash
# 构建前端
pnpm build

# 构建后端
pnpm server:build

# 启动服务
pnpm start              # 前端
pnpm server:start       # 后端
```

## 📚 API 端点总览

| 模块 | 端点 | 功能 |
|------|------|------|
| **Auth** | `POST /api/v1/auth/register` | 用户注册 |
| | `POST /api/v1/auth/login` | 用户登录 |
| | `GET /api/v1/auth/profile` | 获取用户信息 |
| **AI** | `GET /api/v1/ai/models` | 获取模型列表 |
| **Dialogue** | `POST /api/v1/dialogue/sessions` | 创建会话 |
| | `GET /api/v1/dialogue/sessions` | 获取会话列表 |
| | `POST /api/v1/dialogue/sessions/:id/messages` | 发送消息 |
| **Planning** | `GET /api/v1/plans` | 获取计划列表 |
| | `POST /api/v1/plans/generate` | AI 生成计划 |
| | `PATCH /api/v1/plans/:id/tasks/:taskId` | 更新任务状态 |
| **Progress** | `POST /api/v1/progress/sessions` | 记录学习会话 |
| | `GET /api/v1/progress/stats` | 获取统计数据 |
| | `GET /api/v1/progress/trend` | 获取趋势数据 |
| **Learning** | `GET /api/v1/learning/summary` | 获取学习总览 |

## ✨ 项目亮点

### 架构设计
- ✅ 清晰的三层架构，职责明确
- ✅ 模块化设计，低耦合高内聚
- ✅ 依赖注入，易于测试和扩展
- ✅ 类型安全，端到端 TypeScript

### 功能实现
- ✅ AI 驱动的学习计划生成
- ✅ 智能进度追踪和分析
- ✅ 多 AI 提供商支持
- ✅ 乐观 UI 更新，快速响应

### 代码质量
- ✅ 企业级代码规范
- ✅ 严格的类型检查
- ✅ 无障碍性支持
- ✅ 完善的错误处理

### 用户体验
- ✅ 响应式设计，多设备适配
- ✅ Markdown + 代码高亮
- ✅ 加载状态提示
- ✅ 流畅的交互体验

## 🎯 未来规划

### 短期计划
- [ ] 添加单元测试和集成测试
- [ ] 完善 API 文档 (Swagger)
- [ ] 添加日志记录和监控
- [ ] 实现请求限流

### 中期计划
- [ ] 多租户 SaaS 架构
- [ ] 知识库管理功能
- [ ] 向量数据库集成 (RAG)
- [ ] 移动端适配

### 长期计划
- [ ] 微服务拆分
- [ ] Service Mesh 集成
- [ ] 多模态 AI (语音/图像)
- [ ] 社交学习功能

## 📖 相关文档

- 📄 [完整技术报告](./repository-technical-report.md) - 详细的技术实现说明
- 📋 [API 参考文档](./api-reference.md) - 完整 API 端点文档
- 🔧 [API 客户端文档](./api-clients.md) - 前端 API 使用指南
- 💬 [对话功能实现](./dialogue-implementation-summary.md) - 对话模块详解
- 📊 [进度模块实现](./progress-module-implementation.md) - 进度追踪详解
- 🤖 [AI 提供商配置](./ai-provider-configuration.md) - AI 服务配置指南

## 📊 项目统计

- **代码规模**: ~2700+ 行核心代码
- **技术栈**: 10+ 核心技术
- **功能模块**: 6 大核心模块
- **API 端点**: 20+ 个 REST 端点
- **数据表**: 7 个核心数据表
- **类型安全**: 100% TypeScript

## 🎓 适用场景

本项目架构适用于：
- 🎓 在线教育平台
- 🤖 AI 对话应用
- 📊 学习管理系统
- 🧠 知识管理工具
- 💬 智能客服系统
- 📝 内容生成平台

---

**更新时间**: 2025-01
**文档版本**: v1.0
**项目状态**: ✅ 核心功能已完成

---

> 💡 **提示**: 查看 [repository-technical-report.md](./repository-technical-report.md) 获取更详细的技术实现说明和代码示例。
