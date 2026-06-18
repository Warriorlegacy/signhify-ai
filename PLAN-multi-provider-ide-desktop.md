# Signhify AI — Multi-Provider Fallback + IDE Extension + Desktop App

## Overview

Three major features:

1. **Multi-Provider Free Model Fallback** — Expand from 5 to 10 providers with automatic free-tier-first routing
2. **VS Code Extension** — Full Copilot-style extension for VS Code, Cursor, WindSurf, and Anti-Gravity
3. **Electron Desktop App** — Native desktop wrapper with system tray, hotkeys, and auto-updates

---

## Feature 1: Multi-Provider Free Model Fallback

### Goal

When a user has multiple provider keys (or even just one), the system automatically tries free-tier models first, falls back to the next free model, and only uses paid models as a last resort. New free providers are added: Mistral, Together AI, Cerebras, SambaNova, Cloudflare Workers AI.

### 1.1 Add New Provider Adapters

Create 5 new adapter files in `packages/agents/src/adapters/`:

| File            | Provider              | Free Models                                                                           | API Pattern                                                                        |
| --------------- | --------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `mistral.ts`    | Mistral AI            | `mistral-small-latest`, `open-mistral-nemo`, `mistral-tiny`                           | OpenAI-compatible (`https://api.mistral.ai/v1`)                                    |
| `together.ts`   | Together AI           | `meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo`, `mistralai/Mixtral-8x7B-Instruct-v0.1` | OpenAI-compatible (`https://api.together.xyz/v1`)                                  |
| `cerebras.ts`   | Cerebras              | `llama3.1-8b`, `llama3.1-70b`                                                         | OpenAI-compatible (`https://api.cerebras.ai/v1`)                                   |
| `sambanova.ts`  | SambaNova             | `Meta-Llama-3.1-8B-Instruct`, `DeepSeek-R1-Distill-Llama-70B`                         | OpenAI-compatible (`https://api.sambanova.ai/v1`)                                  |
| `cloudflare.ts` | Cloudflare Workers AI | `@cf/meta/llama-3.1-8b-instruct`, `@cf/qwen/qwen1.5-14b-chat-awq`                     | Cloudflare REST API (`https://api.cloudflare.com/client/v4/accounts/{id}/ai/run/`) |

All providers except Cloudflare use OpenAI-compatible APIs, so they can extend a shared `OpenAICompatibleAdapter` base class. Cloudflare has a unique API shape and needs its own adapter.

**New file: `packages/agents/src/adapters/openai-compatible.ts`**

```ts
// Base class for Mistral, Together, Cerebras, SambaNova
// Extends the OpenAI adapter pattern with configurable baseURL
export class OpenAICompatibleAdapter implements LLMAdapter {
  constructor(
    readonly providerId: ProviderId,
    readonly label: string,
    private apiKey: string,
    private baseUrl: string,
    private defaultModels: string[],
  ) {}
  // stream(), complete(), listModels() — same pattern as OpenAIAdapter
}
```

### 1.2 Free Model Registry

**New file: `packages/agents/src/free-models.ts`**

