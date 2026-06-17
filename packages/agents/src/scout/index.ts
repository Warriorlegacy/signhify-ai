import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

export interface ScoutInput {
  query: string;
  maxResults?: number;
}

export interface ScoutResult {
  answer: string;
  sources: Array<{ title: string; url: string; snippet: string }>;
}

export async function runScoutAgent(
  input: ScoutInput,
  apiKeys: { gemini: string; tavily: string },
  onToken: (token: string) => void,
): Promise<ScoutResult> {
  const searchTool = new TavilySearchResults({
    apiKey: apiKeys.tavily,
    maxResults: input.maxResults ?? 5,
  });

  const rawResults = await searchTool.invoke(input.query);
  const results = JSON.parse(rawResults) as Array<{
    title: string;
    url: string;
    content: string;
  }>;

  const sourcesContext = results
    .map((r, i) => `[${i + 1}] ${r.title}\nURL: ${r.url}\n${r.content}`)
    .join("\n\n");

  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
    apiKey: apiKeys.gemini,
    streaming: true,
  });

  const systemPrompt = `You are Scout, the research agent of Signhify AI.
Synthesize the search results into a clear, accurate, well-cited answer.
Reference sources as [1], [2], etc. Be factual. Do not add information not in the sources.`;

  const userMessage = `Query: ${input.query}\n\nSearch results:\n${sourcesContext}\n\nProvide a comprehensive answer with citations.`;

  let answer = "";
  const stream = await model.stream([
    { role: "system", content: systemPrompt },
    { role: "user", content: userMessage },
  ]);

  for await (const chunk of stream) {
    const token = chunk.content as string;
    onToken(token);
    answer += token;
  }

  return {
    answer,
    sources: results.map((r) => ({
      title: r.title,
      url: r.url,
      snippet: r.content.slice(0, 200),
    })),
  };
}
