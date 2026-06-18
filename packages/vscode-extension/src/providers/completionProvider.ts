import * as vscode from "vscode";
import { SignhifyClient } from "../api/client";

export class CompletionProvider implements vscode.InlineCompletionItemProvider {
  private _debounceTimer?: ReturnType<typeof setTimeout>;
  private _lastRequest = 0;

  constructor(private readonly _client: SignhifyClient) {}

  async provideInlineCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    _context: vscode.InlineCompletionContext,
    _token: vscode.CancellationToken,
  ): Promise<vscode.InlineCompletionItem[]> {
    const config = vscode.workspace.getConfiguration("signhify");
    if (!config.get<boolean>("enableCompletions", true)) return [];

    const maxLines = config.get<number>("maxCompletionLines", 500);
    if (maxLines > 0 && document.lineCount > maxLines) return [];

    // Debounce
    const delay = config.get<number>("completionDelay", 500);
    const now = Date.now();
    if (now - this._lastRequest < delay) return [];
    this._lastRequest = now;

    // Get prefix/suffix
    const prefix = document.getText(
      new vscode.Range(new vscode.Position(0, 0), position),
    );
    const suffix = document.getText(
      new vscode.Range(position, new vscode.Position(document.lineCount, 0)),
    );

    // Skip if cursor is in a comment or string (basic heuristic)
    const line = document.lineAt(position).text;
    const trimmed = line.trimStart();
    if (
      trimmed.startsWith("//") ||
      trimmed.startsWith("#") ||
      trimmed.startsWith("/*")
    ) {
      return [];
    }

    try {
      const language = document.languageId;
      const filePath = document.fileName;
      const result = await this._client.complete(
        filePath,
        prefix,
        suffix,
        language,
      );

      return result.completions.map((c) => {
        const item = new vscode.InlineCompletionItem(c.text);
        item.range = new vscode.Range(position, position);
        return item;
      });
    } catch {
      return [];
    }
  }
}
