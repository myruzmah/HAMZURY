import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { TRPCClientError } from "@trpc/client";
import { useCallback, useEffect, useMemo } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = "/" } =
    options ?? {};
  const utils = trpc.useUtils();

  // ─── Session expiry check — clear stale localStorage before querying ─────
  useEffect(() => {
    try {
      const raw = localStorage.getItem("manus-runtime-user-info");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
          localStorage.removeItem("manus-runtime-user-info");
          localStorage.removeItem("hamzury-affiliate-session");
          // Force redirect to home if on a protected page
          if (typeof window !== "undefined" && window.location.pathname !== "/") {
            window.location.href = "/";
          }
        }
      }
    } catch {
      // Corrupted data — clear it
      localStorage.removeItem("manus-runtime-user-info");
    }
  }, []);

  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.setData(undefined, null);
    },
  });

  const logout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error: unknown) {
      if (
        error instanceof TRPCClientError &&
        error.data?.code === "UNAUTHORIZED"
      ) {
        // already logged out — still clean up below
      } else {
        throw error;
      }
    } finally {
      utils.auth.me.setData(undefined, null);
      localStorage.removeItem("manus-runtime-user-info");
      localStorage.removeItem("hamzury-affiliate-session");
      await utils.auth.me.invalidate();
      window.location.href = "/";
    }
  }, [logoutMutation, utils]);

  const state = useMemo(() => {
    localStorage.setItem(
      "manus-runtime-user-info",
      JSON.stringify({ data: meQuery.data, expiresAt: Date.now() + 8 * 60 * 60 * 1000 })
    );
    return {
      user: meQuery.data ?? null,
      loading: meQuery.isLoading || meQuery.isFetching || logoutMutation.isPending,
      error: meQuery.error ?? logoutMutation.error ?? null,
      isAuthenticated: Boolean(meQuery.data),
    };
  }, [
    meQuery.data,
    meQuery.error,
    meQuery.isLoading,
    meQuery.isFetching,
    logoutMutation.error,
    logoutMutation.isPending,
  ]);

  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    if (meQuery.isLoading || meQuery.isFetching || logoutMutation.isPending) return;
    if (state.user) return;
    if (typeof window === "undefined") return;
    if (window.location.pathname === redirectPath) return;

    window.location.href = redirectPath
  }, [
    redirectOnUnauthenticated,
    redirectPath,
    logoutMutation.isPending,
    meQuery.isLoading,
    meQuery.isFetching,
    state.user,
  ]);

  return {
    ...state,
    refresh: () => meQuery.refetch(),
    logout,
  };
}