```ts
export interface FreeModelEntry {
  provider: ProviderId;
  model: string;
  label: string;
  maxTokens: number; // free tier limit
  requestsPerMin: number; // rate limit
  priority: number; // 1 = best free, 10 = worst free
}

// Curated list of verified free-tier models
export const FREE_MODELS: FreeModelEntry[] = [
  // Priority 1: Groq (fastest, generous free tier)
  {
    provider: "groq",
    model: "llama-3.1-8b-instant",
    label: "Groq Llama 3.1 8B",
    maxTokens: 8192,
    requestsPerMin: 30,
    priority: 1,
  },
  {
    provider: "groq",
    model: "gemma2-9b-it",
    label: "Groq Gemma 2 9B",
    maxTokens: 8192,
    requestsPerMin: 30,
    priority: 2,
  },
  // Priority 2: Cerebras (fast inference)
  {
    provider: "cerebras",
    model: "llama3.1-8b",
    label: "Cerebras Llama 3.1 8B",
    maxTokens: 8192,
    requestsPerMin: 30,
    priority: 3,
  },
  // Priority 3: SambaNova
  {
    provider: "sambanova",
    model: "Meta-Llama-3.1-8B-Instruct",
    label: "SambaNova Llama 3.1 8B",
    maxTokens: 8192,
    requestsPerMin: 20,
    priority: 4,
  },
  // Priority 4: Together AI
  {
    provider: "together",
    model: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
    label: "Together Llama 3.1 8B",
    maxTokens: 8192,
    requestsPerMin: 20,
    priority: 5,
  },
  // Priority 5: Mistral
  {
    provider: "mistral",
    model: "open-mistral-nemo",
    label: "Mistral Nemo",
    maxTokens: 8192,
    requestsPerMin: 30,
    priority: 6,
  },
  // Priority 6: Gemini (always available, good fallback)
  {
    provider: "gemini",
    model: "gemini-2.0-flash",
    label: "Gemini 2.0 Flash",
    maxTokens: 8192,
    requestsPerMin: 15,
    priority: 7,
  },
  // Priority 7: OpenRouter free models
  {
    provider: "openrouter",
    model: "meta-llama/llama-3.1-8b-instruct:free",
    label: "OpenRouter Llama 3.1 8B (Free)",
    maxTokens: 4096,
    requestsPerMin: 10,
    priority: 8,
  },
  // Priority 8: Cloudflare Workers AI
  {
    provider: "cloudflare",
    model: "@cf/meta/llama-3.1-8b-instruct",
    label: "Cloudflare Llama 3.1 8B",
    maxTokens: 4096,
    requestsPerMin: 10,
    priority: 9,
  },
];
```

### 1.3 Rewrite ProviderManager with Free-First Fallback

**Modify: `packages/agents/src/provider-manager.ts`**

Add a `getFreeFirstChain()` method that returns free models first, then paid models:

```ts
getFreeFirstChain(): Array<{ provider: ProviderId; model: string; isFree: boolean }> {
  const chain: Array<{ provider: ProviderId; model: string; isFree: boolean }> = [];
  const freeModels = FREE_MODELS.filter(m => this.adapters.has(m.provider));

  // Add all free models in priority order
  for (const fm of freeModels) {
    chain.push({ provider: fm.provider, model: fm.model, isFree: true });
  }

  // Add paid models as fallback
  for (const providerId of this.getProviderChain()) {
    chain.push({ provider: providerId, model: this.getModel(providerId, "default"), isFree: false });
  }

  return chain;
}
```

Add circuit breaker health tracking:

```ts
private circuitBreaker = new Map<ProviderId, { failures: number; lastFailure: Date; isOpen: boolean }>();

private isCircuitOpen(providerId: ProviderId): boolean {
  const state = this.circuitBreaker.get(providerId);
  if (!state || !state.isOpen) return false;
  // Reset after 60 seconds
  if (Date.now() - state.lastFailure.getTime() > 60_000) {
    state.isOpen = false;
    state.failures = 0;
    return false;
  }
  return true;
}

private recordFailure(providerId: ProviderId): void {
  const state = this.circuitBreaker.get(providerId) || { failures: 0, lastFailure: new Date(), isOpen: false };
  state.failures++;
  state.lastFailure = new Date();
  if (state.failures >= 3) state.isOpen = true; // Trip after 3 failures
  this.circuitBreaker.set(providerId, state);
}
```

### 1.4 Update Types

**Modify: `packages/types/src/index.ts`**

Add new provider IDs:

```ts
export type ProviderId =
  | "openai"
  | "anthropic"
  | "openrouter"
  | "groq"
  | "gemini"
  | "litellm"
  | "mistral"
  | "together"
  | "cerebras"
  | "sambanova"
  | "cloudflare";
```

Add `isFree` to `ProviderConfig`:

```ts
export interface ProviderConfig {
  id: ProviderId;
  apiKey: string;
  baseUrl?: string;
  defaultModel: string;
  fallbackModel?: string;
  models: string[];
  isFree?: boolean;
}
```

