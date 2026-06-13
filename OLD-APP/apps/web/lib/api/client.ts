import Cookies from "js-cookie";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function fetchWithAuth(path: string, options: RequestInit = {}): Promise<Response> {
  let token: string | undefined;

  if (typeof window === "undefined") {
    try {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      token = cookieStore.get("token")?.value;
    } catch {
      // Ignore if called outside request context (e.g. build time static generation)
    }
  } else {
    token = Cookies.get("token");
  }

  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });
}

export async function checkDemoMode(): Promise<boolean> {
  if (typeof window === "undefined") {
    try {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      return cookieStore.get("demo_mode")?.value === "true";
    } catch {
      return true;
    }
  }
  return Cookies.get("demo_mode") === "true";
}
