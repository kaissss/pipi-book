"use client";

import { useState } from "react";
import { Search, UserX, UserCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminUsers, useSuspendUser, useActivateUser } from "@/hooks/useAdmin";
import { getInitials, formatDate } from "@/lib/utils";
import { useTranslation } from "@/i18n";

export default function AdminUsersPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useAdminUsers({
    search: search || undefined,
    role: role === "all" ? undefined : role,
    page,
    limit: 20,
  });
  const suspendUser = useSuspendUser();
  const activateUser = useActivateUser();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("admin.users.title")}</h1>
        <p className="text-muted-foreground mt-1">{t("admin.users.subtitle")}</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder={t("admin.users.searchPlaceholder")}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <Select value={role} onValueChange={(v) => { setRole(v); setPage(1); }}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("admin.users.allRoles")}</SelectItem>
            <SelectItem value="STUDENT">{t("admin.users.students")}</SelectItem>
            <SelectItem value="COACH">{t("admin.users.coaches")}</SelectItem>
            <SelectItem value="ADMIN">{t("admin.users.admins")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {data ? t("admin.users.count", { n: data.total }) : t("admin.users.fallbackTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          )}
          {data && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("admin.users.colUser")}</TableHead>
                  <TableHead>{t("admin.users.colRole")}</TableHead>
                  <TableHead>{t("admin.users.colJoined")}</TableHead>
                  <TableHead>{t("admin.users.colStatus")}</TableHead>
                  <TableHead>{t("admin.users.colActions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar} alt={user.displayName} />
                          <AvatarFallback className="text-xs">
                            {getInitials(user.displayName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{user.displayName}</p>
                          {user.email && (
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {t(`common.roles.${user.role}`)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {user.createdAt ? formatDate(user.createdAt) : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={user.status === "ACTIVE" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {user.status === "ACTIVE" ? t("admin.users.statusActive") : t("admin.users.statusSuspended")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.role !== "ADMIN" && (
                        user.status === "ACTIVE" ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive h-7"
                            onClick={() => suspendUser.mutate(user.id)}
                          >
                            <UserX className="h-3.5 w-3.5 mr-1" />
                            {t("admin.users.suspend")}
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7"
                            onClick={() => activateUser.mutate(user.id)}
                          >
                            <UserCheck className="h-3.5 w-3.5 mr-1" />
                            {t("admin.users.activate")}
                          </Button>
                        )
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {data && data.totalPages > 1 && (
            <div className="flex justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                {t("admin.users.previous")}
              </Button>
              <span className="text-sm text-muted-foreground self-center">
                {page} / {data.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= data.totalPages}
              >
                {t("admin.users.next")}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
