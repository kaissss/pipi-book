"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X, BookOpen, User, LogOut, LayoutDashboard, GraduationCap } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { APP_NAME } from "@/lib/constants";
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

export default function Navbar() {
  const { user, isAuthenticated, logout, isCoach, isAdmin, isStudent } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  function getDashboardHref() {
    if (isAdmin) return "/admin/dashboard";
    if (isCoach) return "/coach/dashboard";
    return "/member/dashboard";
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
            <Link href={getDashboardHref()} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
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
                    <p className="text-xs text-muted-foreground capitalize">{user.role.toLowerCase()}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={getDashboardHref()} className="flex items-center gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href={isCoach ? "/coach/profile" : "/member/profile"}
                    className="flex items-center gap-2"
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
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
                href={getDashboardHref()}
                className="text-sm font-medium"
                onClick={() => setMobileOpen(false)}
              >
                Dashboard
              </Link>
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
