import * as vscode from "vscode";
import { SignhifyClient } from "../api/client";

export class CodeActionProvider implements vscode.CodeActionProvider {
  static readonly providedCodeActionKinds = [
    vscode.CodeActionKind.QuickFix,
    vscode.CodeActionKind.Refactor,
    vscode.CodeActionKind.Source,
  ];

  constructor(private readonly _client: SignhifyClient) {}

  provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range,
    _context: vscode.CodeActionContext,
    _token: vscode.CancellationToken,
  ): vscode.CodeAction[] {
    const selectedCode = document.getText(range);
    if (!selectedCode) return [];

    const actions: vscode.CodeAction[] = [];

    // Explain
    const explainAction = new vscode.CodeAction(
      "Signhify: Explain Code",
      vscode.CodeActionKind.RefactorExtract,
    );
    explainAction.command = {
      command: "signhify.explain",
      title: "Explain Code",
    };
    explainAction.isPreferred = false;
    actions.push(explainAction);

    // Fix
    const fixAction = new vscode.CodeAction(
      "Signhify: Fix Code",
      vscode.CodeActionKind.QuickFix,
    );
    fixAction.command = {
      command: "signhify.fix",
      title: "Fix Code",
    };
    fixAction.isPreferred = true;
    actions.push(fixAction);

    // Refactor
    const refactorAction = new vscode.CodeAction(
      "Signhify: Refactor Code",
      vscode.CodeActionKind.RefactorRewrite,
    );
    refactorAction.command = {
      command: "signhify.refactor",
      title: "Refactor Code",
    };
    actions.push(refactorAction);

    // Generate Tests
    const testAction = new vscode.CodeAction(
      "Signhify: Generate Tests",
      vscode.CodeActionKind.Source,
    );
    testAction.command = {
      command: "signhify.generateTests",
      title: "Generate Tests",
    };
    actions.push(testAction);

    return actions;
  }
}
