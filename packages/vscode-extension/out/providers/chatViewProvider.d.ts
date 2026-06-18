import * as vscode from "vscode";
import { SignhifyClient } from "../api/client";
export declare class ChatViewProvider implements vscode.WebviewViewProvider {
    private readonly _extensionUri;
    private readonly _client;
    static readonly viewType = "signhify.chat";
    private _view?;
    private _messages;
    constructor(_extensionUri: vscode.Uri, _client: SignhifyClient);
    resolveWebviewView(webviewView: vscode.WebviewView, _context: vscode.WebviewViewResolveContext, _token: vscode.CancellationToken): void;
    sendCodeAction(action: string, code: string, fileName: string): Promise<void>;
    private _handleChat;
    private _updateWebview;
    private _updateWebviewStreaming;
    private _getHtmlContent;
}
//# sourceMappingURL=chatViewProvider.d.ts.map