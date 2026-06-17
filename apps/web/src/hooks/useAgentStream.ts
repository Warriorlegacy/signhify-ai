import { useState, useCallback } from "react";
import { KeyVault } from "../lib/keyVault";

interface StreamState {
  isStreaming: boolean;
  agentType: string | null;
  statusMessage: string | null;
  tokens: string;
  error: string | null;
}

export function useAgentStream(serverUrl = "/api") {
  const [state, setState] = useState<StreamState>({
    isStreaming: false,
    agentType: null,
    statusMessage: null,
    tokens: "",
    error: null,
  });

  const sendMessage = useCallback(
    async (message: string, context?: string, threadId?: string) => {
      setState({
        isStreaming: true,
        agentType: null,
        statusMessage: null,
        tokens: "",
        error: null,
      });

      const response = await fetch(`${serverUrl}/agents/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("signhify_token")}`,
          ...KeyVault.toHeaders(),
        },
        body: JSON.stringify({ message, context, threadId }),
      });

      if (!response.ok) {
        setState((s) => ({
          ...s,
          isStreaming: false,
          error: "Request failed. Check your connection.",
        }));
        return;
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          try {
            const event = JSON.parse(line.slice(5).trim());
            if (event.type === "status")
              setState((s) => ({ ...s, statusMessage: event.message }));
            if (event.type === "agent")
              setState((s) => ({ ...s, agentType: event.agentType }));
            if (event.type === "token")
              setState((s) => ({ ...s, tokens: s.tokens + event.token }));
            if (event.type === "error")
              setState((s) => ({
                ...s,
                error: event.message,
                isStreaming: false,
              }));
            if (event.type === "done")
              setState((s) => ({ ...s, isStreaming: false }));
          } catch {
            /* ignore malformed events */
          }
        }
      }
    },
    [serverUrl],
  );

  return { ...state, sendMessage };
}
