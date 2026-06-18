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
exports.CompletionProvider = void 0;
const vscode = __importStar(require("vscode"));
class CompletionProvider {
    _client;
    _debounceTimer;
    _lastRequest = 0;
    constructor(_client) {
        this._client = _client;
    }
    async provideInlineCompletionItems(document, position, _context, _token) {
        const config = vscode.workspace.getConfiguration("signhify");
        if (!config.get("enableCompletions", true))
            return [];
        const maxLines = config.get("maxCompletionLines", 500);
        if (maxLines > 0 && document.lineCount > maxLines)
            return [];
        // Debounce
        const delay = config.get("completionDelay", 500);
        const now = Date.now();
        if (now - this._lastRequest < delay)
            return [];
        this._lastRequest = now;
        // Get prefix/suffix
        const prefix = document.getText(new vscode.Range(new vscode.Position(0, 0), position));
        const suffix = document.getText(new vscode.Range(position, new vscode.Position(document.lineCount, 0)));
        // Skip if cursor is in a comment or string (basic heuristic)
        const line = document.lineAt(position).text;
        const trimmed = line.trimStart();
        if (trimmed.startsWith("//") ||
            trimmed.startsWith("#") ||
            trimmed.startsWith("/*")) {
            return [];
        }
        try {
            const language = document.languageId;
            const filePath = document.fileName;
            const result = await this._client.complete(filePath, prefix, suffix, language);
            return result.completions.map((c) => {
                const item = new vscode.InlineCompletionItem(c.text);
                item.range = new vscode.Range(position, position);
                return item;
            });
        }
        catch {
            return [];
        }
    }
}
exports.CompletionProvider = CompletionProvider;
//# sourceMappingURL=completionProvider.js.map