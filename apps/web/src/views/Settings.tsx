import { useState } from "react";
import { useSettingsStore } from "../stores/settingsStore";
import { useAuthStore } from "../stores/authStore";
import { APIKeyVault } from "../components/settings/APIKeyVault";
import { ModelSelector } from "../components/settings/ModelSelector";

import { fetchApi } from "../lib/api";
import { ShieldCheck, Settings, Key, Cpu, UserCircle } from "lucide-react";

export function SettingsView() {
  const { keys, saveKeys, clearKeys, preferredModel, setPreferredModel } =
    useSettingsStore();
  const { user, logout } = useAuthStore();
  const [saving, setSaving] = useState(false);

  return (
    <div className="mx-auto max-w-3xl space-y-8 p-6 lg:p-10 custom-scrollbar h-full overflow-y-auto">
      <header className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-cyan-teal/10 border border-cyan-teal/30 flex items-center justify-center shadow-[0_0_15px_rgba(0,229,255,0.15)]">
          <Settings className="w-6 h-6 text-cyan-teal" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-semibold text-slate-100 tracking-wide">Workspace Configuration</h1>
          <p className="mt-1 text-sm text-slate-400 font-light">
            Secure configuration panel for API keys and system preferences.
          </p>
        </div>
      </header>

      <div className="space-y-6">
        <section className="relative overflow-hidden rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6 backdrop-blur-md shadow-lg group transition-colors hover:border-slate-700/60">
          <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
            <Key className="w-32 h-32 text-cyan-teal transform rotate-12" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="w-4 h-4 text-cyan-teal" />
              <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-300">
                Encrypted Credentials
              </h2>
            </div>
            <APIKeyVault
              keys={keys as Record<string, string | undefined>}
              onSave={
                saveKeys as (keys: Record<string, string | undefined>) => void
              }
            />
            {keys.gemini && (
              <button
                onClick={clearKeys}
                className="mt-4 text-xs font-medium text-red-500/80 hover:text-red-400 transition-colors uppercase tracking-wider"
              >
                Clear Identity Keys
              </button>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6 backdrop-blur-md shadow-lg transition-colors hover:border-slate-700/60">
          <div className="flex items-center gap-2 mb-4">
            <Cpu className="w-4 h-4 text-cyan-teal" />
            <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-300">
              Model Routing
            </h2>
          </div>
          <ModelSelector
            value={preferredModel}
            onChange={async (model) => {
              setPreferredModel(model);
              setSaving(true);
              try {
                await fetchApi("/users/profile", {
                  method: "PATCH",
                  body: JSON.stringify({
                    settings: { preferredModel: model },
                  }),
                });
              } catch {
                /* ignore */
              }
              setSaving(false);
            }}
          />
          {saving && (
            <p className="mt-2 text-xs text-cyan-teal animate-pulse">Syncing routing preference...</p>
          )}
        </section>

        <section className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6 backdrop-blur-md shadow-lg transition-colors hover:border-slate-700/60">
          <div className="flex items-center gap-2 mb-4">
            <UserCircle className="w-4 h-4 text-cyan-teal" />
            <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-300">
              Operative Identity
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {user && (
              <>
                <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4">
                  <span className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">Designation</span>
                  <span className="text-sm text-slate-200 font-medium">{user.displayName}</span>
                </div>
                <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4">
                  <span className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">Communications Channel</span>
                  <span className="text-sm text-slate-200 font-medium">{user.email}</span>
                </div>
                <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4">
                  <span className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">Clearance Level</span>
                  <span className="text-sm text-plasma-gold font-medium uppercase">{user.plan}</span>
                </div>
              </>
            )}
          </div>
          <button 
            onClick={logout}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg border border-red-900/30 bg-red-900/10 text-sm font-semibold tracking-wide text-red-500 hover:bg-red-900/20 transition-all uppercase"
          >
            Disengage Session
          </button>
        </section>
      </div>
    </div>
  );
}
