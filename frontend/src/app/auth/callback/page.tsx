"use client";

import { Suspense, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import { useLineCallback } from "@/hooks/useAuth";
import { getStoredState, clearState } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function AuthCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
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

    // Verify state to prevent CSRF
    const storedState = getStoredState();
    if (storedState && storedState !== state) {
      console.error("State mismatch — possible CSRF attack");
      router.push("/auth/login");
      return;
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
          <h2 className="text-xl font-semibold mb-2">Login Failed</h2>
          <p className="text-muted-foreground text-sm mb-6">
            We could not complete your LINE login. Please try again.
          </p>
          <Button asChild>
            <Link href="/auth/login">Try Again</Link>
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
          {isPending ? "Signing you in..." : isSuccess ? "Redirecting..." : "Verifying..."}
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
