# LLM API Base URL 配置指南

本项目支持自定义 LLM API 的 Base URL,让你可以使用兼容 OpenAI API 的第三方服务。

## 🚀 快速开始

### 1. 配置环境变量

在项目根目录的 `.env` 文件中添加:

```bash
# OpenAI API Key (必需)
OPENAI_API_KEY=sk-your-api-key-here

# OpenAI Base URL (可选)
# 不设置则默认使用 OpenAI 官方 API: https://api.openai.com
OPENAI_BASE_URL=https://your-custom-endpoint.com
```

### 2. 重启服务

```bash
# 重启后端服务
pnpm server:dev

# 或重启完整开发环境
pnpm dev
```

## 📝 支持的服务示例

### OpenAI 官方 (默认)
```bash
# 不设置 OPENAI_BASE_URL,或设置为:
OPENAI_BASE_URL=https://api.openai.com
```

### DeepSeek
```bash
OPENAI_BASE_URL=https://api.deepseek.com
OPENAI_API_KEY=your-deepseek-api-key
```

### Moonshot AI (Kimi)
```bash
OPENAI_BASE_URL=https://api.moonshot.cn
OPENAI_API_KEY=your-moonshot-api-key
```

### 智谱 AI (ChatGLM)
```bash
OPENAI_BASE_URL=https://open.bigmodel.cn/api/paas
OPENAI_API_KEY=your-zhipu-api-key
```

### 自托管代理
```bash
OPENAI_BASE_URL=https://your-proxy.example.com
OPENAI_API_KEY=sk-your-key
```

## 🔧 技术细节

### 实现原理

项目使用 Vercel AI SDK 和原生 OpenAI Provider 两种实现:

1. **Vercel AI Provider** (默认)
   - 文件: `apps/server/src/ai/providers/vercel-ai.provider.ts`
   - 通过 `createOpenAI({ baseURL })` 配置

2. **OpenAI Provider** (备用)
   - 文件: `apps/server/src/ai/providers/openai.provider.ts`
   - 通过 fetch URL 配置: `${baseUrl}/v1/chat/completions`

### 配置优先级

```
环境变量 OPENAI_BASE_URL → 配置服务 → AI Provider
```

### 兼容性

支持所有兼容 OpenAI Chat Completions API 的服务:
- ✅ 标准端点: `/v1/chat/completions`
- ✅ 标准请求格式: messages, model, temperature 等
- ✅ 标准响应格式: choices, usage, content

## 🛠️ 故障排查

### 问题 1: API 调用失败

**检查项:**
1. Base URL 是否正确 (不要包含 `/v1/chat/completions`)
2. API Key 是否有效
3. 网络连接是否正常
4. 服务商是否支持你使用的模型

**查看日志:**
```bash
# 后端日志会显示使用的 Base URL
[VercelAiProvider] Using custom OpenAI base URL: https://...
```

### 问题 2: 模型不支持

不同服务商支持的模型不同:

- **OpenAI**: gpt-4o, gpt-4o-mini, gpt-4-turbo 等
- **DeepSeek**: deepseek-chat, deepseek-coder
- **Moonshot**: moonshot-v1-8k, moonshot-v1-32k, moonshot-v1-128k
- **智谱**: glm-4, glm-4-air, glm-3-turbo

在前端选择对应服务商支持的模型。

### 问题 3: 响应格式错误

确保第三方服务完全兼容 OpenAI API 格式。查看服务商文档确认兼容性。

## 📚 相关文件

- 类型定义: `apps/server/src/types.ts`
- 环境配置: `apps/server/src/config/env.ts`
- Vercel AI Provider: `apps/server/src/ai/providers/vercel-ai.provider.ts`
- OpenAI Provider: `apps/server/src/ai/providers/openai.provider.ts`
- AI 模块: `apps/server/src/ai/ai.module.ts`

## 🔐 安全建议

1. ⚠️ **不要**将 `.env` 文件提交到 Git
2. ✅ 使用 `.env.example` 作为模板
3. ✅ 在生产环境使用环境变量或密钥管理服务
4. ✅ 定期轮换 API Keys

## 💡 高级用法

### 切换不同的 AI 提供商

编辑 `apps/server/src/ai/ai.module.ts`:

```typescript
// 使用 Vercel AI Provider (推荐)
return new VercelAiProvider(configService);

// 或使用原生 OpenAI Provider
return new OpenAiProvider(configService);
```

### 添加新的 AI 提供商

参考 `vercel-ai.provider.ts` 实现 `AiProvider` 接口:

```typescript
@Injectable()
export class CustomAiProvider extends AiProvider {
  async generateCompletion(
    options: AiCompletionOptions
  ): Promise<AiCompletionResult> {
    // 你的实现
  }
}
```

## 📄 许可

本配置遵循项目主许可证。使用第三方 AI 服务时请遵守各服务商的使用条款。
