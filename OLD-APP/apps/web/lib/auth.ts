import Cookies from "js-cookie";

const TOKEN_KEY = "token";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_KEY = "user";
const COMPANY_KEY = "company";
const DEMO_MODE_KEY = "demo_mode";

export function setTokens(accessToken: string, refreshToken: string) {
  Cookies.set(TOKEN_KEY, accessToken, { expires: 7, path: "/" });
  Cookies.set(REFRESH_TOKEN_KEY, refreshToken, { expires: 7, path: "/" });
}

export function getAccessToken(): string | undefined {
  return Cookies.get(TOKEN_KEY);
}

export function getRefreshToken(): string | undefined {
  return Cookies.get(REFRESH_TOKEN_KEY);
}

export function setDemoMode(isDemo: boolean) {
  if (isDemo) {
    Cookies.set(DEMO_MODE_KEY, "true", { expires: 7, path: "/" });
  } else {
    Cookies.remove(DEMO_MODE_KEY, { path: "/" });
  }
}

export function isDemoMode(): boolean {
  return Cookies.get(DEMO_MODE_KEY) === "true";
}

export function clearTokens() {
  Cookies.remove(TOKEN_KEY, { path: "/" });
  Cookies.remove(REFRESH_TOKEN_KEY, { path: "/" });
  Cookies.remove(USER_KEY, { path: "/" });
  Cookies.remove(COMPANY_KEY, { path: "/" });
  Cookies.remove(DEMO_MODE_KEY, { path: "/" });
}

export function setSessionData(user: unknown, company: unknown) {
  Cookies.set(USER_KEY, JSON.stringify(user), { expires: 7, path: "/" });
  Cookies.set(COMPANY_KEY, JSON.stringify(company), { expires: 7, path: "/" });
}

export function getSessionData(): { user: unknown; company: unknown } | null {
  const userStr = Cookies.get(USER_KEY);
  const companyStr = Cookies.get(COMPANY_KEY);

  if (!userStr || !companyStr) return null;

  try {
    return {
      user: JSON.parse(userStr) as unknown,
      company: JSON.parse(companyStr) as unknown,
    };
  } catch {
    return null;
  }
}
