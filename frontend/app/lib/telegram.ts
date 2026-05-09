/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState } from "react";
import { api, getApiError } from "@/app/lib/api";

export interface TelegramWebAppUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

interface TelegramWebApp {
  initData?: string;
  initDataUnsafe?: { user?: TelegramWebAppUser };
  colorScheme?: "light" | "dark";
  ready: () => void;
  expand: () => void;
  close: () => void;
  HapticFeedback?: {
    impactOccurred: (style: "light" | "medium" | "heavy" | "rigid" | "soft") => void;
    notificationOccurred: (type: "error" | "success" | "warning") => void;
  };
}

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp };
  }
}

export interface AppUser {
  id: number;
  telegram_id: string;
  username: string;
  display_name: string;
  role: string;
}

const STORAGE_KEY = "maskoff:user";

function fromStorage() {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AppUser;
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function saveUser(user: AppUser) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function useTelegramUser() {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [telegramUser, setTelegramUser] = useState<TelegramWebAppUser | null>(null);
  const [status, setStatus] = useState<"idle" | "syncing" | "ready" | "manual" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = fromStorage();
    if (stored) {
      setUser(stored);
      setStatus("ready");
    }

    const app = window.Telegram?.WebApp ?? null;
    setWebApp(app);
    app?.ready();
    app?.expand();

    const tgUser = app?.initDataUnsafe?.user ?? null;
    setTelegramUser(tgUser);

    if (!tgUser) {
      setStatus(stored ? "ready" : "manual");
      return;
    }

    let cancelled = false;
    setStatus("syncing");
    api
      .post<AppUser>("/api/users/register", {
        telegram_id: String(tgUser.id),
        username: tgUser.username ?? "",
        display_name: [tgUser.first_name, tgUser.last_name].filter(Boolean).join(" ") || tgUser.username || `Player ${tgUser.id}`,
      })
      .then((response) => {
        if (cancelled) return;
        saveUser(response.data);
        setUser(response.data);
        setStatus("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        setError(getApiError(err, "Could not connect Telegram user"));
        setStatus(stored ? "ready" : "error");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const actions = useMemo(
    () => ({
      saveManualUser: (manualUser: AppUser) => {
        saveUser(manualUser);
        setUser(manualUser);
        setStatus("ready" as const);
      },
      hapticSuccess: () => webApp?.HapticFeedback?.notificationOccurred("success"),
      hapticError: () => webApp?.HapticFeedback?.notificationOccurred("error"),
      hapticTap: () => webApp?.HapticFeedback?.impactOccurred("light"),
      close: () => webApp?.close(),
    }),
    [webApp],
  );

  return { user, telegramUser, webApp, status, error, isTelegram: Boolean(webApp), ...actions };
}