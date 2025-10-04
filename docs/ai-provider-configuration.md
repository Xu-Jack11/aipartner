# AI Provider 配置指南

本项目使用 Vercel AI SDK 作为 AI 提供商，支持灵活的配置选项。

## ⚠️ 重要提示

**baseURL 配置说明：**

- ✅ 正确: `OPENAI_BASE_URL=https://api.deepseek.com/v1` 
- ❌ 错误: `OPENAI_BASE_URL=https://api.deepseek.com` (缺少 /v1)

baseURL 应该包含完整的 API 版本路径（通常是 `/v1`），SDK 会在此基础上添加具体的端点路径（如 `/chat/completions`）。

**API 端点说明：**
- 本项目使用 `openai.chat()` 方法，调用标准的 Chat Completions API
- 最终请求 URL: `{baseURL}/chat/completions`
- 例如: `https://api.deepseek.com/v1/chat/completions`

## 环境变量配置

在项目根目录的 `.env` 文件中配置以下环境变量：

### 基本配置

```env
# OpenAI API 密钥（必需）
OPENAI_API_KEY=your_openai_api_key_here
```

### 自定义 API 端点（可选）

如果你想使用自定义的 OpenAI 兼容 API 端点（如 Azure OpenAI、代理服务器或其他 OpenAI 兼容服务），可以配置 `OPENAI_BASE_URL`：

```env
# 自定义 API 端点（注意：应该包含 /v1 路径）
OPENAI_BASE_URL=https://your-custom-endpoint.com/v1
```

## 使用场景

### 1. 使用官方 OpenAI API

```env
OPENAI_API_KEY=sk-proj-xxx...
OPENAI_BASE_URL=https://api.openai.com/v1
# 或者不设置 OPENAI_BASE_URL，将自动使用官方端点
```

### 2. 使用 DeepSeek API

```env
OPENAI_API_KEY=sk-xxx...
OPENAI_BASE_URL=https://api.deepseek.com/v1
```

**可用模型:** `deepseek-chat`, `deepseek-reasoner`

### 3. 使用 Azure OpenAI

```env
OPENAI_API_KEY=your_azure_api_key
OPENAI_BASE_URL=https://your-resource-name.openai.azure.com/openai/deployments/your-deployment-name
```

### 4. 使用自建代理或第三方服务

```env
OPENAI_API_KEY=your_api_key
OPENAI_BASE_URL=https://api.your-proxy.com/v1
```

### 5. 使用国内 OpenAI 兼容服务

**Moonshot AI (Kimi):**
```env
OPENAI_API_KEY=sk-xxx...
OPENAI_BASE_URL=https://api.moonshot.cn/v1
```

**智谱 AI (GLM):**
```env
OPENAI_API_KEY=xxx.xxx
OPENAI_BASE_URL=https://open.bigmodel.cn/api/paas/v4
```

**阿里云通义千问:**
```env
OPENAI_API_KEY=sk-xxx...
OPENAI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
```

### 6. 使用本地 LLM 服务

**LocalAI, Ollama (OpenAI compatible), vLLM:**

```env
OPENAI_API_KEY=your_api_key
OPENAI_BASE_URL=http://localhost:8080/v1
```

## 技术实现

项目使用 Vercel AI SDK 的 `createOpenAI` 函数来初始化 AI 客户端：

```typescript
const openai = createOpenAI({
  apiKey,
  baseURL: baseUrl, // 可选，如果未设置则使用默认的 OpenAI 端点
});
```

## 兼容性

`OPENAI_BASE_URL` 配置支持任何符合 OpenAI API 规范的服务，包括但不限于：

- OpenAI 官方 API
- Azure OpenAI Service
- 各类 OpenAI 代理服务
- 自建的 OpenAI 兼容服务
- LocalAI、FastChat 等本地部署方案
- 其他第三方 OpenAI 兼容 API

## 注意事项

1. **API 密钥安全**：请勿将 API 密钥提交到版本控制系统中
2. **端点格式**：baseURL 应该是完整的 URL，包括协议（https://）
3. **路径规范**：不同服务可能需要不同的路径格式，请参考相应服务的文档
4. **模型名称**：使用自定义端点时，确保使用的模型名称在目标服务中可用

## 示例配置文件

创建 `.env.example` 文件作为模板：

```env
# OpenAI Configuration
OPENAI_API_KEY=your_api_key_here

# Optional: Custom API Endpoint
# OPENAI_BASE_URL=https://your-custom-endpoint.com/v1

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# JWT Configuration
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=1h
```
