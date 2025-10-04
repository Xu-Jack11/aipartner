# 模型列表动态刷新功能实现总结

## 功能概述

为聊天页面添加了动态获取和刷新 AI 模型列表的功能，支持自动加载和手动刷新。

## 实现的功能

✅ **自动加载模型列表** - 进入聊天页面时自动从 API 获取可用模型
✅ **手动刷新按钮** - 在模型选择器旁边添加刷新按钮
✅ **加载状态显示** - 刷新时显示加载动画
✅ **错误处理** - 优雅处理 API 调用失败的情况
✅ **默认模型选择** - 自动选择第一个可用模型

## 新增文件

### 1. 前端 API 客户端 (`src/lib/api/models.ts`)

```typescript
export type ModelInfo = {
  readonly id: string;
  readonly object: string;
  readonly created: number;
  readonly owned_by: string;
};

export type ModelsResponse = {
  readonly object: string;
  readonly data: readonly ModelInfo[];
};

export const fetchModels = (accessToken: string): Promise<ModelsResponse>;
```

**功能**：封装了获取模型列表的 API 调用

### 2. 自定义 Hook (`src/lib/hooks/use-models.ts`)

```typescript
export type ModelOption = {
  readonly label: string;
  readonly value: string;
};

export const useModels = () => {
  // 返回: { data, error, refetch, status }
};
```

**功能**：
- 管理模型列表的状态
- 自动在组件挂载时获取模型列表
- 提供 refetch 函数用于手动刷新
- 将 API 响应转换为 Select 组件需要的格式

### 3. 后端服务 (`apps/server/src/ai/ai.service.ts`)

```typescript
@Injectable()
export class AiService {
  async getAvailableModels(): Promise<ModelsResponse>;
}
```

**功能**：
- 调用 OpenAI 兼容的 `/models` API 端点
- 支持自定义 baseURL
- 处理 API 调用错误
- 无 API 密钥时返回空列表

### 4. 后端控制器 (`apps/server/src/ai/ai.controller.ts`)

```typescript
@Controller("ai")
@UseGuards(JwtAuthGuard)
export class AiController {
  @Get("models")
  getModels();
}
```

**功能**：
- 提供 `GET /api/ai/models` 端点
- 需要 JWT 认证
- 返回可用模型列表

## 修改的文件

### `src/app/chat/page.tsx`

**主要变更**：

1. **导入新的依赖**
   - 添加 `ReloadOutlined` 图标
   - 添加 `Tooltip` 组件
   - 添加 `useModels` hook

2. **移除硬编码的模型列表**
   ```typescript
   // 删除了
   const modelOptions = [
     { label: "GPT-4o", value: "gpt-4o" },
     { label: "Claude 3.5", value: "claude-3.5" },
   ];
   ```

3. **更新 ChatComposer 组件**
   - 添加 `modelOptions` 属性（从父组件传入）
   - 添加 `onRefreshModels` 回调函数
   - 添加 `isRefreshingModels` 状态标志
   - 在模型选择器旁边添加刷新按钮

4. **更新 ChatContent 组件**
   - 使用 `useModels()` hook 获取模型列表
   - 自动设置默认模型
   - 传递模型数据和刷新函数给 ChatComposer

### `apps/server/src/ai/ai.module.ts`

**主要变更**：
- 添加 `AiController` 到 controllers 数组
- 添加 `AiService` 到 providers 数组

## API 端点

### `GET /api/ai/models`

**认证**：需要 JWT Token

**请求头**：
```
Authorization: Bearer <token>
```

**响应格式**：
```json
{
  "object": "list",
  "data": [
    {
      "id": "gpt-4o",
      "object": "model",
      "created": 1677610602,
      "owned_by": "openai"
    },
    {
      "id": "gpt-4o-mini",
      "object": "model",
      "created": 1677610602,
      "owned_by": "openai"
    }
  ]
}
```

## 用户体验

### 进入聊天页面时
1. 自动发起 API 请求获取模型列表
2. 显示加载状态（如果获取较慢）
3. 成功后自动选择第一个可用模型
4. 如果失败，使用空列表（不影响其他功能）

### 点击刷新按钮时
1. 刷新图标旋转显示加载状态
2. 按钮变为禁用状态防止重复点击
3. 重新获取最新的模型列表
4. 更新选择器中的选项

## 兼容性

该功能支持所有 OpenAI 兼容的 API，包括：
- OpenAI 官方 API
- Azure OpenAI
- DeepSeek API
- 其他 OpenAI 兼容服务

只需配置正确的 `OPENAI_BASE_URL` 环境变量即可。

## 错误处理

1. **无 API 密钥**：返回空列表，不影响应用运行
2. **API 调用失败**：在控制台记录错误，返回空列表
3. **网络错误**：Hook 捕获错误，可以在 UI 中显示错误信息

## 后续优化建议

1. **缓存模型列表** - 避免频繁请求
2. **模型分类** - 按类型或用途分组显示
3. **模型详情** - 显示模型的能力和限制
4. **智能推荐** - 根据对话内容推荐合适的模型
5. **模型过滤** - 允许用户过滤或收藏常用模型
