import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Mic } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  isStreaming: boolean;
  disabled?: boolean;
  onVoiceClick?: () => void;
}

export function ChatInput({ onSend, isStreaming, disabled, onVoiceClick }: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 200) + "px";
    }
  }, [input]);

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming || disabled) return;
    onSend(trimmed);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="p-4 relative">
      {/* Glow effect under input */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-cyan-teal/5 blur-[50px] pointer-events-none"></div>
      
      <div className="mx-auto flex max-w-3xl items-end gap-3 relative z-10 p-1 bg-slate-900/40 backdrop-blur-xl border border-slate-800/60 rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <button 
          type="button"
          disabled={isStreaming || disabled}
          onClick={onVoiceClick}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-slate-500 hover:text-cyan-teal hover:bg-cyan-teal/10 transition-colors disabled:opacity-50"
        >
          <Mic className="h-5 w-5" />
        </button>
        
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Issue a command or query..."
          rows={1}
          disabled={isStreaming || disabled}
          className="flex-1 resize-none bg-transparent py-3.5 text-sm text-slate-100 placeholder-slate-500 outline-none disabled:opacity-50"
        />
        
        <button
          onClick={handleSubmit}
          disabled={!input.trim() || isStreaming || disabled}
          className="group flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-teal text-obsidian font-bold transition-all hover:bg-lucid-aqua hover:shadow-[0_0_15px_rgba(0,229,255,0.4)] disabled:opacity-30 disabled:hover:bg-cyan-teal disabled:hover:shadow-none"
        >
          {isStreaming ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
          )}
        </button>
      </div>
      <div className="text-center mt-2">
        <p className="text-[10px] text-slate-500 font-medium">Orchestrating agents Nexus, Scribe, Scout, and Forge</p>
      </div>
    </div>
  );
}
