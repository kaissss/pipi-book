"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Menu,
  X,
  BookOpen,
  User,
  LogOut,
  GraduationCap,
  Briefcase,
  Shield,
  CalendarDays,
  Repeat,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { APP_NAME, STORAGE_KEYS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import type { UserRole } from "@/types";

// What each role looks like in the nav, and where its dashboard/profile live.
const ROLE_META: Record<UserRole, { label: string; dashboard: string; profile: string; icon: LucideIcon }> = {
  ADMIN: { label: "Admin", dashboard: "/admin/dashboard", profile: "/member/profile", icon: Shield },
  COACH: { label: "Coach", dashboard: "/coach/dashboard", profile: "/coach/profile", icon: Briefcase },
  STUDENT: { label: "Member", dashboard: "/member/dashboard", profile: "/member/profile", icon: CalendarDays },
};

// The roles a person may act as. An admin can view every portal; a coach is
// also a member who can book.
function availableRoles(role: UserRole): UserRole[] {
  if (role === "ADMIN") return ["ADMIN", "COACH", "STUDENT"];
  if (role === "COACH") return ["COACH", "STUDENT"];
  return ["STUDENT"];
}

export default function Navbar() {
  const { user, isAuthenticated, logout, isStudent } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  // The role the user is currently acting as. Defaults to their assigned role
  // and is remembered across navigations. Never exceeds their real privileges
  // (it is clamped to availableRoles, all of which their JWT already grants).
  const [activeRole, setActiveRole] = useState<UserRole | null>(null);

  useEffect(() => {
    if (!user) return;
    const allowed = availableRoles(user.role);
    const stored = localStorage.getItem(STORAGE_KEYS.ACTIVE_ROLE) as UserRole | null;
    setActiveRole(stored && allowed.includes(stored) ? stored : user.role);
  }, [user]);

  const effectiveRole: UserRole = activeRole ?? user?.role ?? "STUDENT";
  const roles = user ? availableRoles(user.role) : [];
  const meta = ROLE_META[effectiveRole];

  function switchRole(role: UserRole) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_ROLE, role);
    setActiveRole(role);
    setMobileOpen(false);
    router.push(ROLE_META[role].dashboard);
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
          <BookOpen className="h-6 w-6" />
          {APP_NAME}
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/coaches" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Find Coaches
          </Link>
          {isAuthenticated && (
            <Link href={meta.dashboard} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Dashboard
            </Link>
          )}
        </nav>

        {/* Desktop auth */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.avatar} alt={user.displayName} />
                    <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center gap-2 p-2">
                  <div className="flex flex-col space-y-0.5">
                    <p className="text-sm font-medium">{user.displayName}</p>
                    <p className="text-xs text-muted-foreground">Viewing as {meta.label}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={meta.dashboard} className="flex items-center gap-2">
                    <meta.icon className="h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={meta.profile} className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>

                {/* Real role switch — changes which role the menu/app reflects */}
                {roles.length > 1 && <DropdownMenuSeparator />}
                {roles.filter((role) => role !== effectiveRole).map((role) => (
                  <DropdownMenuItem key={role} onClick={() => switchRole(role)} className="flex items-center gap-2">
                    <Repeat className="h-4 w-4" />
                    Switch to {ROLE_META[role].label}
                  </DropdownMenuItem>
                ))}

                {isStudent && (
                  <DropdownMenuItem asChild>
                    <Link href="/member/become-coach" className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      Become a Coach
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="flex items-center gap-2 text-destructive focus:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild className="bg-line hover:bg-line-dark text-white">
              <Link href="/auth/login">Login with LINE</Link>
            </Button>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden p-2 rounded-md"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t px-4 py-4 flex flex-col gap-4 bg-background">
          <Link
            href="/coaches"
            className="text-sm font-medium"
            onClick={() => setMobileOpen(false)}
          >
            Find Coaches
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                href={meta.dashboard}
                className="text-sm font-medium"
                onClick={() => setMobileOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                href={meta.profile}
                className="text-sm font-medium"
                onClick={() => setMobileOpen(false)}
              >
                Profile
              </Link>
              {roles.filter((role) => role !== effectiveRole).map((role) => (
                <button
                  key={role}
                  onClick={() => switchRole(role)}
                  className="text-sm font-medium text-left"
                >
                  Switch to {ROLE_META[role].label}
                </button>
              ))}
              {isStudent && (
                <Link
                  href="/member/become-coach"
                  className="text-sm font-medium"
                  onClick={() => setMobileOpen(false)}
                >
                  Become a Coach
                </Link>
              )}
              <button
                onClick={() => { logout(); setMobileOpen(false); }}
                className="text-sm font-medium text-destructive text-left"
              >
                Sign out
              </button>
            </>
          ) : (
            <Button asChild className="bg-line hover:bg-line-dark text-white w-full">
              <Link href="/auth/login" onClick={() => setMobileOpen(false)}>
                Login with LINE
              </Link>
            </Button>
          )}
        </div>
      )}
    </header>
  );
}
