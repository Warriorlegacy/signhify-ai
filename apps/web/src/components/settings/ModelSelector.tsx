interface ModelSelectorProps {
  value: string;
  onChange: (model: string) => void;
}

const models = [
  {
    id: "gemini-flash",
    label: "Gemini 2.0 Flash",
    description: "Fast, free, 1M token context",
  },
  {
    id: "groq-llama",
    label: "Groq Llama 3.3 70B",
    description: "Ultra-fast inference",
  },
  {
    id: "gpt-4o-mini",
    label: "GPT-4o Mini",
    description: "OpenAI, requires API key",
  },
];

export function ModelSelector({ value, onChange }: ModelSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-gray-400">
        Preferred Model
      </label>
      <div className="grid gap-2">
        {models.map((model) => (
          <button
            key={model.id}
            onClick={() => onChange(model.id)}
            className={`flex items-start gap-3 rounded-lg border p-3 text-left text-sm transition-colors ${
              value === model.id
                ? "border-amber-500/50 bg-amber-500/10 text-amber-400"
                : "border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600"
            }`}
          >
            <div
              className="mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 flex items-center justify-center"
              style={{
                borderColor: value === model.id ? "#f59e0b" : "#4b5563",
              }}
            >
              {value === model.id && (
                <div className="h-2 w-2 rounded-full bg-amber-500" />
              )}
            </div>
            <div>
              <div className="font-medium">{model.label}</div>
              <div className="mt-0.5 text-xs text-gray-500">
                {model.description}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
