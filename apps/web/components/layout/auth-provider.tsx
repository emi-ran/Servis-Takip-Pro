"use client";

import { useParams, useRouter } from "next/navigation";
import React, { createContext, useContext, useEffect, useState } from "react";
import { clearTokens, getAccessToken, getSessionData } from "@/lib/auth";

type AuthUser = {
  id: string;
  name: string;
  email: string;
  status: string;
};

type AuthCompany = {
  id: string;
  name: string;
  slug: string;
};

type AuthContextType = {
  user: AuthUser | null;
  company: AuthCompany | null;
  loading: boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  company: null,
  loading: true,
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [company, setCompany] = useState<AuthCompany | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || "tr";

  useEffect(() => {
    const token = getAccessToken();
    const session = getSessionData();

    if (token && session) {
      setUser(session.user as AuthUser);
      setCompany(session.company as AuthCompany);
    } else {
      setUser(null);
      setCompany(null);
    }
    setLoading(false);
  }, []);

  const logout = () => {
    clearTokens();
    setUser(null);
    setCompany(null);
    router.replace(`/${locale}/login`);
  };

  return (
    <AuthContext.Provider value={{ user, company, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
