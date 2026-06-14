type RequestOptions = {
  method?: string;
  body?: unknown;
  params?: Record<string, string>;
};

export async function apiClient<T>(
  url: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, params } = options;

  const searchParams = params ? new URLSearchParams(params).toString() : "";
  const fullUrl = params ? `${url}?${searchParams}` : url;

  const response = await fetch(fullUrl, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined") {
      await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
      window.location.replace("/login");
      throw new Error("Oturum geçersiz");
    }

    const error = await response.json().catch(() => ({ message: "Bir hata oluştu" }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}
