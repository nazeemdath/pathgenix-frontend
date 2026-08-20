/**
 * Path-GeniX Frontend API Client
 * Connects Next.js UI to FastAPI backend (http://localhost:8000/api/v1)
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export function getAuthToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("pathgenix_token");
  }
  return null;
}

export function setAuthToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("pathgenix_token", token);
  }
}

export function removeAuthToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("pathgenix_token");
  }
}

export interface APIResponseEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<APIResponseEnvelope<T>> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    const errorMsg =
      body?.error?.message || body?.message || "API request failed";
    const error = new Error(errorMsg);
    (error as any).code = body?.error?.code || "api_error";
    (error as any).status = res.status;
    throw error;
  }

  return body as APIResponseEnvelope<T>;
}