### 1.5 Update BYOK System

**Modify: `packages/types/src/index.ts`** — Add new keys to `UserKeys`:

```ts
export interface UserKeys {
  gemini?: string;
  groq?: string;
  openai?: string;
  anthropic?: string;
  openrouter?: string;
  mistral?: string;
  together?: string;
  cerebras?: string;
  sambanova?: string;
  cloudflare?: string; // Cloudflare API token
  cloudflareAccountId?: string; // Cloudflare account ID
  tavily?: string;
  elevenlabs?: string;
}
```

**Modify: `server/src/middleware/byok.ts`** — Extract new headers:

```ts
(req as any).userKeys = {
  // ...existing...
  mistral: req.headers["x-mistral-key"] as string | undefined,
  together: req.headers["x-together-key"] as string | undefined,
  cerebras: req.headers["x-cerebras-key"] as string | undefined,
  sambanova: req.headers["x-sambanova-key"] as string | undefined,
  cloudflare: req.headers["x-cloudflare-key"] as string | undefined,
  cloudflareAccountId: req.headers["x-cloudflare-account-id"] as
    | string
    | undefined,
};
```

**Modify: `apps/web/src/lib/keyVault.ts`** — Add new providers to `LLM_PROVIDERS` and `UserKeys`:

```ts
export const LLM_PROVIDERS = [
  // ...existing 5...
  {
    key: "mistral",
    label: "Mistral AI",
    placeholder: "...",
    headerKey: "x-mistral-key",
  },
  {
    key: "together",
    label: "Together AI",
    placeholder: "...",
    headerKey: "x-together-key",
  },
  {
    key: "cerebras",
    label: "Cerebras",
    placeholder: "...",
    headerKey: "x-cerebras-key",
  },
  {
    key: "sambanova",
    label: "SambaNova",
    placeholder: "...",
    headerKey: "x-sambanova-key",
  },
  {
    key: "cloudflare",
    label: "Cloudflare Workers AI",
    placeholder: "...",
    headerKey: "x-cloudflare-key",
  },
  // ...existing tools...
];
```

### 1.6 Update Settings UI

**Modify: `apps/web/src/views/Settings.tsx`**

Add new provider rows to the LLM Providers section. Add a "Free Model Status" panel that shows which free models are available/healthy:

```tsx
<SectionCard icon={Wifi} title="Free Model Status" iconColor="#10b981">
  <p className="text-xs mb-3" style={{ color: "rgba(148,163,184,0.5)" }}>
    Active free-tier models. Signhify uses these first before falling back to
    paid models.
  </p>
  {FREE_MODELS.map((fm) => (
    <div key={fm.model} className="flex items-center gap-2 py-2">
      <div
        className={`w-2 h-2 rounded-full ${isAvailable(fm.provider) ? "bg-green-400" : "bg-gray-600"}`}
      />
      <span className="text-xs" style={{ color: "rgba(255,255,255,0.7)" }}>
        {fm.label}
      </span>
      <span
        className="text-[10px] px-1.5 py-0.5 rounded"
        style={{ background: "rgba(16,185,129,0.1)", color: "#10b981" }}
      >
        FREE
      </span>
    </div>
  ))}
</SectionCard>
```

### 1.7 Add Provider Health Endpoint

**New route: `server/src/routes/providers.ts`**

```ts
router.get("/health", authMiddleware, async (req, res) => {
  // Return health status of all configured providers
  // Tests each provider with a minimal request
});
```

Register in `server/src/index.ts`.

---

## Feature 2: VS Code Extension

### Goal

A single VS Code extension (`signhify-vscode`) that works on VS Code, Cursor, WindSurf, and Anti-Gravity. Features: sidebar chat, inline code actions, code completion, context awareness.

### 2.1 Extension Structure

