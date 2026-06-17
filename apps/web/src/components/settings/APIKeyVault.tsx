import { useState } from "react";
import { Eye, EyeOff, Key, Check, AlertCircle } from "lucide-react";

interface APIKeyVaultProps {
  keys: Record<string, string | undefined>;
  onSave: (keys: Record<string, string | undefined>) => void;
}

const keyFields = [
  { id: "gemini", label: "Gemini API Key", placeholder: "AIzaSy..." },
  { id: "groq", label: "Groq API Key", placeholder: "gsk_..." },
  { id: "tavily", label: "Tavily API Key", placeholder: "tvly-..." },
  {
    id: "elevenlabs",
    label: "ElevenLabs API Key (optional)",
    placeholder: "...",
  },
] as const;

export function APIKeyVault({ keys, onSave }: APIKeyVaultProps) {
  const [localKeys, setLocalKeys] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const f of keyFields) {
      initial[f.id] = keys[f.id] ?? "";
    }
    return initial;
  });
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    const clean: Record<string, string | undefined> = {};
    for (const f of keyFields) {
      clean[f.id] = localKeys[f.id] || undefined;
    }
    onSave(clean);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Key className="h-4 w-4" />
        <span>
          Your keys are stored encrypted in your browser. Never sent to our
          servers.
        </span>
      </div>
      {keyFields.map((field) => (
        <div key={field.id}>
          <label className="mb-1 block text-xs font-medium text-gray-400">
            {field.label}
          </label>
          <div className="relative">
            <input
              type={visible[field.id] ? "text" : "password"}
              value={localKeys[field.id]}
              onChange={(e) =>
                setLocalKeys((k) => ({ ...k, [field.id]: e.target.value }))
              }
              placeholder={field.placeholder}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 pr-10 text-sm text-gray-200 placeholder-gray-600 outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30"
            />
            <button
              onClick={() =>
                setVisible((v) => ({ ...v, [field.id]: !v[field.id] }))
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
            >
              {visible[field.id] ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      ))}
      <button
        onClick={handleSave}
        className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-500"
      >
        {saved ? (
          <>
            <Check className="h-4 w-4" /> Saved
          </>
        ) : (
          "Save Keys"
        )}
      </button>
    </div>
  );
}
