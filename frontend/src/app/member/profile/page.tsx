"use client";

import { useState, useEffect } from "react";
import { User, Mail, Phone, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { getInitials } from "@/lib/utils";

export default function MemberProfilePage() {
  const { user, updateProfile, isUpdatingProfile, updateProfileError } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName);
      setEmail(user.email ?? "");
      setPhone(user.phone ?? "");
    }
  }, [user]);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    updateProfile({ displayName, email, phone });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your account information.</p>
      </div>

      {/* Avatar */}
      <Card>
        <CardContent className="pt-6 flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user?.avatar} alt={user?.displayName} />
            <AvatarFallback className="text-xl">
              {user ? getInitials(user.displayName) : "?"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{user?.displayName}</p>
            <p className="text-sm text-muted-foreground capitalize">
              {user?.role?.toLowerCase()} account
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Profile photo synced from LINE
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Edit form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Personal Information</CardTitle>
          <CardDescription>Update your display name and contact details.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Display Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  className="pl-9"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  className="pl-9"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  className="pl-9"
                  placeholder="+886 900 000 000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            {updateProfileError && (
              <p className="text-sm text-destructive">Failed to update profile.</p>
            )}

            <Button type="submit" disabled={isUpdatingProfile} className="w-full sm:w-auto">
              <Save className="h-4 w-4 mr-2" />
              {isUpdatingProfile ? "Saving..." : saved ? "Saved!" : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
