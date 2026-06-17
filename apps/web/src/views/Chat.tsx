import { useEffect, useRef } from "react";
import { ChatInput } from "../components/chat/ChatInput";
import {
  MessageBubble,
  StatusMessage,
  ErrorMessage,
} from "../components/chat/MessageBubble";
import { useAgentStream } from "../hooks/useAgentStream";
import { useThreadStore } from "../stores/threadStore";
import { useSettingsStore } from "../stores/settingsStore";

interface Message {
  id: string;
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  agentId?: string;
}

export function ChatView() {
  const { activeThread, setActiveThread, createThread } = useThreadStore();
  const { hasKeys } = useSettingsStore();
  const { isStreaming, agentType, statusMessage, tokens, error, sendMessage } =
    useAgentStream();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages: Message[] = activeThread?.messages ?? [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, tokens]);

  const handleSend = async (message: string) => {
    let threadId = activeThread?._id;
    if (!threadId) {
      const thread = await createThread(undefined, message);
      threadId = thread._id;
    } else {
      setActiveThread({
        ...activeThread!,
        messages: [
          ...activeThread!.messages,
          {
            id: crypto.randomUUID(),
            role: "user",
            content: message,
            agentId: undefined,
          } as Message,
        ],
      } as any);
    }
    sendMessage(message, undefined, threadId);
  };

  if (!hasKeys) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="max-w-md text-center">
          <h2 className="mb-2 text-xl font-semibold text-gray-300">
            Welcome to Signhify AI
          </h2>
          <p className="mb-6 text-sm text-gray-500">
            Add your API keys in Settings to get started. You'll need at least a
            Gemini API key.
          </p>
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-400">
            Go to Settings → Add your Gemini API key → Start chatting
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-3xl space-y-4">
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              role={msg.role}
              content={msg.content}
              agentId={msg.agentId}
            />
          ))}
          {isStreaming && (
            <>
              {statusMessage && <StatusMessage message={statusMessage} />}
              {tokens && (
                <MessageBubble
                  role="assistant"
                  content={tokens}
                  agentId={agentType ?? undefined}
                  isStreaming
                />
              )}
            </>
          )}
          {error && <ErrorMessage message={error} />}
          {!isStreaming && !error && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <h3 className="mb-2 text-lg font-medium text-gray-400">
                What would you like to do?
              </h3>
              <p className="max-w-md text-sm text-gray-600">
                Try: "Summarize this paragraph for me", "Search the web for
                latest AI news", or "Write a Python function to sort a list"
              </p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <ChatInput onSend={handleSend} isStreaming={isStreaming} />
    </div>
  );
}
