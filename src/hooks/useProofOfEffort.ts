import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import ProofOfEffort from "@/lib/contracts/ProofOfEffort";
import { useWallet } from "@/lib/genlayer/WalletProvider";
import { toast } from "sonner";
import type { Engagement, EffortScore, LeaderboardEntry } from "@/lib/contracts/types";

export function useContract(): ProofOfEffort {
  const { address } = useWallet();
  return useMemo(() => new ProofOfEffort(address), [address]);
}

export function useEngagement(engagementId: string | undefined) {
  const contract = useContract();
  return useQuery<Engagement | null>({
    queryKey: ["engagement", engagementId],
    queryFn: () => contract.getEngagement(engagementId!),
    enabled: !!engagementId,
    refetchInterval: 10000,
  });
}

export function useWorkerEngagements(walletAddress: string | undefined) {
  const contract = useContract();
  return useQuery<Engagement[]>({
    queryKey: ["worker-engagements", walletAddress],
    queryFn: () => contract.getWorkerEngagements(walletAddress!),
    enabled: !!walletAddress,
  });
}

export function useEffortScore(engagementId: string | undefined) {
  const contract = useContract();
  return useQuery<EffortScore | null>({
    queryKey: ["effort-score", engagementId],
    queryFn: () => contract.getEffortScore(engagementId!),
    enabled: !!engagementId,
    refetchInterval: 15000,
  });
}

export function useAverageScore(walletAddress: string | undefined) {
  const contract = useContract();
  return useQuery<number>({
    queryKey: ["average-score", walletAddress],
    queryFn: () => contract.getAverageEffortScore(walletAddress!),
    enabled: !!walletAddress,
  });
}

export function useEngagementCount(walletAddress: string | undefined) {
  const contract = useContract();
  return useQuery<number>({
    queryKey: ["engagement-count", walletAddress],
    queryFn: () => contract.getEngagementCount(walletAddress!),
    enabled: !!walletAddress,
  });
}

export function useLeaderboard(category: string = "all", limit: number = 20) {
  const contract = useContract();
  return useQuery<LeaderboardEntry[]>({
    queryKey: ["leaderboard", category, limit],
    queryFn: () => contract.getLeaderboard(category, limit),
    refetchInterval: 30000,
  });
}

export function useDisputeWindow(engagementId: string | undefined) {
  const contract = useContract();
  return useQuery<boolean>({
    queryKey: ["dispute-window", engagementId],
    queryFn: () => contract.isWithinDisputeWindow(engagementId!),
    enabled: !!engagementId,
    refetchInterval: 10000,
  });
}

export function useCreateEngagement() {
  const contract = useContract();
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);

  const mutation = useMutation({
    mutationFn: async (params: { roleDescription: string; standardsReference: string; workerAddress: string; compensation: number }) => {
      setIsPending(true);
      return contract.createEngagement(params.roleDescription, params.standardsReference, params.workerAddress, params.compensation);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["worker-engagements"] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
      setIsPending(false);
      toast.success("Engagement created successfully!");
    },
    onError: (err: any) => {
      setIsPending(false);
      toast.error(err?.message || "Failed to create engagement");
    },
  });

  return { ...mutation, isPending, createEngagement: mutation.mutateAsync };
}

export function useAcceptEngagement() {
  const contract = useContract();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (engagementId: string) => contract.acceptEngagement(engagementId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["engagement"] });
      toast.success("Engagement accepted!");
    },
    onError: (err: any) => toast.error(err?.message || "Failed to accept engagement"),
  });
}

export function useLogProgress() {
  const contract = useContract();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { engagementId: string; progressNote: string }) =>
      contract.logProgress(params.engagementId, params.progressNote),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["engagement"] });
      toast.success("Progress logged!");
    },
    onError: (err: any) => toast.error(err?.message || "Failed to log progress"),
  });
}

export function useSubmitWork() {
  const contract = useContract();
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);
  const mutation = useMutation({
    mutationFn: async (params: { engagementId: string; processDocs: string; decisions: string; deliverablesHash: string; selfAssessment: string; externalFactors: string }) => {
      setIsPending(true);
      return contract.submitWork(params.engagementId, params.processDocs, params.decisions, params.deliverablesHash, params.selfAssessment, params.externalFactors);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["engagement"] });
      setIsPending(false);
      toast.success("Work submitted successfully!");
    },
    onError: (err: any) => { setIsPending(false); toast.error(err?.message || "Failed to submit work"); },
  });
  return { ...mutation, isPending, submitWork: mutation.mutateAsync };
}

export function useSubmitOutcome() {
  const contract = useContract();
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);
  const mutation = useMutation({
    mutationFn: async (params: { engagementId: string; outcomeResult: string; outcomeNotes: string }) => {
      setIsPending(true);
      return contract.submitOutcomeAssessment(params.engagementId, params.outcomeResult, params.outcomeNotes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["engagement"] });
      queryClient.invalidateQueries({ queryKey: ["effort-score"] });
      setIsPending(false);
      toast.success("Outcome assessment submitted — AI evaluation in progress!");
    },
    onError: (err: any) => { setIsPending(false); toast.error(err?.message || "Failed to submit outcome"); },
  });
  return { ...mutation, isPending, submitOutcome: mutation.mutateAsync };
}

export function useDisputeScore() {
  const contract = useContract();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { engagementId: string; justification: string }) =>
      contract.disputeScore(params.engagementId, params.justification),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["engagement"] });
      queryClient.invalidateQueries({ queryKey: ["dispute-window"] });
      toast.success("Dispute filed!");
    },
    onError: (err: any) => toast.error(err?.message || "Failed to file dispute"),
  });
}
