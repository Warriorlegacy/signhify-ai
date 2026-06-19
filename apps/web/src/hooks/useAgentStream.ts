import { useState, useCallback, useRef } from "react";
import { KeyVault } from "../lib/keyVault";
import { useSkillsStore } from "../stores/skillsStore";
import { getApiUrl } from "../lib/api";

export interface Source {
  title: string;
  url: string;
  snippet: string;
}

interface StreamState {
  isStreaming: boolean;
  agentType: string | null;
  statusMessage: string | null;
  tokens: string;
  error: string | null;
  sources: Source[];
  searchQuery: string | null;
}

const STREAM_TIMEOUT_MS = 120_000; // 2 minutes max
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

export function useAgentStream(serverUrl = "/api") {
  const [state, setState] = useState<StreamState>({
    isStreaming: false,
    agentType: null,
    statusMessage: null,
    tokens: "",
    error: null,
    sources: [],
    searchQuery: null,
  });

  const abortRef = useRef<AbortController | null>(null);

  const cancel = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setState((s) => ({ ...s, isStreaming: false }));
  }, []);

  const sendMessage = useCallback(
    async (
      message: string,
      context?: string,
      threadId?: string,
      retryCount = 0,
    ) => {
      // Cancel any existing stream
      if (abortRef.current) {
        abortRef.current.abort();
      }

      const controller = new AbortController();
      abortRef.current = controller;

      // Set up timeout
      const timeoutId = setTimeout(() => {
        controller.abort();
        setState((s) => ({
          ...s,
          isStreaming: false,
          error:
            s.tokens.length > 0
              ? null // Partial response is OK
              : "Request timed out. Please try again.",
        }));
      }, STREAM_TIMEOUT_MS);

      if (retryCount === 0) {
        setState({
          isStreaming: true,
          agentType: null,
          statusMessage: null,
          tokens: "",
          error: null,
          sources: [],
          searchQuery: message,
        });
      }

      try {
        const response = await fetch(getApiUrl("/agents/chat"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("signhify_token")}`,
            ...KeyVault.toHeaders(),
          },
          body: JSON.stringify({ message, context, threadId }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const errorBody = await response.json().catch(() => null);
          const errorMsg =
            errorBody?.error ??
            `Request failed (${response.status}). Check your connection.`;

          // Retry on 5xx errors
          if (response.status >= 500 && retryCount < MAX_RETRIES) {
            await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * (retryCount + 1)));
            return sendMessage(message, context, threadId, retryCount + 1);
          }

          setState((s) => ({
            ...s,
            isStreaming: false,
            error: errorMsg,
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
              if (event.type === "skill-suggestion")
                useSkillsStore.getState().addSuggestedSkill(event.skill);
              if (event.type === "citations")
                setState((s) => ({ ...s, sources: event.sources || [] }));
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

        // If stream ended without a "done" event, clean up
        setState((s) => {
          if (s.isStreaming) {
            return { ...s, isStreaming: false };
          }
          return s;
        });
      } catch (err: any) {
        if (err.name === "AbortError") {
          // Intentional cancellation — don't set error if we have tokens
          setState((s) => ({
            ...s,
            isStreaming: false,
            error: s.tokens.length > 0 ? null : "Request was cancelled.",
          }));
          return;
        }

        // Network error — retry
        if (retryCount < MAX_RETRIES) {
          await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * (retryCount + 1)));
          return sendMessage(message, context, threadId, retryCount + 1);
        }

        setState((s) => ({
          ...s,
          isStreaming: false,
          error: "Connection lost. Please check your network and try again.",
        }));
      } finally {
        clearTimeout(timeoutId);
        if (abortRef.current === controller) {
          abortRef.current = null;
        }
      }
    },
    [serverUrl],
  );

  return { ...state, sendMessage, cancel };
}
