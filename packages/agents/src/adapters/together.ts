import { OpenAICompatibleAdapter } from "./openai-compatible";

export class TogetherAdapter extends OpenAICompatibleAdapter {
  constructor(apiKey: string) {
    super("together", "Together AI", apiKey, "https://api.together.xyz/v1", [
      "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
      "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
      "mistralai/Mixtral-8x7B-Instruct-v0.1",
      "Qwen/Qwen2.5-72B-Instruct-Turbo",
      "deepseek-ai/DeepSeek-R1",
    ]);
  }
}
