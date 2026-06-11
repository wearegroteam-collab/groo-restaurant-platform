"use client";

import { useEffect, useState } from "react";

const AUTH_STORAGE_KEY = "menu-hangar:auth-session";
const AUTH_CHANGE_EVENT = "menu-hangar:auth-change";
const MOCK_USER = {
  email: "admin@grooteam.com",
  password: "123456",
};

export type AuthSession = {
  email: string;
  loggedAt: string;
};

type LoginResult =
  | {
      ok: true;
      session: AuthSession;
    }
  | {
      ok: false;
      error: string;
    };

function readSession() {
  if (typeof window === "undefined") {
    return null;
  }

  const storedSession = window.localStorage.getItem(AUTH_STORAGE_KEY);

  if (!storedSession) {
    return null;
  }

  try {
    return JSON.parse(storedSession) as AuthSession;
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

function saveSession(session: AuthSession | null) {
  if (session) {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  } else {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  }

  window.dispatchEvent(new CustomEvent(AUTH_CHANGE_EVENT, { detail: session }));
}

export function login(email: string, password: string): LoginResult {
  if (email.trim().toLowerCase() !== MOCK_USER.email || password !== MOCK_USER.password) {
    return {
      ok: false,
      error: "Credenciales incorrectas.",
    };
  }

  const session: AuthSession = {
    email: MOCK_USER.email,
    loggedAt: new Date().toISOString(),
  };

  saveSession(session);

  return {
    ok: true,
    session,
  };
}

export function logout() {
  saveSession(null);
}

export function useAuth() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setSession(readSession());
    setIsLoading(false);

    function handleStorage(event: StorageEvent) {
      if (event.key === AUTH_STORAGE_KEY) {
        setSession(readSession());
      }
    }

    function handleAuthChange(event: Event) {
      const customEvent = event as CustomEvent<AuthSession | null>;
      setSession(customEvent.detail);
    }

    window.addEventListener("storage", handleStorage);
    window.addEventListener(AUTH_CHANGE_EVENT, handleAuthChange);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
    };
  }, []);

  return {
    isAuthenticated: Boolean(session),
    isLoading,
    session,
  };
}
