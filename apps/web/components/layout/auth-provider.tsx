"use client";

import { useParams, useRouter } from "next/navigation";
import React, { createContext, useContext, useEffect, useState } from "react";
import { clearTokens, getAccessToken, getSessionData, isDemoMode } from "@/lib/auth";

type AuthUser = {
  id: string;
  name: string;
  email: string;
  status: string;
  roleKey?: string;
};

type AuthCompany = {
  id: string;
  name: string;
  slug: string;
};

type AuthContextType = {
  user: AuthUser | null;
  company: AuthCompany | null;
  isDemo: boolean;
  loading: boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  company: null,
  isDemo: false,
  loading: true,
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [company, setCompany] = useState<AuthCompany | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || "tr";

  useEffect(() => {
    const token = getAccessToken();
    const session = getSessionData();
    const demo = isDemoMode();

    setIsDemo(demo);
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
    setIsDemo(false);
    router.replace(`/${locale}/login`);
  };

  return (
    <AuthContext.Provider value={{ user, company, isDemo, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
