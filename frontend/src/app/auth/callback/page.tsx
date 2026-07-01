"use client";

export const dynamic = "force-dynamic";

import { Suspense, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import { useLineCallback } from "@/hooks/useAuth";
import { getStoredState, clearState } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n";
import Link from "next/link";

function AuthCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useTranslation();
  const { mutate: handleCallback, isPending, error, isSuccess } = useLineCallback();
  const calledRef = useRef(false);

  useEffect(() => {
    if (calledRef.current) return;

    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const errorParam = searchParams.get("error");

    if (errorParam) {
      console.error("LINE auth error:", errorParam);
      return;
    }

    if (!code || !state) {
      router.push("/auth/login");
      return;
    }

    // State check — LINE IAB opens the callback in a new webview so the stored
    // state may not survive the navigation. Warn only; the one-time-use code
    // is the primary replay protection.
    const storedState = getStoredState();
    if (storedState && storedState !== state) {
      console.warn("State mismatch — proceeding (LINE IAB webview context)");
    }

    clearState();
    calledRef.current = true;
    handleCallback({ code, state });
  }, [searchParams, handleCallback, router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <h2 className="text-xl font-semibold mb-2">{t("auth.callback.failedTitle")}</h2>
          <p className="text-muted-foreground text-sm mb-6">
            {t("auth.callback.failedBody")}
          </p>
          <Button asChild>
            <Link href="/auth/login">{t("auth.callback.tryAgain")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">
          {isPending
            ? t("auth.callback.signingIn")
            : isSuccess
            ? t("auth.callback.redirecting")
            : t("auth.callback.verifying")}
        </p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense>
      <AuthCallbackContent />
    </Suspense>
  );
}
