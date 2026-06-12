"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { ensureTrialSubscription } from "@/features/subscriptions/subscriptions";

type AuthResult =
  | {
      ok: true;
    }
  | {
      ok: false;
      error: string;
    };

export async function login(email: string, password: string): Promise<AuthResult> {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  if (error) {
    return {
      ok: false,
      error: error.message,
    };
  }

  return { ok: true };
}

export async function signup(email: string, password: string): Promise<AuthResult> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
  });

  if (error) {
    return {
      ok: false,
      error: error.message,
    };
  }

  if (data.user) {
    try {
      await ensureTrialSubscription(data.user.id);
    } catch {
      // Supabase may require email confirmation, in which case the database trigger creates the trial.
    }
  }

  return { ok: true };
}

export async function logout() {
  const supabase = createClient();
  await supabase.auth.signOut();
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    isAuthenticated: Boolean(user),
    isLoading,
    session: user,
    user,
  };
}
