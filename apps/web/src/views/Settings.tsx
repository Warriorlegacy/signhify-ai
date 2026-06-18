import { useState } from "react";
import { useSettingsStore } from "../stores/settingsStore";
import { useAuthStore } from "../stores/authStore";
import { LLM_PROVIDERS, UserKeys } from "../lib/keyVault";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Settings,
  Key,
  Cpu,
  UserCircle,
  Eye,
  EyeOff,
  CheckCircle,
  Zap,
  Brain,
  Wifi,
  Globe,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

function ProviderRow({
  provider,
  value,
  onChange,
}: {
  provider: (typeof LLM_PROVIDERS)[0];
  value?: string;
  onChange: (v: string) => void;
}) {
  const [show, setShow] = useState(false);
  const isLLM = !["tavily", "elevenlabs"].includes(provider.key as string);

  return (
    <div
      className="flex items-center gap-3 py-3 border-b last:border-b-0"
      style={{ borderColor: "rgba(30,30,46,0.5)" }}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{
          background: value ? "rgba(0,229,255,0.1)" : "rgba(71,85,105,0.1)",
          border: `1px solid ${value ? "rgba(0,229,255,0.2)" : "rgba(71,85,105,0.15)"}`,
        }}
      >
        {value ? (
          <CheckCircle className="w-4 h-4" style={{ color: "#10b981" }} />
        ) : (
          <Key className="w-4 h-4" style={{ color: "rgba(71,85,105,0.6)" }} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span
            className="text-xs font-semibold"
            style={{ color: "rgba(255,255,255,0.8)" }}
          >
            {provider.label}
          </span>
          {isLLM && (
            <span
              className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide"
              style={{
                background: "rgba(0,229,255,0.1)",
                color: "#00e5ff",
                border: "1px solid rgba(0,229,255,0.2)",
              }}
            >
              LLM
            </span>
          )}
          {provider.isFree && (
            <span
              className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide"
              style={{
                background: "rgba(16,185,129,0.1)",
                color: "#10b981",
                border: "1px solid rgba(16,185,129,0.2)",
              }}
            >
              FREE
            </span>
          )}
        </div>
        <div className="relative">
          <input
            type={show ? "text" : "password"}
            className="input-base py-1.5 pr-9 text-xs font-mono"
            placeholder={provider.placeholder}
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            style={{ background: "rgba(6,6,10,0.7)" }}
          />
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 transition-colors"
            style={{ color: "rgba(148,163,184,0.4)" }}
          >
            {show ? (
              <EyeOff className="w-3.5 h-3.5" />
            ) : (
              <Eye className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionCard({
  icon: Icon,
  title,
  iconColor,
  children,
}: {
  icon: any;
  title: string;
  iconColor?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden"
      style={{
        background: "rgba(11, 11, 17, 0.7)",
        border: "1px solid rgba(30, 30, 46, 0.7)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div
        className="flex items-center gap-3 px-5 py-4 border-b"
        style={{ borderColor: "rgba(30, 30, 46, 0.5)" }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{
            background: `${iconColor ?? "#00e5ff"}15`,
            border: `1px solid ${iconColor ?? "#00e5ff"}25`,
          }}
        >
          <Icon className="w-4 h-4" style={{ color: iconColor ?? "#00e5ff" }} />
        </div>
        <h2
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color: "rgba(255,255,255,0.7)" }}
        >
          {title}
        </h2>
      </div>
      <div className="p-5">{children}</div>
    </motion.section>
  );
}

const FREE_MODEL_INFO = [
  { provider: "Groq", models: "Llama 3.1 8B, Gemma 2 9B", speed: "Fastest" },
  { provider: "Cerebras", models: "Llama 3.1 8B", speed: "Very Fast" },
  { provider: "SambaNova", models: "Llama 3.1 8B", speed: "Fast" },
  { provider: "Together AI", models: "Llama 3.1 8B Turbo", speed: "Fast" },
  { provider: "Mistral", models: "Nemo, Tiny", speed: "Fast" },
  { provider: "Gemini", models: "2.0 Flash", speed: "Fast" },
  { provider: "OpenRouter", models: "Llama 3.1 8B (Free)", speed: "Medium" },
  { provider: "Cloudflare", models: "Llama 3.1 8B", speed: "Medium" },
];

export function SettingsView() {
  const { keys, saveKeys, clearKeys, preferredModel, setPreferredModel } =
    useSettingsStore();
  const { user, logout } = useAuthStore();
  const [localKeys, setLocalKeys] = useState<UserKeys>({ ...keys });
  const [saved, setSaved] = useState(false);
  const [showFreeModels, setShowFreeModels] = useState(false);

  const handleSave = () => {
    saveKeys(localKeys);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateKey = (key: keyof UserKeys, value: string) => {
    setLocalKeys((prev) => ({ ...prev, [key]: value || undefined }));
  };

  const llmProviders = LLM_PROVIDERS.filter(
    (p) => !["tavily", "elevenlabs"].includes(p.key as string),
  );
  const toolProviders = LLM_PROVIDERS.filter((p) =>
    ["tavily", "elevenlabs"].includes(p.key as string),
  );
  const freeProviders = llmProviders.filter((p) => p.isFree);
  const paidProviders = llmProviders.filter((p) => !p.isFree);

  const activeFreeCount = freeProviders.filter(
    (p) => localKeys[p.key as keyof UserKeys],
  ).length;

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-2xl mx-auto space-y-5">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{
              background: "rgba(0,229,255,0.08)",
              border: "1px solid rgba(0,229,255,0.2)",
              boxShadow: "0 0 20px rgba(0,229,255,0.1)",
            }}
          >
            <Settings className="w-6 h-6" style={{ color: "#00e5ff" }} />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold gradient-text">
              Configuration
            </h1>
            <p
              className="text-xs mt-0.5"
              style={{ color: "rgba(148,163,184,0.5)" }}
            >
              Secure workspace configuration
            </p>
          </div>
        </motion.header>

        {/* Free Model Status */}
        <SectionCard icon={Wifi} title="Free Model Status" iconColor="#10b981">
          <p
            className="text-xs mb-3"
            style={{ color: "rgba(148,163,184,0.5)" }}
          >
            Signhify uses free-tier models first, then falls back to paid models
            automatically.
            {activeFreeCount > 0
              ? ` ${activeFreeCount} free provider${activeFreeCount > 1 ? "s" : ""} active.`
              : " Add at least one free provider key below."}
          </p>
          <button
            onClick={() => setShowFreeModels(!showFreeModels)}
            className="flex items-center gap-2 text-xs font-medium mb-3 transition-colors"
            style={{ color: "#10b981" }}
          >
            <Globe className="w-3.5 h-3.5" />
            {showFreeModels ? "Hide" : "Show"} available free models
            {showFreeModels ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
          {showFreeModels && (
            <div className="space-y-2">
              {FREE_MODEL_INFO.map((fm) => {
                const isActive = freeProviders.some(
                  (p) =>
                    p.label.includes(fm.provider) &&
                    localKeys[p.key as keyof UserKeys],
                );
                return (
                  <div
                    key={fm.provider}
                    className="flex items-center gap-3 py-2 px-3 rounded-lg"
                    style={{
                      background: isActive
                        ? "rgba(16,185,129,0.05)"
                        : "rgba(255,255,255,0.02)",
                      border: `1px solid ${isActive ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.04)"}`,
                    }}
                  >
                    <div
                      className={`w-2 h-2 rounded-full flex-shrink-0`}
                      style={{
                        background: isActive
                          ? "#10b981"
                          : "rgba(71,85,105,0.4)",
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-xs font-medium"
                        style={{
                          color: isActive ? "#10b981" : "rgba(255,255,255,0.6)",
                        }}
                      >
                        {fm.provider}
                      </p>
                      <p
                        className="text-[10px]"
                        style={{ color: "rgba(148,163,184,0.4)" }}
                      >
                        {fm.models}
                      </p>
                    </div>
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded"
                      style={{
                        background: "rgba(16,185,129,0.1)",
                        color: "#10b981",
                      }}
                    >
                      {fm.speed}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>

        {/* Free LLM Providers */}
        <SectionCard icon={Cpu} title="Free LLM Providers" iconColor="#10b981">
          <p
            className="text-xs mb-4"
            style={{ color: "rgba(148,163,184,0.5)" }}
          >
            These providers offer free tiers. Signhify tries them first before
            falling back to paid options. Priority: Groq {"->"} Cerebras {"->"}{" "}
            SambaNova {"->"} Together {"->"} Mistral {"->"} Gemini {"->"}{" "}
            OpenRouter.
          </p>
          {freeProviders.map((provider) => (
            <ProviderRow
              key={provider.key}
              provider={provider}
              value={localKeys[provider.key as keyof UserKeys]}
              onChange={(v) => updateKey(provider.key as keyof UserKeys, v)}
            />
          ))}
        </SectionCard>

        {/* Paid LLM Providers */}
        <SectionCard icon={Cpu} title="Paid LLM Providers">
          <p
            className="text-xs mb-4"
            style={{ color: "rgba(148,163,184,0.5)" }}
          >
            Paid providers are used as fallback when free models are
            unavailable.
          </p>
          {paidProviders.map((provider) => (
            <ProviderRow
              key={provider.key}
              provider={provider}
              value={localKeys[provider.key as keyof UserKeys]}
              onChange={(v) => updateKey(provider.key as keyof UserKeys, v)}
            />
          ))}
        </SectionCard>

        {/* Cloudflare Account ID */}
        {localKeys.cloudflare && (
          <SectionCard
            icon={Globe}
            title="Cloudflare Configuration"
            iconColor="#f97316"
          >
            <p
              className="text-xs mb-4"
              style={{ color: "rgba(148,163,184,0.5)" }}
            >
              Cloudflare Workers AI requires your Account ID.
            </p>
            <div className="relative">
              <input
                type="text"
                className="input-base py-1.5 text-xs font-mono"
                placeholder="Cloudflare Account ID"
                value={localKeys.cloudflareAccountId ?? ""}
                onChange={(e) =>
                  updateKey("cloudflareAccountId", e.target.value)
                }
                style={{ background: "rgba(6,6,10,0.7)" }}
              />
            </div>
          </SectionCard>
        )}

        {/* Tool Providers */}
        <SectionCard icon={Zap} title="Tool Integrations" iconColor="#f59e0b">
          <p
            className="text-xs mb-4"
            style={{ color: "rgba(148,163,184,0.5)" }}
          >
            Optional: add Tavily for live web search (Scout agent), ElevenLabs
            for voice synthesis.
          </p>
          {toolProviders.map((provider) => (
            <ProviderRow
              key={provider.key}
              provider={provider}
              value={localKeys[provider.key as keyof UserKeys]}
              onChange={(v) => updateKey(provider.key as keyof UserKeys, v)}
            />
          ))}
        </SectionCard>

        {/* Save button */}
        <motion.button
          onClick={handleSave}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all"
          style={{
            background: saved ? "rgba(16,185,129,0.12)" : "rgba(0,229,255,0.1)",
            border: `1px solid ${saved ? "rgba(16,185,129,0.3)" : "rgba(0,229,255,0.25)"}`,
            color: saved ? "#10b981" : "#00e5ff",
          }}
        >
          {saved ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <ShieldCheck className="w-4 h-4" />
          )}
          {saved ? "Saved Securely" : "Save API Keys"}
        </motion.button>

        {/* Clear keys */}
        {Object.values(localKeys).some(Boolean) && (
          <button
            onClick={() => {
              clearKeys();
              setLocalKeys({});
            }}
            className="w-full text-xs font-medium uppercase tracking-wider transition-colors"
            style={{ color: "rgba(239,68,68,0.6)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "rgba(239,68,68,0.6)")
            }
          >
            Clear All Credentials
          </button>
        )}

        {/* Model preference */}
        <SectionCard icon={Brain} title="Model Routing" iconColor="#a78bfa">
          <p
            className="text-xs mb-4"
            style={{ color: "rgba(148,163,184,0.5)" }}
          >
            Choose how Nexus selects models for different tasks.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              {
                value: "auto",
                label: "Auto (Recommended)",
                desc: "Best model per task",
              },
              {
                value: "fast",
                label: "Speed",
                desc: "Prioritize response time",
              },
              {
                value: "quality",
                label: "Quality",
                desc: "Prioritize output quality",
              },
              {
                value: "economy",
                label: "Economy",
                desc: "Minimize token usage",
              },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setPreferredModel(opt.value)}
                className="p-3 rounded-xl text-left transition-all"
                style={{
                  background:
                    preferredModel === opt.value
                      ? "rgba(167,139,250,0.1)"
                      : "rgba(255,255,255,0.03)",
                  border: `1px solid ${preferredModel === opt.value ? "rgba(167,139,250,0.3)" : "rgba(255,255,255,0.06)"}`,
                }}
              >
                <p
                  className="text-xs font-semibold mb-0.5"
                  style={{
                    color:
                      preferredModel === opt.value
                        ? "#a78bfa"
                        : "rgba(255,255,255,0.7)",
                  }}
                >
                  {opt.label}
                </p>
                <p
                  className="text-[10px]"
                  style={{ color: "rgba(148,163,184,0.4)" }}
                >
                  {opt.desc}
                </p>
              </button>
            ))}
          </div>
        </SectionCard>

        {/* User Identity */}
        <SectionCard icon={UserCircle} title="Operative Identity">
          {user && (
            <div className="grid grid-cols-2 gap-3 mb-5">
              {[
                { label: "Designation", value: user.displayName },
                { label: "Channel", value: user.email },
                { label: "Plan", value: user.plan?.toUpperCase() },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="rounded-xl p-3"
                  style={{
                    background: "rgba(6,6,10,0.6)",
                    border: "1px solid rgba(30,30,46,0.6)",
                  }}
                >
                  <p
                    className="text-[10px] uppercase tracking-wider mb-1"
                    style={{ color: "rgba(148,163,184,0.4)" }}
                  >
                    {label}
                  </p>
                  <p
                    className="text-sm font-medium truncate"
                    style={{ color: "rgba(255,255,255,0.85)" }}
                  >
                    {value}
                  </p>
                </div>
              ))}
            </div>
          )}
          <button
            onClick={logout}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-semibold uppercase tracking-wide transition-all hover:scale-[1.02]"
            style={{
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.25)",
              color: "rgba(239,68,68,0.8)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "rgba(239,68,68,0.15)";
              (e.currentTarget as HTMLButtonElement).style.color = "#ef4444";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "rgba(239,68,68,0.08)";
              (e.currentTarget as HTMLButtonElement).style.color =
                "rgba(239,68,68,0.8)";
            }}
          >
            Disengage Session
          </button>
        </SectionCard>
      </div>
    </div>
  );
}
