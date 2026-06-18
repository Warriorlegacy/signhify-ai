import { OpenAICompatibleAdapter } from "./openai-compatible";

export class CerebrasAdapter extends OpenAICompatibleAdapter {
  constructor(apiKey: string) {
    super("cerebras", "Cerebras", apiKey, "https://api.cerebras.ai/v1", [
      "llama3.1-8b",
      "llama3.1-70b",
      "llama-3.3-70b",
    ]);
  }
}
