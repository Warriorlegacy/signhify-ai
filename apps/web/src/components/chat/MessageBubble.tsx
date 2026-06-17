import { Bot, User, Sparkles, Search, Code, AlertCircle, ShieldCheck } from "lucide-react";
import { createElement } from "react";

const agentIcons: Record<string, typeof Bot> = {
  nexus: Bot,
  scribe: Sparkles,
  scout: Search,
  forge: Code,
  herald: ShieldCheck,
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
      <div className="flex justify-end gap-3 mb-6">
        <div className="max-w-[75%] rounded-2xl rounded-tr-sm bg-slate-800/40 border border-slate-700/50 backdrop-blur-md px-5 py-3 text-sm text-slate-200 shadow-md">
          {content}
        </div>
        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-800 border border-slate-700/50 shadow-inner">
          <User className="h-4 w-4 text-slate-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 mb-6 relative">
      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-teal/10 border border-cyan-teal/30 shadow-[0_0_10px_rgba(0,229,255,0.2)]">
        {createElement(AgentIcon, { className: "h-4 w-4 text-cyan-teal drop-shadow-md" })}
      </div>
      <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-slate-900/60 border border-slate-800/80 backdrop-blur-lg px-5 py-3.5 text-sm leading-relaxed text-slate-300 shadow-lg">
        {agentId && (
          <span className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-cyan-teal drop-shadow-sm flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-teal animate-pulse" />
            {agentId}
          </span>
        )}
        <div className="whitespace-pre-wrap font-light">{content}</div>
        {isStreaming && (
          <span className="ml-1 inline-block h-4 w-1.5 bg-cyan-teal animate-pulse align-middle shadow-[0_0_8px_rgba(0,229,255,0.8)]" />
        )}
      </div>
    </div>
  );
}

export function StatusMessage({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-3 px-2 py-3 text-xs text-slate-400 font-medium uppercase tracking-wide">
      <div className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-plasma-gold opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-plasma-gold"></span>
      </div>
      {message}
    </div>
  );
}

export function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-red-950/30 border border-red-900/50 backdrop-blur-md px-5 py-4 text-sm text-red-400 mb-6 shadow-lg">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500 drop-shadow-md" />
      <span className="font-light">{message}</span>
    </div>
  );
}
