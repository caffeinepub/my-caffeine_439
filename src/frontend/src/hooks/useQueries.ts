import { useQuery } from "@tanstack/react-query";
import type { Complaint, ComplaintStats, Notice } from "../backend";
import { Status } from "../backend";
import { useActor } from "../hooks/useActor";
import type { News } from "../types/extended";

export type { News };

const ADMIN_SESSION_KEY = "bgws_admin_session";
const ADMIN_PASSWORD = "@dminBGWS2001";

export function isPasswordAdmin(): boolean {
  return sessionStorage.getItem(ADMIN_SESSION_KEY) === "true";
}

export function useComplaintStats() {
  const { actor } = useActor();
  return useQuery<ComplaintStats>({
    queryKey: ["complaintStats"],
    queryFn: async () => {
      if (!actor) return { total: 0n, pending: 0n, resolved: 0n, urgent: 0n };
      return actor.getComplaintStats();
    },
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
        return (await actor.getNews()) as News[];
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
        const result = await actor.getComplaintByNumber(complaintNumber);
        return result ?? null;
      } catch (err) {
        const errMsg = String(err);
        if (
          errMsg.includes("not found") ||
          errMsg.includes("Complaint not found")
        ) {
          return null;
        }
        // Re-throw other errors so React Query can retry
        throw err;
      }
    },
    enabled: !!actor && !!complaintNumber && !isFetching,
    retry: 3,
    retryDelay: 1000,
  });
}

export function useAllComplaints() {
  const { actor, isFetching } = useActor();
  const pwAdmin = isPasswordAdmin();
  return useQuery<Complaint[]>({
    queryKey: ["allComplaints", pwAdmin],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      // Password admin: use password-based function (works with anonymous actor)
      if (pwAdmin) {
        return await actor.getAllComplaintsWithPassword(ADMIN_PASSWORD);
      }
      // II admin: use authenticated getAllComplaints
      return await actor.getAllComplaints();
    },
    // For password admin: actor just needs to be ready (no auth needed)
    // For II admin: also wait for identity/auth to complete
    enabled: !!actor && !isFetching,
    staleTime: 10000,
    retry: 3,
    retryDelay: 1500,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  const pwAdmin = isPasswordAdmin();
  return useQuery<boolean>({
    queryKey: ["isAdmin", pwAdmin],
    queryFn: async () => {
      if (pwAdmin) return true;
      if (!actor) return false;
      try {
        return await actor.isCallerAdmin();
      } catch {
        return false;
      }
    },
    enabled: pwAdmin ? true : !isFetching,
    staleTime: 60000,
  });
}

// Re-export Status so consumers can use it
export { Status };
