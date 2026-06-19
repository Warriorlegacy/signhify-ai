import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatInput } from "../components/chat/ChatInput";
import {
  MessageBubble,
  StatusMessage,
  ErrorMessage,
} from "../components/chat/MessageBubble";
import { useAgentStream } from "../hooks/useAgentStream";
import { useThreadStore } from "../stores/threadStore";
import { useSettingsStore } from "../stores/settingsStore";
import { useAgentStore } from "../stores/agentStore";
import { Sparkles, TerminalSquare, Zap } from "lucide-react";
import { VoiceModal } from "../components/voice/VoiceModal";
import { ResearchPanel } from "../components/research/ResearchPanel";

interface Message {
  id: string;
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  agentId?: string;
}

const SUGGESTED_COMMANDS = [
  "Research the latest AI developments",
  "Write a technical blog post about React 19",
  "Generate a Python data pipeline",
  "Summarize my last 5 notes",
  "Draft a weekly status report",
  "Save this meeting summary to memory",
];

export function ChatView() {
  const { activeThread, setActiveThread, createThread } = useThreadStore();
  const { hasKeys, activeProvider } = useSettingsStore();
  const { setAgentStatus, setActiveAgent, addOrchestrationEvent } =
    useAgentStore();
  const {
    isStreaming,
    agentType,
    statusMessage,
    tokens,
    error,
    sources,
    searchQuery,
    sendMessage,
  } = useAgentStream();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);

  const messages: Message[] = activeThread?.messages ?? [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, tokens]);

  // Sync agent status with store
  useEffect(() => {
    if (agentType) {
      setActiveAgent(agentType as any);
      setAgentStatus(agentType as any, isStreaming ? "active" : "done");
      if (!isStreaming && agentType) {
        setTimeout(() => setAgentStatus(agentType as any, "idle"), 2000);
      }
    }
  }, [agentType, isStreaming]);

  const handleSend = async (message: string) => {
    let threadId = activeThread?._id;
    if (!threadId) {
      const thread = await createThread(undefined, message);
      threadId = thread._id;
      // Add user message to the new thread
      setActiveThread({
        ...thread,
        messages: [
          {
            id: crypto.randomUUID(),
            role: "user",
            content: message,
            agentId: undefined,
          } as Message,
        ],
      } as any);
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

  // Persist streamed assistant response to thread when streaming completes
  useEffect(() => {
    if (!isStreaming && tokens && activeThread) {
      const lastMsg = activeThread.messages[activeThread.messages.length - 1];
      if (lastMsg?.role !== "assistant" || lastMsg.content !== tokens) {
        setActiveThread({
          ...activeThread,
          messages: [
            ...activeThread.messages,
            {
              id: crypto.randomUUID(),
              role: "assistant",
              content: tokens,
              agentId: agentType ?? undefined,
            } as Message,
          ],
        } as any);
      }
    }
  }, [isStreaming]);

  if (!hasKeys) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md text-center p-8 rounded-2xl"
          style={{
            background: "rgba(11, 11, 17, 0.9)",
            border: "1px solid rgba(245, 166, 35, 0.2)",
            boxShadow: "0 0 40px rgba(245, 166, 35, 0.05)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div
            className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center"
            style={{
              background: "rgba(245,166,35,0.1)",
              border: "1px solid rgba(245,166,35,0.25)",
            }}
          >
            <Sparkles className="w-8 h-8" style={{ color: "#f5a623" }} />
          </div>
          <h2
            className="text-xl font-display font-semibold mb-3"
            style={{ color: "rgba(255,255,255,0.9)" }}
          >
            System Initialization Required
          </h2>
          <p
            className="text-sm mb-6 leading-relaxed"
            style={{ color: "rgba(148,163,184,0.6)" }}
          >
            Connect at least one AI provider to activate your agent team.
            Gemini, OpenAI, Anthropic, OpenRouter, and Groq are all supported.
          </p>
          <div
            className="rounded-xl p-4 text-sm"
            style={{
              background: "rgba(245,166,35,0.08)",
              border: "1px solid rgba(245,166,35,0.2)",
              color: "#f5a623",
            }}
          >
            <span className="font-semibold block mb-1">ACTION REQUIRED</span>
            <span style={{ color: "rgba(245,166,35,0.7)" }}>
              Settings → Add an API Key → Initialize
            </span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Chat Area */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
          <div className="mx-auto max-w-3xl flex flex-col min-h-full">
            {/* Empty state */}
            {!isStreaming && !error && messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-12 text-center mb-auto mt-auto"
              >
                <div
                  className="w-20 h-20 rounded-3xl mb-6 flex items-center justify-center relative"
                  style={{
                    background: "rgba(0,229,255,0.06)",
                    border: "1px solid rgba(0,229,255,0.15)",
                    boxShadow: "0 0 40px rgba(0,229,255,0.08)",
                  }}
                >
                  <TerminalSquare
                    className="w-10 h-10"
                    style={{ color: "rgba(0,229,255,0.7)" }}
                  />
                  <div
                    className="absolute -inset-2 rounded-3xl"
                    style={{
                      background: "rgba(0,229,255,0.04)",
                      filter: "blur(8px)",
                    }}
                  />
                </div>
                <h3 className="text-xl font-display font-semibold mb-2 gradient-text">
                  Awaiting Command
                </h3>
                <p
                  className="text-sm mb-8 max-w-sm leading-relaxed"
                  style={{ color: "rgba(148,163,184,0.4)" }}
                >
                  Your agent team is ready. Type a command or try one of the
                  suggestions below.
                </p>

                {/* Suggested commands */}
                <div className="flex flex-wrap justify-center gap-2 max-w-lg">
                  {SUGGESTED_COMMANDS.map((cmd, i) => (
                    <motion.button
                      key={cmd}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + i * 0.05 }}
                      onClick={() => handleSend(cmd)}
                      className="px-3 py-2 rounded-full text-xs font-medium transition-all hover:scale-[1.03]"
                      style={{
                        background: "rgba(0,229,255,0.05)",
                        border: "1px solid rgba(0,229,255,0.12)",
                        color: "rgba(148,163,184,0.7)",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.background =
                          "rgba(0,229,255,0.1)";
                        (e.currentTarget as HTMLElement).style.color =
                          "rgba(255,255,255,0.8)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background =
                          "rgba(0,229,255,0.05)";
                        (e.currentTarget as HTMLElement).style.color =
                          "rgba(148,163,184,0.7)";
                      }}
                    >
                      <Zap className="w-3 h-3 inline mr-1.5 opacity-60" />
                      {cmd}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Messages */}
            <div className="space-y-1 mt-auto">
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    role={msg.role}
                    content={msg.content}
                    agentId={msg.agentId}
                  />
                ))}
              </AnimatePresence>

              {/* Streaming state */}
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
                  {!tokens && !statusMessage && (
                    <div className="flex items-center gap-3 px-2 py-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{
                          background: "rgba(0,229,255,0.1)",
                          border: "1px solid rgba(0,229,255,0.2)",
                        }}
                      >
                        <div className="flex gap-0.5">
                          {[0, 1, 2].map((i) => (
                            <div
                              key={i}
                              className="w-1 h-1 rounded-full streaming-dot"
                              style={{ background: "#00e5ff" }}
                            />
                          ))}
                        </div>
                      </div>
                      <span
                        className="text-xs"
                        style={{ color: "rgba(148,163,184,0.5)" }}
                      >
                        Routing to best agent...
                      </span>
                    </div>
                  )}
                </div>
              )}

              {error && <ErrorMessage message={error} />}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          </div>
        </div>

        {/* Input */}
        <div className="flex-shrink-0">
          <ChatInput
            onSend={handleSend}
            isStreaming={isStreaming}
            onVoiceClick={() => setIsVoiceOpen(true)}
          />
        </div>
      </div>

      {/* Research Sidebar */}
      {((isStreaming && agentType === "scout") || sources.length > 0) && (
        <div className="w-80 border-l border-slate-800/60 bg-slate-950/20 backdrop-blur-md hidden xl:block flex-shrink-0">
          <ResearchPanel
            sources={sources}
            isSearching={isStreaming && agentType === "scout"}
            query={searchQuery}
          />
        </div>
      )}

      {/* Voicewave Visualizer Modal */}
      <AnimatePresence>
        {isVoiceOpen && (
          <VoiceModal
            isOpen={isVoiceOpen}
            onClose={() => setIsVoiceOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
