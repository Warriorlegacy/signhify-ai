import { OpenAICompatibleAdapter } from "./openai-compatible";

export class MistralAdapter extends OpenAICompatibleAdapter {
  constructor(apiKey: string) {
    super("mistral", "Mistral AI", apiKey, "https://api.mistral.ai/v1", [
      "mistral-small-latest",
      "open-mistral-nemo",
      "mistral-tiny",
      "mistral-medium-latest",
      "mistral-large-latest",
    ]);
  }
}