```
packages/vscode-extension/
├── package.json              # Extension manifest
├── tsconfig.json
├── src/
│   ├── extension.ts          # activate/deactivate
│   ├── api/
│   │   └── client.ts         # HTTP + SSE client to Signhify server
│   ├── providers/
│   │   ├── chatViewProvider.ts       # Sidebar chat (WebviewViewProvider)
│   │   ├── completionProvider.ts     # Inline completions (InlineCompletionProvider)
│   │   ├── codeActionProvider.ts     # Explain/Fix/Refactor (CodeActionProvider)
│   │   └── diagnosticsProvider.ts    # AI diagnostics (DiagnosticCollection)
│   ├── commands/
│   │   ├── chat.ts           # signhify.chat
│   │   ├── explain.ts        # signhify.explain
│   │   ├── fix.ts            # signhify.fix
│   │   ├── refactor.ts       # signhify.refactor
│   │   └── settings.ts       # signhify.settings
│   ├── utils/
│   │   ├── context.ts        # Get active file, selection, diagnostics
│   │   └── config.ts         # Read extension settings
│   └── webview/
│       └── chat.html         # Chat panel HTML template
├── media/
│   └── icon.png
└── .vscodeignore
```

### 2.2 Extension Manifest (`package.json`)

Key contributions:

```json
{
  "name": "signhify",
  "displayName": "Signhify AI",
  "description": "AI coding assistant with multi-provider fallback",
  "engines": { "vscode": "^1.85.0" },
  "categories": ["AI", "Programming"],
  "activationEvents": ["onStartupFinished"],
  "main": "./out/extension.js",
  "contributes": {
    "viewsContainers": {
      "activitybar": [
        { "id": "signhify", "title": "Signhify AI", "icon": "media/icon.svg" }
      ]
    },
    "views": {
      "signhify": [{ "id": "signhify.chat", "name": "Chat", "type": "webview" }]
    },
    "commands": [
      { "command": "signhify.chat", "title": "Signhify: Open Chat" },
      { "command": "signhify.explain", "title": "Signhify: Explain Code" },
      { "command": "signhify.fix", "title": "Signhify: Fix Code" },
      { "command": "signhify.refactor", "title": "Signhify: Refactor Code" },
      {
        "command": "signhify.settings",
        "title": "Signhify: Configure API Keys"
      }
    ],
    "keybindings": [
      {
        "command": "signhify.chat",
        "key": "ctrl+shift+a",
        "mac": "cmd+shift+a"
      },
      {
        "command": "signhify.explain",
        "key": "ctrl+shift+e",
        "mac": "cmd+shift+e"
      }
    ],
    "configuration": {
      "title": "Signhify AI",
      "properties": {
        "signhify.serverUrl": {
          "type": "string",
          "default": "http://localhost:3001"
        },
        "signhify.apiKey": { "type": "string", "default": "" },
        "signhify.enableCompletions": { "type": "boolean", "default": true },
        "signhify.completionDelay": { "type": "number", "default": 500 }
      }
    }
  }
}
```

### 2.3 Chat View Provider

`src/providers/chatViewProvider.ts` — Implements `vscode.WebviewViewProvider`:

- Renders a chat UI in the sidebar webview
- Sends messages to `POST /api/agents/chat` with SSE streaming
- Displays streamed tokens in real-time
- Shows agent type, sources, and skill suggestions
- Supports file context: `@file` mentions inject the current file content
- Supports selection context: `@selection` injects the selected code

### 2.4 Completion Provider

`src/providers/completionProvider.ts` — Implements `vscode.InlineCompletionItemProvider`:

- Triggered on typing (with configurable debounce)
- Sends document context + cursor position to the server
- Returns inline ghost text suggestions
- Respects `.gitignore` patterns and file size limits
- Disabled in files > 1000 lines or non-code files

### 2.5 Code Action Provider

`src/providers/codeActionProvider.ts` — Implements `vscode.CodeActionProvider`:

- **Explain**: Sends selected code to Scribe agent, returns markdown explanation
- **Fix**: Sends code + diagnostics to Forge agent, returns fixed code
- **Refactor**: Sends code + instructions to Forge agent, returns refactored code
- **Generate Tests**: Sends function/class to Forge agent, returns test code
- Available as lightbulb actions and right-click context menu

### 2.6 API Client

`src/api/client.ts`:

