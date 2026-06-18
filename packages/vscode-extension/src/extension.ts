import * as vscode from "vscode";
import { SignhifyClient } from "./api/client";
import { ChatViewProvider } from "./providers/chatViewProvider";
import { CompletionProvider } from "./providers/completionProvider";
import { CodeActionProvider } from "./providers/codeActionProvider";

let client: SignhifyClient;

export function activate(context: vscode.ExtensionContext) {
  const config = vscode.workspace.getConfiguration("signhify");
  const serverUrl = config.get<string>("serverUrl", "http://localhost:3001");
  const apiToken = config.get<string>("apiToken", "");

  client = new SignhifyClient(serverUrl, apiToken);

  // Chat View Provider (sidebar)
  const chatProvider = new ChatViewProvider(context.extensionUri, client);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider("signhify.chat", chatProvider, {
      webviewOptions: { retainContextWhenHidden: true },
    }),
  );

  // Completion Provider (inline ghost text)
  const completionProvider = new CompletionProvider(client);
  if (config.get<boolean>("enableCompletions", true)) {
    context.subscriptions.push(
      vscode.languages.registerInlineCompletionItemProvider(
        { scheme: "file" },
        completionProvider,
      ),
    );
  }

  // Code Action Provider (explain/fix/refactor)
  const codeActionProvider = new CodeActionProvider(client);
  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider(
      { scheme: "file" },
      codeActionProvider,
      { providedCodeActionKinds: CodeActionProvider.providedCodeActionKinds },
    ),
  );

  // Commands
  context.subscriptions.push(
    vscode.commands.registerCommand("signhify.chat", () => {
      vscode.commands.executeCommand("signhify.chat.focus");
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("signhify.focusChat", () => {
      vscode.commands.executeCommand("signhify.chat.focus");
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("signhify.explain", async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;
      const selection = editor.document.getText(editor.selection);
      if (!selection) {
        vscode.window.showWarningMessage("Select code to explain.");
        return;
      }
      await chatProvider.sendCodeAction(
        "explain",
        selection,
        editor.document.fileName,
      );
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("signhify.fix", async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;
      const selection = editor.document.getText(editor.selection);
      if (!selection) {
        vscode.window.showWarningMessage("Select code to fix.");
        return;
      }
      const diagnostics = vscode.languages.getDiagnostics(editor.document.uri);
      const errorContext =
        diagnostics.length > 0
          ? `\n\nDiagnostics:\n${diagnostics.map((d) => d.message).join("\n")}`
          : "";
      await chatProvider.sendCodeAction(
        "fix",
        selection + errorContext,
        editor.document.fileName,
      );
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("signhify.refactor", async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;
      const selection = editor.document.getText(editor.selection);
      if (!selection) {
        vscode.window.showWarningMessage("Select code to refactor.");
        return;
      }
      await chatProvider.sendCodeAction(
        "refactor",
        selection,
        editor.document.fileName,
      );
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("signhify.generateTests", async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;
      const selection = editor.document.getText(editor.selection);
      if (!selection) {
        vscode.window.showWarningMessage("Select code to generate tests for.");
        return;
      }
      await chatProvider.sendCodeAction(
        "generate-tests",
        selection,
        editor.document.fileName,
      );
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("signhify.settings", () => {
      vscode.commands.executeCommand(
        "workbench.action.openSettings",
        "signhify",
      );
    }),
  );

  // Status bar
  const statusItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100,
  );
  statusItem.text = "$(sparkle) Signhify";
  statusItem.tooltip = "Signhify AI — Click to open chat";
  statusItem.command = "signhify.chat";
  statusItem.show();
  context.subscriptions.push(statusItem);

  // Check server health
  client.health().then((ok) => {
    if (ok) {
      statusItem.text = "$(sparkle) Signhify";
      statusItem.color = undefined;
    } else {
      statusItem.text = "$(warning) Signhify";
      statusItem.tooltip = "Signhify server not reachable";
    }
  });

  vscode.window.showInformationMessage("Signhify AI activated");
}

export function deactivate() {}
