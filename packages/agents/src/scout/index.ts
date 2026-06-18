import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { createLLM } from "../shared";

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
  apiKeys: {
    gemini?: string;
    groq?: string;
    openai?: string;
    anthropic?: string;
    openrouter?: string;
    tavily?: string;
  },
  onToken: (token: string) => void,
): Promise<ScoutResult> {
  let results: Array<{ title: string; url: string; content: string }> = [];

  if (apiKeys.tavily) {
    try {
      const searchTool = new TavilySearchResults({
        apiKey: apiKeys.tavily,
        maxResults: input.maxResults ?? 5,
      });

      const rawResults = await searchTool.invoke(input.query);
      results = JSON.parse(rawResults) as Array<{
        title: string;
        url: string;
        content: string;
      }>;
    } catch (err) {
      console.warn("Tavily search failed, falling back to internal knowledge:", err);
      onToken("[System Note: Tavily search failed, falling back to internal knowledge]\n\n");
    }
  } else {
    onToken("[System Note: No Tavily search key provided, using internal knowledge]\n\n");
  }

  const sourcesContext = results.length > 0
    ? results.map((r, i) => `[${i + 1}] ${r.title}\nURL: ${r.url}\n${r.content}`).join("\n\n")
    : "No search results available.";

  const model = createLLM(apiKeys, "default");

  const systemPrompt = `You are Scout, the research agent of Signhify AI.
Synthesize the search results (if any) into a clear, accurate, well-cited answer.
If search results are available, reference sources as [1], [2], etc. Be factual.
If no search results are available, answer the question to the best of your ability using your general knowledge, and mention that web search was unavailable.`;

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
