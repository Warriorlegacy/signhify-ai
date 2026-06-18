"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const client_1 = require("./api/client");
const chatViewProvider_1 = require("./providers/chatViewProvider");
const completionProvider_1 = require("./providers/completionProvider");
const codeActionProvider_1 = require("./providers/codeActionProvider");
let client;
function activate(context) {
    const config = vscode.workspace.getConfiguration("signhify");
    const serverUrl = config.get("serverUrl", "http://localhost:3001");
    const apiToken = config.get("apiToken", "");
    client = new client_1.SignhifyClient(serverUrl, apiToken);
    // Chat View Provider (sidebar)
    const chatProvider = new chatViewProvider_1.ChatViewProvider(context.extensionUri, client);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider("signhify.chat", chatProvider, {
        webviewOptions: { retainContextWhenHidden: true },
    }));
    // Completion Provider (inline ghost text)
    const completionProvider = new completionProvider_1.CompletionProvider(client);
    if (config.get("enableCompletions", true)) {
        context.subscriptions.push(vscode.languages.registerInlineCompletionItemProvider({ scheme: "file" }, completionProvider));
    }
    // Code Action Provider (explain/fix/refactor)
    const codeActionProvider = new codeActionProvider_1.CodeActionProvider(client);
    context.subscriptions.push(vscode.languages.registerCodeActionsProvider({ scheme: "file" }, codeActionProvider, { providedCodeActionKinds: codeActionProvider_1.CodeActionProvider.providedCodeActionKinds }));
    // Commands
    context.subscriptions.push(vscode.commands.registerCommand("signhify.chat", () => {
        vscode.commands.executeCommand("signhify.chat.focus");
    }));
    context.subscriptions.push(vscode.commands.registerCommand("signhify.focusChat", () => {
        vscode.commands.executeCommand("signhify.chat.focus");
    }));
    context.subscriptions.push(vscode.commands.registerCommand("signhify.explain", async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor)
            return;
        const selection = editor.document.getText(editor.selection);
        if (!selection) {
            vscode.window.showWarningMessage("Select code to explain.");
            return;
        }
        await chatProvider.sendCodeAction("explain", selection, editor.document.fileName);
    }));
    context.subscriptions.push(vscode.commands.registerCommand("signhify.fix", async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor)
            return;
        const selection = editor.document.getText(editor.selection);
        if (!selection) {
            vscode.window.showWarningMessage("Select code to fix.");
            return;
        }
        const diagnostics = vscode.languages.getDiagnostics(editor.document.uri);
        const errorContext = diagnostics.length > 0
            ? `\n\nDiagnostics:\n${diagnostics.map((d) => d.message).join("\n")}`
            : "";
        await chatProvider.sendCodeAction("fix", selection + errorContext, editor.document.fileName);
    }));
    context.subscriptions.push(vscode.commands.registerCommand("signhify.refactor", async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor)
            return;
        const selection = editor.document.getText(editor.selection);
        if (!selection) {
            vscode.window.showWarningMessage("Select code to refactor.");
            return;
        }
        await chatProvider.sendCodeAction("refactor", selection, editor.document.fileName);
    }));
    context.subscriptions.push(vscode.commands.registerCommand("signhify.generateTests", async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor)
            return;
        const selection = editor.document.getText(editor.selection);
        if (!selection) {
            vscode.window.showWarningMessage("Select code to generate tests for.");
            return;
        }
        await chatProvider.sendCodeAction("generate-tests", selection, editor.document.fileName);
    }));
    context.subscriptions.push(vscode.commands.registerCommand("signhify.settings", () => {
        vscode.commands.executeCommand("workbench.action.openSettings", "signhify");
    }));
    // Status bar
    const statusItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
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
        }
        else {
            statusItem.text = "$(warning) Signhify";
            statusItem.tooltip = "Signhify server not reachable";
        }
    });
    vscode.window.showInformationMessage("Signhify AI activated");
}
function deactivate() { }
//# sourceMappingURL=extension.js.map