import * as vscode from "vscode";
import { SignhifyClient } from "../api/client";
export declare class CodeActionProvider implements vscode.CodeActionProvider {
    private readonly _client;
    static readonly providedCodeActionKinds: vscode.CodeActionKind[];
    constructor(_client: SignhifyClient);
    provideCodeActions(document: vscode.TextDocument, range: vscode.Range, _context: vscode.CodeActionContext, _token: vscode.CancellationToken): vscode.CodeAction[];
}
//# sourceMappingURL=codeActionProvider.d.ts.map