```ts
class SignhifyClient {
  private baseUrl: string;
  private token: string;

  async chat(message: string, context?: string): AsyncGenerator<StreamEvent> {
    // POST /api/agents/chat with SSE parsing
  }

  async complete(
    filePath: string,
    position: Position,
    prefix: string,
    suffix: string,
  ): Promise<string[]> {
    // POST /api/agents/complete (new endpoint needed)
  }

  async health(): Promise<boolean> {
    // GET /api/health
  }
}
```

### 2.7 New Server Endpoint for Completions

**New route: `server/src/routes/complete.ts`**

```ts
router.post("/", authMiddleware, byokMiddleware, async (req, res) => {
  const { filePath, position, prefix, suffix, language } = req.body;
  // Use Forge agent with code-specific prompt
  // Return completion suggestions
});
```

Register in `server/src/index.ts`.

### 2.8 Build & Package

- Use `esbuild` for fast bundling (standard for VS Code extensions)
- Output to `packages/vscode-extension/out/`
- `.vscodeignore` excludes source, node_modules, etc.
- Package with `vsce package` to produce `.vsix`

---

## Feature 3: Electron Desktop App

### Goal

Wrap the existing React web app in Electron with native features: system tray, global hotkey, auto-updates, offline caching.

### 3.1 Structure

```
apps/desktop/
├── package.json
├── electron-builder.yml
├── src/
│   ├── main/
│   │   ├── index.ts          # Electron main process
│   │   ├── tray.ts           # System tray management
│   │   ├── menu.ts           # Application menu
│   │   ├── updater.ts        # Auto-update via electron-updater
│   │   └── ipc.ts            # IPC handlers (file system, notifications)
│   ├── preload/
│   │   └── index.ts          # Preload script (contextBridge)
│   └── renderer/
│       └── (symlink to apps/web/dist)  # Reuse web app build
├── resources/
│   ├── icon.icns             # macOS icon
│   ├── icon.ico              # Windows icon
│   └── icon.png              # Linux icon
└── scripts/
    └── build.ts              # Build script
```

### 3.2 Main Process (`src/main/index.ts`)

```ts
import {
  app,
  BrowserWindow,
  globalShortcut,
  ipcMain,
  nativeTheme,
} from "electron";
import { setupTray } from "./tray";
import { setupAutoUpdater } from "./updater";
import { setupIPC } from "./ipc";

let mainWindow: BrowserWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    titleBarStyle: "hiddenInset", // macOS
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Load the web app
  if (process.env.ELECTRON_DEV) {
    mainWindow.loadURL("http://localhost:5173");
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
}

app.whenReady().then(() => {
  createWindow();
  setupTray(mainWindow);
  setupAutoUpdater();
  setupIPC(mainWindow);

  // Global hotkey: Cmd/Ctrl+Shift+A = focus + open chat
  globalShortcut.register("CommandOrControl+Shift+A", () => {
    mainWindow.show();
    mainWindow.webContents.send("open-chat");
  });
});
```

### 3.3 System Tray (`src/main/tray.ts`)

```ts
import { Tray, Menu, nativeImage, app } from "electron";

export function setupTray(mainWindow: BrowserWindow) {
  const tray = new Tray(nativeImage.createFromPath("resources/icon.png"));
  tray.setToolTip("Signhify AI");

  const contextMenu = Menu.buildFromTemplate([
    { label: "Open Signhify", click: () => mainWindow.show() },
    {
      label: "Quick Chat",
      click: () => {
        mainWindow.show();
        mainWindow.webContents.send("open-quick-chat");
      },
    },
    { type: "separator" },
    { label: "Quit", click: () => app.quit() },
  ]);

  tray.setContextMenu(contextMenu);
  tray.on("double-click", () => mainWindow.show());
}
```

### 3.4 Preload Script (`src/preload/index.ts`)

