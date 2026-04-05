import { useQuery } from "@tanstack/react-query";
import type { Complaint, ComplaintStats, Notice } from "../backend";
import { Status } from "../backend";
import { useActor } from "../hooks/useActor";
import type { News } from "../types/extended";

export type { News };

export function useComplaintStats() {
  const { actor } = useActor();
  return useQuery<ComplaintStats>({
    queryKey: ["complaintStats"],
    queryFn: async () => {
      if (!actor) return { total: 0n, pending: 0n, resolved: 0n, urgent: 0n };
      return actor.getComplaintStats();
    },
    // Enable even without auth - stats are public
    enabled: !!actor,
    staleTime: 30000,
  });
}

export function useNotices() {
  const { actor, isFetching } = useActor();
  return useQuery<Notice[]>({
    queryKey: ["notices"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getNotices();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30000,
  });
}

export function useNews() {
  const { actor, isFetching } = useActor();
  return useQuery<News[]>({
    queryKey: ["news"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        // getNews will be available after backend update
        const actorAny = actor as any;
        if (typeof actorAny.getNews === "function") {
          return (await actorAny.getNews()) as News[];
        }
        return [];
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 30000,
  });
}

export function useComplaintByNumber(complaintNumber: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Complaint | null>({
    queryKey: ["complaint", complaintNumber],
    queryFn: async () => {
      if (!actor || !complaintNumber) return null;
      try {
        return await actor.getComplaintByNumber(complaintNumber);
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!complaintNumber,
    retry: false,
  });
}

export function useAllComplaints() {
  const { actor, isFetching } = useActor();
  return useQuery<Complaint[]>({
    queryKey: ["allComplaints"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllComplaints();
    },
    enabled: !!actor && !isFetching,
    staleTime: 10000,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
    staleTime: 60000,
  });
}

// Re-export Status so consumers can use it
export { Status };
