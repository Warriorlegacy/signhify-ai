# Signhify AI Desktop

Native desktop app for Signhify AI with system tray, global hotkeys, and auto-updates.

## Prerequisites

- Node.js >= 20
- pnpm (workspace package manager)

## Development

```bash
# From workspace root
pnpm install
pnpm --filter signhify-desktop dev
```

## Build

```bash
# Build TypeScript
pnpm --filter signhify-desktop build

# Package for current platform
pnpm --filter signhify-desktop package:win
pnpm --filter signhify-desktop package:mac
pnpm --filter signhify-desktop package:linux

# Package for all platforms
pnpm --filter signhify-desktop package:all
```

## Features

- **System tray** — minimize to tray, quick chat from tray menu
- **Global hotkeys**
  - `Ctrl+Shift+A` — focus + open chat
  - `Ctrl+Shift+S` — quick chat (send context)
- **Auto-updates** — checks GitHub releases, prompts to install
- **Context menus** — right-click to explain/fix/refactor code
- **Native file dialogs** — open/save files via IPC

## Configuration

The desktop app connects to the Signhify server (default: `http://localhost:3001`).

Set `ELECTRON_DEV=1` to enable dev mode (loads from Vite dev server + opens DevTools).

## Icons

Place platform icons in `resources/`:

- `icon.icns` — macOS
- `icon.ico` — Windows
- `icon.png` — Linux (256x256 or larger)

Generate from `resources/icon.svg` using [electron-icon-maker](https://github.com/nicedoc/electron-icon-maker) or similar.
