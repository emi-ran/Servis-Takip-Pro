"use client";

import { ArrowRight, Building2, Lock, Mail, User, Wrench } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { registerRequest } from "@/lib/api/auth";
import { setSessionData, setTokens } from "@/lib/auth";
import type { Locale } from "@/lib/i18n/settings";

type Dictionary = Awaited<ReturnType<typeof import("@/lib/i18n/get-dictionary").getDictionary>>;

type OnboardingViewProps = {
  locale: Locale;
  dictionary: Dictionary;
};

// Helper function to slugify text
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 -]/g, "") // remove invalid chars
    .replace(/\s+/g, "-") // collapse whitespace and replace by -
    .replace(/-+/g, "-"); // collapse dashes
}

export function OnboardingView({ locale, dictionary }: OnboardingViewProps) {
  const [companyName, setCompanyName] = useState("");
  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Auto-generate slug from company name
  const handleCompanyNameChange = (value: string) => {
    setCompanyName(value);
    setSlug(slugify(value));
  };

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await registerRequest({
        companyName,
        slug,
        name,
        email,
        password,
      });

      setTokens(response.accessToken, response.refreshToken);
      setSessionData(response.user, response.company);

      router.replace(`/${locale}/dashboard`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Kayıt işlemi başarısız.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex overflow-hidden">
        {/* Left Side - Brand */}
        <div className="hidden md:flex flex-col justify-center items-center bg-blue-600 w-1/2 p-12 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1581092921461-eab62e97a782?auto=format&fit=crop&q=80&w=1000')] bg-cover opacity-10 mix-blend-overlay"></div>
          <div className="relative z-10">
            <div className="w-20 h-20 bg-white/20 rounded-2xl backdrop-blur-sm flex items-center justify-center mx-auto mb-6">
              <Wrench className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2">
              {dictionary.brand.name} <span className="text-blue-200">{dictionary.brand.pro}</span>
            </h1>
            <p className="text-blue-100 mb-8">{dictionary.brand.tagline}</p>
            <div className="text-sm text-blue-200/60 mt-auto">&copy; 2026 CetTech Teknoloji A.Ş.</div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white">
          <div className="mb-6 text-center md:text-left">
            <h2 className="text-2xl font-bold text-slate-800">{dictionary.auth.register.title}</h2>
            <p className="text-slate-500 mt-1">{dictionary.auth.register.subtitle}</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="company-name-input">
                {dictionary.auth.register.companyName}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building2 className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="company-name-input"
                  type="text"
                  required
                  value={companyName}
                  onChange={(event) => handleCompanyNameChange(event.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder={dictionary.auth.register.companyNamePlaceholder}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="slug-input">
                {dictionary.auth.register.slug}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-slate-400 text-sm">/</span>
                </div>
                <input
                  id="slug-input"
                  type="text"
                  required
                  value={slug}
                  onChange={(event) => setSlug(slugify(event.target.value))}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder={dictionary.auth.register.slugPlaceholder}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="name-input">
                {dictionary.auth.register.name}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="name-input"
                  type="text"
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder={dictionary.auth.register.namePlaceholder}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="email-input">
                {dictionary.auth.register.email}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder={dictionary.auth.register.emailPlaceholder}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="password-input">
                {dictionary.auth.register.password}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password-input"
                  type="password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder={dictionary.auth.register.passwordPlaceholder}
                />
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm font-medium bg-red-50 p-2.5 rounded-lg border border-red-100">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-2.5 px-4 rounded-lg shadow-lg shadow-blue-200 transition-all transform active:scale-95"
            >
              {loading ? dictionary.auth.register.loading : dictionary.auth.register.button}{" "}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            <span>{dictionary.auth.register.hasAccount} </span>
            <Link
              href={`/${locale}/login`}
              className="text-blue-600 hover:underline font-semibold"
            >
              {dictionary.auth.register.loginLink}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
