import { API_BASE_URL } from "@/constants/baseUrl";
import { useAuthStore } from "@/stores/authStore";

export async function authFetch(
  endpoint: string,
  init?: RequestInit,
): Promise<Response> {
  const url = endpoint.startsWith("http://") || endpoint.startsWith("https://")
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  const token = useAuthStore.getState().token;
  const headers = new Headers(init?.headers);

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(url, {
    ...init,
    credentials: "include",
    headers,
  });
}
