import { Injectable } from "@nestjs/common";
import type {
  AiCompletionOptions,
  AiCompletionResult,
} from "./ai-provider.interface";
import { AiProvider } from "./ai-provider.interface";
import { prepareMessagesWithTooling } from "./tool-preparation";

const MOCK_DELAY_MS = 1000;
const MOCK_TOKENS_PER_MESSAGE = 50;

@Injectable()
export class MockAiProvider extends AiProvider {
  async generateCompletion(
    options: AiCompletionOptions
  ): Promise<AiCompletionResult> {
    // Mock implementation for development
    const augmentedMessages = await prepareMessagesWithTooling(options);

    const userMessage = augmentedMessages
      .filter((msg) => msg.role === "user")
      .at(-1);

    const responseContent = userMessage
      ? `这是一个模拟回复。您说：${userMessage.content}`
      : "您好！我是AI学习助手，很高兴为您服务。";

    // Simulate API delay
    await new Promise((resolve) => {
      setTimeout(resolve, MOCK_DELAY_MS);
    });

    return {
      content: responseContent,
      tokens: options.messages.length * MOCK_TOKENS_PER_MESSAGE,
    };
  }
}
