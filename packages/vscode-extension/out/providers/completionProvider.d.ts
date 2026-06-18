import * as vscode from "vscode";
import { SignhifyClient } from "../api/client";
export declare class CompletionProvider implements vscode.InlineCompletionItemProvider {
    private readonly _client;
    private _debounceTimer?;
    private _lastRequest;
    constructor(_client: SignhifyClient);
    provideInlineCompletionItems(document: vscode.TextDocument, position: vscode.Position, _context: vscode.InlineCompletionContext, _token: vscode.CancellationToken): Promise<vscode.InlineCompletionItem[]>;
}
//# sourceMappingURL=completionProvider.d.ts.map