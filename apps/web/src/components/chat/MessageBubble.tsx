import { Bot, User, Sparkles, Search, Code, AlertCircle } from "lucide-react";
import { createElement } from "react";

const agentIcons: Record<string, typeof Bot> = {
  scribe: Sparkles,
  scout: Search,
  forge: Code,
  general: Bot,
};

interface MessageBubbleProps {
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  agentId?: string;
  isStreaming?: boolean;
}

export function MessageBubble({
  role,
  content,
  agentId,
  isStreaming,
}: MessageBubbleProps) {
  const isUser = role === "user";
  const AgentIcon = (agentId && agentIcons[agentId]) ?? Bot;

  if (isUser) {
    return (
      <div className="flex justify-end gap-3">
        <div className="max-w-[75%] rounded-2xl rounded-tr-sm bg-amber-600/10 px-4 py-2.5 text-sm text-gray-200">
          {content}
        </div>
        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-800">
          <User className="h-4 w-4 text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-800">
        {createElement(AgentIcon, { className: "h-4 w-4 text-amber-400" })}
      </div>
      <div className="max-w-[75%] rounded-2xl rounded-tl-sm bg-gray-800/50 px-4 py-2.5 text-sm leading-relaxed text-gray-300">
        {agentId && (
          <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-amber-500">
            {agentId}
          </span>
        )}
        <div className="whitespace-pre-wrap">{content}</div>
        {isStreaming && (
          <span className="ml-1 inline-block h-4 w-2 animate-pulse bg-amber-500 align-middle" />
        )}
      </div>
    </div>
  );
}

export function StatusMessage({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 px-1 text-sm text-gray-500">
      <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
      {message}
    </div>
  );
}

export function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 rounded-lg bg-red-900/20 px-4 py-3 text-sm text-red-400">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      {message}
    </div>
  );
}
