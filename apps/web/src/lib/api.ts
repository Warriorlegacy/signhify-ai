const API_URL = import.meta.env.VITE_API_URL ?? "/api";

export function getApiUrl(path: string): string {
  return `${API_URL}${path}`;
}

export function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("signhify_token");
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

export async function fetchApi<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(getApiUrl(path), {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
      ...(options.headers as Record<string, string>),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error ?? "API request failed");
  }
  return res.json();
}
