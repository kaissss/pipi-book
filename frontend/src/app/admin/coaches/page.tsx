"use client";

import { useState } from "react";
import { CheckCircle, XCircle, PauseCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAdminCoaches, useApproveCoach, useRejectCoach, useSuspendUser } from "@/hooks/useAdmin";
import { getInitials, formatDate, getCoachStatusColor } from "@/lib/utils";
import { useTranslation } from "@/i18n";
import type { Coach } from "@/types";

export default function AdminCoachesPage() {
  const { t } = useTranslation();
  const [rejectTarget, setRejectTarget] = useState<Coach | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const { data: pendingCoaches, isLoading: loadingPending } = useAdminCoaches({
    status: "PENDING",
    limit: 20,
  });
  const { data: approvedCoaches, isLoading: loadingApproved } = useAdminCoaches({
    status: "APPROVED",
    limit: 20,
  });

  const approveCoach = useApproveCoach();
  const rejectCoach = useRejectCoach();
  const suspendUser = useSuspendUser();

  async function handleReject() {
    if (!rejectTarget) return;
    await rejectCoach.mutateAsync({ id: rejectTarget.id, reason: rejectReason });
    setRejectTarget(null);
    setRejectReason("");
  }

  function CoachTable({
    coaches,
    isLoading,
    showApprove,
  }: {
    coaches: Coach[] | undefined;
    isLoading: boolean;
    showApprove?: boolean;
  }) {
    if (isLoading) {
      return (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
      );
    }
    if (!coaches || coaches.length === 0) {
      return <p className="text-center py-8 text-muted-foreground text-sm">{t("admin.coaches.empty")}</p>;
    }
    return (
      <div className="space-y-3">
        {coaches.map((coach) => (
          <Card key={coach.id}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12 shrink-0">
                  <AvatarImage src={coach.user.avatar} alt={coach.user.displayName} />
                  <AvatarFallback>{getInitials(coach.user.displayName)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-medium text-sm">{coach.user.displayName}</p>
                    <Badge className={getCoachStatusColor(coach.status)}>
                      {t(`common.coachStatus.${coach.status}`)}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1 mb-1">{coach.bio}</p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {coach.specialties.slice(0, 3).map((s) => (
                      <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t("admin.coaches.applied", { date: formatDate(coach.createdAt) })}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  {showApprove && (
                    <Button
                      size="sm"
                      onClick={() => approveCoach.mutate(coach.id)}
                      disabled={approveCoach.isPending}
                    >
                      <CheckCircle className="h-3.5 w-3.5 mr-1" />
                      {t("admin.coaches.approve")}
                    </Button>
                  )}
                  {showApprove && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setRejectTarget(coach)}
                    >
                      <XCircle className="h-3.5 w-3.5 mr-1" />
                      {t("admin.coaches.reject")}
                    </Button>
                  )}
                  {!showApprove && coach.status === "APPROVED" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-orange-600 hover:text-orange-600"
                      onClick={() => suspendUser.mutate(coach.userId)}
                    >
                      <PauseCircle className="h-3.5 w-3.5 mr-1" />
                      {t("admin.coaches.suspend")}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("admin.coaches.title")}</h1>
        <p className="text-muted-foreground mt-1">{t("admin.coaches.subtitle")}</p>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            {pendingCoaches?.total
              ? t("admin.coaches.tabPendingCount", { n: pendingCoaches.total })
              : t("admin.coaches.tabPending")}
          </TabsTrigger>
          <TabsTrigger value="approved">{t("admin.coaches.tabApproved")}</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="mt-4">
          <CoachTable
            coaches={pendingCoaches?.data}
            isLoading={loadingPending}
            showApprove
          />
        </TabsContent>
        <TabsContent value="approved" className="mt-4">
          <CoachTable coaches={approvedCoaches?.data} isLoading={loadingApproved} />
        </TabsContent>
      </Tabs>

      {/* Reject dialog */}
      <Dialog open={!!rejectTarget} onOpenChange={(open) => !open && setRejectTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("admin.coaches.rejectDialogTitle")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              {t("admin.coaches.rejectDialogDescription", { name: rejectTarget?.user.displayName ?? "" })}
            </p>
            <div className="space-y-2">
              <Label>{t("admin.coaches.reasonLabel")}</Label>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder={t("admin.coaches.reasonPlaceholder")}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectTarget(null)}>{t("common.actions.cancel")}</Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectReason || rejectCoach.isPending}
            >
              {t("admin.coaches.rejectApplication")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