```ts
import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  openFile: () => ipcRenderer.invoke("dialog:openFile"),
  saveFile: (content: string) => ipcRenderer.invoke("dialog:saveFile", content),
  showNotification: (title: string, body: string) =>
    ipcRenderer.invoke("notification", title, body),
  getPlatform: () => process.platform,
  onMessage: (callback: Function) =>
    ipcRenderer.on("open-chat", () => callback()),
  onQuickChat: (callback: Function) =>
    ipcRenderer.on("open-quick-chat", () => callback()),
});
```

### 3.5 Auto-Update (`src/main/updater.ts`)

```ts
import { autoUpdater } from "electron-updater";

export function setupAutoUpdater() {
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on("update-available", (info) => {
    // Notify renderer
  });

  autoUpdater.on("update-downloaded", (info) => {
    // Prompt user to restart
  });

  // Check for updates on launch and every 4 hours
  autoUpdater.checkForUpdatesAndNotify();
  setInterval(() => autoUpdater.checkForUpdatesAndNotify(), 4 * 60 * 60 * 1000);
}
```

### 3.6 Electron Builder Config (`electron-builder.yml`)

```yaml
appId: ai.signhify.desktop
productName: Signhify AI
directories:
  output: dist
files:
  - "out/**/*"
  - "resources/**/*"
  - "package.json"
mac:
  category: public.app-category.developer-tools
  target: [dmg, zip]
  icon: resources/icon.icns
win:
  target: [nsis, portable]
  icon: resources/icon.ico
linux:
  target: [AppImage, deb]
  icon: resources/icon.png
  category: Development
autoUpdate:
  provider: github
  owner: signhify
  repo: signhify-desktop
```

### 3.7 Dependencies

```json
{
  "dependencies": {
    "electron-updater": "^6.1.0"
  },
  "devDependencies": {
    "electron": "^28.0.0",
    "electron-builder": "^24.9.0",
    "electron-devtools-installer": "^3.2.0"
  }
}
```

---

## Implementation Order

### Phase 1: Multi-Provider Foundation (Backend)

1. Add `OpenAICompatibleAdapter` base class
2. Create 5 new adapter files (mistral, together, cerebras, sambanova, cloudflare)
3. Create `free-models.ts` registry
4. Update `ProviderManager` with free-first chain + circuit breaker
5. Update `ProviderId` type in `packages/types`
6. Update `UserKeys` type in `packages/types`
7. Update BYOK middleware
8. Update `createLLM` in `shared.ts` to use free-first chain
9. Add provider health endpoint

### Phase 2: Multi-Provider UI

10. Update `keyVault.ts` with new providers
11. Update `Settings.tsx` with new provider rows
12. Add Free Model Status panel to Settings
13. Update `settingsStore.ts` if needed

### Phase 3: VS Code Extension

14. Scaffold extension project with `package.json`
15. Implement `SignhifyClient` API client
16. Implement `ChatViewProvider` (sidebar chat)
17. Implement `CompletionProvider` (inline completions)
18. Implement `CodeActionProvider` (explain/fix/refactor)
19. Add server-side `/api/agents/complete` endpoint
20. Test on VS Code, Cursor, WindSurf

### Phase 4: Electron Desktop App

21. Scaffold Electron project
22. Implement main process with BrowserWindow
23. Implement system tray
24. Implement global hotkey
25. Implement auto-updater
26. Implement preload script / IPC
27. Build scripts for macOS, Windows, Linux
28. Test packaging and distribution

---

## Files to Create (New)

