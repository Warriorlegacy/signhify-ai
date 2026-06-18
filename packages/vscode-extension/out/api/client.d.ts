export interface StreamEvent {
    type: string;
    message?: string;
    agentType?: string;
    token?: string;
    error?: string;
    sources?: Array<{
        title: string;
        url: string;
        snippet: string;
    }>;
    skill?: unknown;
}
export interface CompletionResult {
    completions: Array<{
        text: string;
        provider: string;
    }>;
}
export declare class SignhifyClient {
    private baseUrl;
    private token;
    constructor(baseUrl: string, token: string);
    private getHeaders;
    health(): Promise<boolean>;
    chat(message: string, context?: string, threadId?: string): AsyncGenerator<StreamEvent, void, unknown>;
    complete(filePath: string, prefix: string, suffix: string, language?: string): Promise<CompletionResult>;
    updateToken(token: string): void;
    updateServerUrl(url: string): void;
}
//# sourceMappingURL=client.d.ts.map