import { useState } from "react";
import { useSettingsStore } from "../stores/settingsStore";
import { useAuthStore } from "../stores/authStore";
import { APIKeyVault } from "../components/settings/APIKeyVault";
import { ModelSelector } from "../components/settings/ModelSelector";
import { Button } from "../components/shared/Button";
import { fetchApi } from "../lib/api";

export function SettingsView() {
  const { keys, saveKeys, clearKeys, preferredModel, setPreferredModel } =
    useSettingsStore();
  const { user, logout } = useAuthStore();
  const [saving, setSaving] = useState(false);

  return (
    <div className="mx-auto max-w-2xl space-y-8 p-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-100">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Configure your API keys and preferences
        </p>
      </div>

      <section className="space-y-4 rounded-xl border border-gray-800 bg-gray-900/50 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
          API Keys
        </h2>
        <APIKeyVault
          keys={keys as Record<string, string | undefined>}
          onSave={
            saveKeys as (keys: Record<string, string | undefined>) => void
          }
        />
        {keys.gemini && (
          <button
            onClick={clearKeys}
            className="text-xs text-red-500 hover:text-red-400 underline"
          >
            Clear all keys
          </button>
        )}
      </section>

      <section className="space-y-4 rounded-xl border border-gray-800 bg-gray-900/50 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
          Model
        </h2>
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
          <p className="text-xs text-gray-500">Saving preference...</p>
        )}
      </section>

      <section className="space-y-4 rounded-xl border border-gray-800 bg-gray-900/50 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
          Account
        </h2>
        <div className="space-y-2 text-sm text-gray-400">
          {user && (
            <>
              <p>Email: {user.email}</p>
              <p>Name: {user.displayName}</p>
              <p>Plan: {user.plan}</p>
            </>
          )}
        </div>
        <Button variant="danger" size="sm" onClick={logout}>
          Logout
        </Button>
      </section>
    </div>
  );
}