| #   | File                                                             | Purpose                                    |
| --- | ---------------------------------------------------------------- | ------------------------------------------ |
| 1   | `packages/agents/src/adapters/openai-compatible.ts`              | Base class for OpenAI-compatible providers |
| 2   | `packages/agents/src/adapters/mistral.ts`                        | Mistral AI adapter                         |
| 3   | `packages/agents/src/adapters/together.ts`                       | Together AI adapter                        |
| 4   | `packages/agents/src/adapters/cerebras.ts`                       | Cerebras adapter                           |
| 5   | `packages/agents/src/adapters/sambanova.ts`                      | SambaNova adapter                          |
| 6   | `packages/agents/src/adapters/cloudflare.ts`                     | Cloudflare Workers AI adapter              |
| 7   | `packages/agents/src/free-models.ts`                             | Free model registry                        |
| 8   | `packages/agents/src/circuit-breaker.ts`                         | Circuit breaker pattern                    |
| 9   | `server/src/routes/providers.ts`                                 | Provider health endpoint                   |
| 10  | `server/src/routes/complete.ts`                                  | Code completion endpoint                   |
| 11  | `packages/vscode-extension/package.json`                         | Extension manifest                         |
| 12  | `packages/vscode-extension/tsconfig.json`                        | TypeScript config                          |
| 13  | `packages/vscode-extension/src/extension.ts`                     | Extension entry                            |
| 14  | `packages/vscode-extension/src/api/client.ts`                    | API client                                 |
| 15  | `packages/vscode-extension/src/providers/chatViewProvider.ts`    | Chat panel                                 |
| 16  | `packages/vscode-extension/src/providers/completionProvider.ts`  | Inline completions                         |
| 17  | `packages/vscode-extension/src/providers/codeActionProvider.ts`  | Code actions                               |
| 18  | `packages/vscode-extension/src/providers/diagnosticsProvider.ts` | Diagnostics                                |
| 19  | `packages/vscode-extension/src/commands/*.ts`                    | Command handlers                           |
| 20  | `packages/vscode-extension/src/utils/context.ts`                 | Editor context utils                       |
| 21  | `packages/vscode-extension/src/webview/chat.html`                | Chat UI template                           |
| 22  | `packages/vscode-extension/.vscodeignore`                        | Extension packaging ignore                 |
| 23  | `apps/desktop/package.json`                                      | Electron app config                        |
| 24  | `apps/desktop/electron-builder.yml`                              | Build config                               |
| 25  | `apps/desktop/src/main/index.ts`                                 | Main process                               |
| 26  | `apps/desktop/src/main/tray.ts`                                  | System tray                                |
| 27  | `apps/desktop/src/main/updater.ts`                               | Auto-updater                               |
| 28  | `apps/desktop/src/main/ipc.ts`                                   | IPC handlers                               |
| 29  | `apps/desktop/src/preload/index.ts`                              | Preload script                             |

## Files to Modify (Existing)

| #   | File                                      | Change                                    |
| --- | ----------------------------------------- | ----------------------------------------- |
| 1   | `packages/types/src/index.ts`             | Add new ProviderIds, update UserKeys      |
| 2   | `packages/agents/src/adapters/index.ts`   | Export new adapters                       |
| 3   | `packages/agents/src/provider-manager.ts` | Free-first chain, circuit breaker         |
| 4   | `packages/agents/src/shared.ts`           | Update createLLM to use free-first        |
| 5   | `packages/agents/src/index.ts`            | Export new modules                        |
| 6   | `server/src/middleware/byok.ts`           | Extract new provider headers              |
| 7   | `server/src/index.ts`                     | Register new routes                       |
| 8   | `apps/web/src/lib/keyVault.ts`            | Add new providers to LLM_PROVIDERS        |
| 9   | `apps/web/src/views/Settings.tsx`         | Add new provider rows + free model status |
| 10  | `apps/web/src/stores/settingsStore.ts`    | Update if new settings needed             |

## Verification

### Multi-Provider

- Set up at least 2 free provider keys (e.g., Groq + Gemini)
- Send a chat message → verify it uses the first free provider
- Disable/invalidate the first key → verify automatic fallback to next free provider
- Check `/api/providers/health` returns correct status
- Verify Settings page shows all 10 providers and free model status

### VS Code Extension

- Install `.vsix` on VS Code → verify sidebar chat appears
- Send a message → verify streaming response in chat panel
- Select code → right-click → "Signhify: Explain Code" → verify explanation
- Type code → verify inline completion suggestions appear
- Test on Cursor and WindSurf (install same .vsix)

### Desktop App

- Run `pnpm dev` in `apps/desktop` → verify window opens with web app
- Test system tray icon and menu
- Test global hotkey (Cmd/Ctrl+Shift+A)
- Build for current platform → verify installer works
- Test auto-update flow (requires GitHub release)
