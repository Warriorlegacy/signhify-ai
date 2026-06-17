import { createLLM, streamResponse } from "../shared";

export interface VaultInput {
  task: string;
  context?: string;
}

export interface VaultOperation {
  action: "save" | "retrieve" | "list" | "delete" | "search";
  key?: string;
  value?: string;
}

export async function runVaultAgent(
  input: VaultInput,
  apiKeys: { gemini?: string; groq?: string },
  onToken: (token: string) => void,
): Promise<{ response: string; operation?: VaultOperation }> {
  const model = createLLM(apiKeys, "default");

  const fullResponse = await streamResponse(
    model,
    [
      {
        role: "system",
        content: `You are Vault, the memory and knowledge agent of Signhify AI.
You manage saved notes, preferences, and contextual memory for the user.

When the user wants to SAVE something, respond with:
---ACTION: save
---KEY: <a short key for the information>
---VALUE: <the content to save>
Then provide a friendly confirmation.

When the user wants to RETRIEVE something by key, respond with:
---ACTION: retrieve
---KEY: <the key to look up>

When the user wants to LIST all saved items, respond with:
---ACTION: list

When the user wants to SEARCH, respond with:
---ACTION: search
---KEY: <search query>

When the user wants to DELETE something, respond with:
---ACTION: delete
---KEY: <key to delete>

For general conversation about memory/notes, just respond conversationally without an action block.`,
      },
      { role: "user", content: input.task },
    ],
    onToken,
  );

  const op = parseOperation(fullResponse);
  return {
    response: op ? stripActionBlock(fullResponse) : fullResponse,
    operation: op,
  };
}

function parseOperation(response: string): VaultOperation | undefined {
  const actionMatch = response.match(/---ACTION:\s*(\w+)/);
  const keyMatch = response.match(/---KEY:\s*(.+)/);
  const valueMatch = response.match(/---VALUE:\s*([\s\S]*?)(?:\n---|$)/);
  if (!actionMatch) return undefined;
  const action = actionMatch[1] as VaultOperation["action"];
  return { action, key: keyMatch?.[1]?.trim(), value: valueMatch?.[1]?.trim() };
}

function stripActionBlock(response: string): string {
  return response
    .replace(/---ACTION:.*?(?:\n---|$)/gs, "")
    .replace(/---KEY:.*?(?:\n---|$)/gs, "")
    .replace(/---VALUE:.*?(?:\n---|$)/gs, "")
    .trim();
}
