export type AuthUser = {
  id: string;
  name: string;
  email: string;
  status: string;
  roleKey?: string;
};

export type AuthCompany = {
  id: string;
  name: string;
  slug: string;
};

export type AuthResponse = {
  user: AuthUser;
  company: AuthCompany;
  accessToken: string;
  refreshToken: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function loginRequest(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Giriş yapılamadı.");
  }

  return res.json();
}

export async function registerRequest(input: {
  companyName: string;
  slug: string;
  name: string;
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Kayıt işlemi başarısız.");
  }

  return res.json();
}

export async function getProfileRequest(token: string): Promise<unknown> {
  const res = await fetch(`${API_URL}/auth/profile`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Oturum doğrulanamadı.");
  }

  return res.json();
}
