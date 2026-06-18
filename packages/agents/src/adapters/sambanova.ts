import { OpenAICompatibleAdapter } from "./openai-compatible";

export class SambaNovaAdapter extends OpenAICompatibleAdapter {
  constructor(apiKey: string) {
    super("sambanova", "SambaNova", apiKey, "https://api.sambanova.ai/v1", [
      "Meta-Llama-3.1-8B-Instruct",
      "DeepSeek-R1-Distill-Llama-70B",
      "Meta-Llama-3.1-70B-Instruct",
      "QwQ-32B",
    ]);
  }
}
