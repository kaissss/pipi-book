"use client";

import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import CoachCard from "./CoachCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useCoaches } from "@/hooks/useCoach";
import { SPECIALTIES } from "@/lib/constants";

export default function CoachList() {
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState<string>("");
  const [minRating, setMinRating] = useState<string>("");
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useCoaches({
    search: search || undefined,
    specialty: specialty || undefined,
    minRating: minRating ? Number(minRating) : undefined,
    page,
    limit: 12,
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search coaches..."
            className="pl-9"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <Select value={specialty} onValueChange={(v) => { setSpecialty(v === "all" ? "" : v); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Specialty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All specialties</SelectItem>
            {SPECIALTIES.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={minRating} onValueChange={(v) => { setMinRating(v === "any" ? "" : v); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Min rating" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any rating</SelectItem>
            <SelectItem value="4">4+ stars</SelectItem>
            <SelectItem value="4.5">4.5+ stars</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      {data && (
        <p className="text-sm text-muted-foreground">
          {data.total} coach{data.total !== 1 ? "es" : ""} found
        </p>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-lg border overflow-hidden">
              <Skeleton className="h-24 w-full" />
              <div className="p-4 pt-8 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-9 w-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-sm">Failed to load coaches. Please try again.</p>
        </div>
      )}

      {/* Coach grid */}
      {data && data.data.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.data.map((coach) => (
            <CoachCard key={coach.id} coach={coach} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {data && data.data.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <SlidersHorizontal className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No coaches match your filters</p>
          <p className="text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {data.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= data.totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
