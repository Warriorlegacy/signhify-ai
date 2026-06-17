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
import { Sparkles, TerminalSquare } from "lucide-react";

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
      <div className="flex h-full items-center justify-center p-8 bg-obsidian">
        <div className="max-w-md text-center p-8 rounded-2xl border border-slate-800/60 bg-slate-900/40 backdrop-blur-md shadow-2xl">
          <Sparkles className="w-12 h-12 text-cyan-teal mx-auto mb-4 opacity-80" />
          <h2 className="mb-3 text-2xl font-display font-semibold text-slate-100">
            System Initialization Required
          </h2>
          <p className="mb-8 text-sm text-slate-400 font-light leading-relaxed">
            API keys are required to establish connection with specialized agents. Please provide valid credentials to proceed.
          </p>
          <div className="rounded-xl border border-plasma-gold/30 bg-plasma-gold/10 p-5 text-sm text-plasma-gold shadow-[inset_0_0_20px_rgba(245,166,35,0.05)]">
            <span className="font-semibold block mb-1">ACTION REQUIRED:</span>
            Navigate to Settings → Initialize API Keys → Begin Orchestration
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-transparent">
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-8 custom-scrollbar">
        <div className="mx-auto max-w-3xl flex flex-col justify-end min-h-full">
          {!isStreaming && !error && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center opacity-70 mb-auto mt-auto">
              <div className="w-16 h-16 rounded-2xl bg-cyan-teal/10 border border-cyan-teal/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,229,255,0.1)]">
                <TerminalSquare className="w-8 h-8 text-cyan-teal" />
              </div>
              <h3 className="mb-3 text-xl font-display font-medium text-slate-300">
                Awaiting Command
              </h3>
              <p className="max-w-md text-sm text-slate-500 font-light leading-relaxed">
                Try: "Analyze codebase architecture", "Generate authentication module", or "Draft a weekly summary report"
              </p>
            </div>
          )}
          
          <div className="space-y-2 mt-auto">
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                role={msg.role}
                content={msg.content}
                agentId={msg.agentId}
              />
            ))}
            {isStreaming && (
              <div className="space-y-2">
                {statusMessage && <StatusMessage message={statusMessage} />}
                {tokens && (
                  <MessageBubble
                    role="assistant"
                    content={tokens}
                    agentId={agentType ?? undefined}
                    isStreaming
                  />
                )}
              </div>
            )}
            {error && <ErrorMessage message={error} />}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        </div>
      </div>
      <div className="mt-auto">
        <ChatInput onSend={handleSend} isStreaming={isStreaming} />
      </div>
    </div>
  );
}
