import * as vscode from "vscode";
import { SignhifyClient } from "../api/client";

export class ChatViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "signhify.chat";
  private _view?: vscode.WebviewView;
  private _messages: Array<{
    role: string;
    content: string;
    agentType?: string;
  }> = [];

  constructor(
    private readonly _extensionUri: vscode.Uri,
    private readonly _client: SignhifyClient,
  ) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken,
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlContent();

    webviewView.webview.onDidReceiveMessage(async (message) => {
      switch (message.type) {
        case "chat":
          await this._handleChat(message.text, message.context);
          break;
        case "clear":
          this._messages = [];
          this._updateWebview();
          break;
      }
    });
  }

  public async sendCodeAction(action: string, code: string, fileName: string) {
    const prompts: Record<string, string> = {
      explain: `Explain the following code from ${fileName}:\n\n\`\`\`\n${code}\n\`\`\``,
      fix: `Fix bugs in the following code from ${fileName}:\n\n\`\`\`\n${code}\n\`\`\``,
      refactor: `Refactor the following code from ${fileName} for better readability and performance:\n\n\`\`\`\n${code}\n\`\`\``,
      "generate-tests": `Generate unit tests for the following code from ${fileName}:\n\n\`\`\`\n${code}\n\`\`\``,
    };

    const prompt =
      prompts[action] || `Analyze this code from ${fileName}:\n\n${code}`;
    await this._handleChat(prompt);
    vscode.commands.executeCommand("signhify.chat.focus");
  }

  private async _handleChat(message: string, context?: string) {
    this._messages.push({ role: "user", content: message });
    this._updateWebview();

    let response = "";
    let agentType = "";

    try {
      for await (const event of this._client.chat(message, context)) {
        if (event.type === "agent" && event.agentType) {
          agentType = event.agentType;
        }
        if (event.type === "token" && event.token) {
          response += event.token;
          this._updateWebviewStreaming(response, agentType);
        }
        if (event.type === "error") {
          response = `Error: ${event.error}`;
        }
      }
    } catch (err: any) {
      response = `Connection error: ${err.message}`;
    }

    this._messages.push({ role: "assistant", content: response, agentType });
    this._updateWebview();
  }

  private _updateWebview() {
    if (this._view) {
      this._view.webview.postMessage({
        type: "update",
        messages: this._messages,
      });
    }
  }

  private _updateWebviewStreaming(partial: string, agentType: string) {
    if (this._view) {
      this._view.webview.postMessage({
        type: "streaming",
        content: partial,
        agentType,
      });
    }
  }

  private _getHtmlContent(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Signhify Chat</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      color: var(--vscode-foreground);
      background: var(--vscode-sideBar-background);
      height: 100vh;
      display: flex;
      flex-direction: column;
    }
    #messages {
      flex: 1;
      overflow-y: auto;
      padding: 12px;
    }
    .msg {
      margin-bottom: 12px;
      padding: 8px 12px;
      border-radius: 8px;
      max-width: 95%;
      word-wrap: break-word;
      white-space: pre-wrap;
    }
    .msg.user {
      background: var(--vscode-badge-background);
      color: var(--vscode-badge-foreground);
      margin-left: auto;
      border-bottom-right-radius: 2px;
    }
    .msg.assistant {
      background: var(--vscode-editor-background);
      border: 1px solid var(--vscode-widget-border);
      border-bottom-left-radius: 2px;
    }
    .agent-tag {
      font-size: 10px;
      color: var(--vscode-descriptionForeground);
      margin-bottom: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    #input-area {
      padding: 12px;
      border-top: 1px solid var(--vscode-widget-border);
      display: flex;
      gap: 8px;
    }
    #chat-input {
      flex: 1;
      background: var(--vscode-input-background);
      border: 1px solid var(--vscode-input-border);
      border-radius: 6px;
      padding: 8px 12px;
      color: var(--vscode-input-foreground);
      font-family: inherit;
      font-size: inherit;
      resize: none;
      min-height: 36px;
      max-height: 120px;
    }
    #chat-input:focus { outline: 1px solid var(--vscode-focusBorder); }
    #send-btn {
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border: none;
      border-radius: 6px;
      padding: 8px 16px;
      cursor: pointer;
      font-family: inherit;
    }
    #send-btn:hover { background: var(--vscode-button-hoverBackground); }
    #clear-btn {
      background: transparent;
      color: var(--vscode-descriptionForeground);
      border: 1px solid var(--vscode-widget-border);
      border-radius: 6px;
      padding: 4px 8px;
      cursor: pointer;
      font-size: 11px;
    }
    .status-bar {
      padding: 4px 12px;
      font-size: 11px;
      color: var(--vscode-descriptionForeground);
      border-top: 1px solid var(--vscode-widget-border);
    }
  </style>
</head>
<body>
  <div id="messages"></div>
  <div id="input-area">
    <textarea id="chat-input" placeholder="Ask anything... (@file, @selection for context)" rows="1"></textarea>
    <button id="send-btn">Send</button>
  </div>
  <div class="status-bar">
    <button id="clear-btn">Clear</button>
    <span style="margin-left: 8px;">Signhify AI — Multi-provider fallback</span>
  </div>

  <script>
    const messages = document.getElementById('messages');
    const input = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const clearBtn = document.getElementById('clear-btn');
    const vscode = acquireVsCodeApi();

    function renderMessages(msgs) {
      messages.innerHTML = msgs.map(m => {
        const tag = m.agentType ? '<div class="agent-tag">' + m.agentType + '</div>' : '';
        return '<div class="msg ' + m.role + '">' + tag + escapeHtml(m.content) + '</div>';
      }).join('');
      messages.scrollTop = messages.scrollHeight;
    }

    function renderStreaming(content, agentType) {
      let el = document.getElementById('streaming-msg');
      if (!el) {
        el = document.createElement('div');
        el.id = 'streaming-msg';
        el.className = 'msg assistant';
        messages.appendChild(el);
      }
      const tag = agentType ? '<div class="agent-tag">' + agentType + '</div>' : '';
      el.innerHTML = tag + escapeHtml(content);
      messages.scrollTop = messages.scrollHeight;
    }

    function escapeHtml(text) {
      return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function send() {
      const text = input.value.trim();
      if (!text) return;

      let context;
      if (text.includes('@file')) {
        context = 'Include file context';
      }
      if (text.includes('@selection')) {
        context = (context || '') + ' Include selection context';
      }

      vscode.postMessage({ type: 'chat', text, context });
      input.value = '';
      input.style.height = 'auto';
    }

    sendBtn.addEventListener('click', send);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        send();
      }
    });
    input.addEventListener('input', () => {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 120) + 'px';
    });
    clearBtn.addEventListener('click', () => {
      vscode.postMessage({ type: 'clear' });
    });

    window.addEventListener('message', (event) => {
      const data = event.data;
      if (data.type === 'update') {
        const el = document.getElementById('streaming-msg');
        if (el) el.remove();
        renderMessages(data.messages);
      }
      if (data.type === 'streaming') {
        renderStreaming(data.content, data.agentType);
      }
    });
  </script>
</body>
</html>`;
  }
}
