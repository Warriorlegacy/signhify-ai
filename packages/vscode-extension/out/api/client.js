"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignhifyClient = void 0;
class SignhifyClient {
    baseUrl;
    token;
    constructor(baseUrl, token) {
        this.baseUrl = baseUrl;
        this.token = token;
    }
    getHeaders() {
        const headers = {
            "Content-Type": "application/json",
        };
        if (this.token) {
            headers["Authorization"] = `Bearer ${this.token}`;
        }
        return headers;
    }
    async health() {
        try {
            const res = await fetch(`${this.baseUrl}/api/health`);
            return res.ok;
        }
        catch {
            return false;
        }
    }
    async *chat(message, context, threadId) {
        const res = await fetch(`${this.baseUrl}/api/agents/chat`, {
            method: "POST",
            headers: this.getHeaders(),
            body: JSON.stringify({ message, context, threadId }),
        });
        if (!res.ok) {
            throw new Error(`Chat request failed: ${res.status}`);
        }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        while (true) {
            const { done, value } = await reader.read();
            if (done)
                break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n\n");
            buffer = lines.pop() ?? "";
            for (const line of lines) {
                if (!line.startsWith("data:"))
                    continue;
                try {
                    const event = JSON.parse(line.slice(5).trim());
                    yield event;
                }
                catch {
                    /* skip malformed events */
                }
            }
        }
    }
    async complete(filePath, prefix, suffix, language) {
        const res = await fetch(`${this.baseUrl}/api/agents/complete`, {
            method: "POST",
            headers: this.getHeaders(),
            body: JSON.stringify({ filePath, prefix, suffix, language }),
        });
        if (!res.ok) {
            throw new Error(`Completion request failed: ${res.status}`);
        }
        return res.json();
    }
    updateToken(token) {
        this.token = token;
    }
    updateServerUrl(url) {
        this.baseUrl = url;
    }
}
exports.SignhifyClient = SignhifyClient;
//# sourceMappingURL=client.js.map