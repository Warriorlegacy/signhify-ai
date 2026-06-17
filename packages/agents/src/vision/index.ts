import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

export interface VisionInput {
  task: string;
  imageDescription?: string;
}

export async function runVisionAgent(
  input: VisionInput,
  apiKeys: { gemini: string },
  onToken: (token: string) => void,
) {
  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
    apiKey: apiKeys.gemini,
    streaming: true,
  });

  const systemPrompt = `You are Vision, the image intelligence agent of Signhify AI.
You analyze images, extract text (OCR), read screenshots, and describe visual content.

When given an image description or analysis task:
1. Be thorough and detailed in your analysis
2. If extracting text, preserve the original formatting
3. If describing a scene, be objective and specific
4. If asked about charts/diagrams, explain the data visually

Note: You are working with image descriptions provided by the user. For actual image file analysis, the user would need to upload the image.`;

  const userMessage = input.imageDescription
    ? `Task: ${input.task}\n\nImage context: ${input.imageDescription}`
    : input.task;

  const stream = await model.stream([
    { role: "system", content: systemPrompt },
    { role: "user", content: userMessage },
  ]);

  let fullResponse = "";
  for await (const chunk of stream) {
    const token = chunk.content as string;
    onToken(token);
    fullResponse += token;
  }
  return fullResponse;
}
