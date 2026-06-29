"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buildLineAuthUrl } from "@/lib/auth";
import { useAuth, useDevLogin } from "@/hooks/useAuth";
import { APP_NAME } from "@/lib/constants";

const DEV_LOGIN_ENABLED = process.env.NEXT_PUBLIC_DEV_LOGIN === "true";

function LoginContent() {
  const { isAuthenticated, isCoach, isAdmin } = useAuth();
  const devLogin = useDevLogin();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  useEffect(() => {
    if (isAuthenticated) {
      if (redirect) {
        router.push(redirect);
      } else if (isAdmin) {
        router.push("/admin/dashboard");
      } else if (isCoach) {
        router.push("/coach/dashboard");
      } else {
        router.push("/member/dashboard");
      }
    }
  }, [isAuthenticated, isAdmin, isCoach, redirect, router]);

  function handleLineLogin() {
    const url = buildLineAuthUrl();
    window.location.href = url;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-background p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-2xl font-bold text-primary">
            <BookOpen className="h-7 w-7" />
            {APP_NAME}
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Professional coaching, simplified
          </p>
        </div>

        <Card>
          <CardHeader className="text-center pb-4">
            <CardTitle>Sign in</CardTitle>
            <CardDescription>
              Use your LINE account to continue. One click — no password needed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleLineLogin}
              className="w-full h-12 text-base font-semibold bg-line hover:bg-line-dark text-white"
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.105.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
              </svg>
              Continue with LINE
            </Button>

            {DEV_LOGIN_ENABLED && (
              <div className="space-y-2 rounded-md border border-dashed p-3">
                <p className="text-xs font-medium text-muted-foreground text-center">
                  Dev login (local only)
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {(["STUDENT", "COACH", "ADMIN"] as const).map((role) => (
                    <Button
                      key={role}
                      variant="outline"
                      size="sm"
                      disabled={devLogin.isPending}
                      onClick={() => devLogin.mutate(role)}
                    >
                      {role.charAt(0) + role.slice(1).toLowerCase()}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <p className="text-xs text-muted-foreground text-center">
              By continuing, you agree to our{" "}
              <a href="/terms" className="underline underline-offset-2 hover:text-foreground">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/privacy" className="underline underline-offset-2 hover:text-foreground">
                Privacy Policy
              </a>
              .
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
