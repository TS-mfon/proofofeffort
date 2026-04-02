import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import type { Engagement, EffortScore, LeaderboardEntry, DisputeStatus, TransactionReceipt } from "./types";
import { CONTRACT_ADDRESS } from "../genlayer/client";

class ProofOfEffort {
  private contractAddress: `0x${string}`;
  private client: ReturnType<typeof createClient>;

  constructor(address?: string | null) {
    this.contractAddress = CONTRACT_ADDRESS as `0x${string}`;
    const config: any = { chain: studionet };
    if (address) config.account = address as `0x${string}`;
    this.client = createClient(config);
  }

  updateAccount(address: string): void {
    this.client = createClient({ chain: studionet, account: address as `0x${string}` });
  }

  // === VIEW METHODS ===

  async getEngagement(engagementId: string): Promise<Engagement | null> {
    try {
      const result: any = await this.client.readContract({
        address: this.contractAddress,
        functionName: "get_engagement",
        args: [engagementId],
      });
      if (!result || (result instanceof Map && result.size === 0)) return null;
      return this._parseMapToObj(result) as Engagement;
    } catch (error) {
      console.error("Error fetching engagement:", error);
      return null;
    }
  }

  async getWorkerEngagements(walletAddress: string): Promise<Engagement[]> {
    try {
      const result: any = await this.client.readContract({
        address: this.contractAddress,
        functionName: "get_worker_engagements",
        args: [walletAddress],
      });
      if (!result) return [];
      if (Array.isArray(result)) return result.map(r => this._parseMapToObj(r) as Engagement);
      return [];
    } catch (error) {
      console.error("Error fetching worker engagements:", error);
      return [];
    }
  }

  async getEffortScore(engagementId: string): Promise<EffortScore | null> {
    try {
      const result: any = await this.client.readContract({
        address: this.contractAddress,
        functionName: "get_effort_score",
        args: [engagementId],
      });
      if (!result || (result instanceof Map && result.size === 0)) return null;
      return this._parseMapToObj(result) as EffortScore;
    } catch (error) {
      console.error("Error fetching effort score:", error);
      return null;
    }
  }

  async getAverageEffortScore(walletAddress: string): Promise<number> {
    try {
      const result = await this.client.readContract({
        address: this.contractAddress,
        functionName: "get_average_effort_score",
        args: [walletAddress],
      });
      return Number(result) || 0;
    } catch {
      return 0;
    }
  }

  async getEngagementCount(walletAddress: string): Promise<number> {
    try {
      const result = await this.client.readContract({
        address: this.contractAddress,
        functionName: "get_engagement_count",
        args: [walletAddress],
      });
      return Number(result) || 0;
    } catch {
      return 0;
    }
  }

  async getLeaderboard(category: string, limit: number): Promise<LeaderboardEntry[]> {
    try {
      const result: any = await this.client.readContract({
        address: this.contractAddress,
        functionName: "get_leaderboard",
        args: [category, limit],
      });
      if (!result) return [];
      if (Array.isArray(result)) return result.map(r => this._parseMapToObj(r) as LeaderboardEntry);
      return [];
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      return [];
    }
  }

  async getDisputeStatus(disputeId: string): Promise<DisputeStatus | null> {
    try {
      const result: any = await this.client.readContract({
        address: this.contractAddress,
        functionName: "get_dispute_status",
        args: [disputeId],
      });
      if (!result || (result instanceof Map && result.size === 0)) return null;
      return this._parseMapToObj(result) as DisputeStatus;
    } catch {
      return null;
    }
  }

  async isWithinDisputeWindow(engagementId: string): Promise<boolean> {
    try {
      const result = await this.client.readContract({
        address: this.contractAddress,
        functionName: "is_within_dispute_window",
        args: [engagementId],
      });
      return Boolean(result);
    } catch {
      return false;
    }
  }

  // === WRITE METHODS ===

  async createEngagement(roleDescription: string, standardsReference: string, workerAddress: string, compensation: number): Promise<TransactionReceipt> {
    const txHash = await this.client.writeContract({
      address: this.contractAddress,
      functionName: "create_engagement",
      args: [roleDescription, standardsReference, workerAddress, compensation],
      value: BigInt(0),
    });
    return await this.client.waitForTransactionReceipt({ hash: txHash, status: "ACCEPTED" as any, retries: 30, interval: 5000 }) as TransactionReceipt;
  }

  async acceptEngagement(engagementId: string): Promise<TransactionReceipt> {
    const txHash = await this.client.writeContract({
      address: this.contractAddress,
      functionName: "accept_engagement",
      args: [engagementId],
      value: BigInt(0),
    });
    return await this.client.waitForTransactionReceipt({ hash: txHash, status: "ACCEPTED" as any, retries: 30, interval: 5000 }) as TransactionReceipt;
  }

  async logProgress(engagementId: string, progressNote: string): Promise<TransactionReceipt> {
    const txHash = await this.client.writeContract({
      address: this.contractAddress,
      functionName: "log_progress",
      args: [engagementId, progressNote],
      value: BigInt(0),
    });
    return await this.client.waitForTransactionReceipt({ hash: txHash, status: "ACCEPTED" as any, retries: 30, interval: 5000 }) as TransactionReceipt;
  }

  async submitWork(engagementId: string, processDocs: string, decisions: string, deliverablesHash: string, selfAssessment: string, externalFactors: string): Promise<TransactionReceipt> {
    const txHash = await this.client.writeContract({
      address: this.contractAddress,
      functionName: "submit_work",
      args: [engagementId, processDocs, decisions, deliverablesHash, selfAssessment, externalFactors],
      value: BigInt(0),
    });
    return await this.client.waitForTransactionReceipt({ hash: txHash, status: "ACCEPTED" as any, retries: 30, interval: 5000 }) as TransactionReceipt;
  }

  async submitOutcomeAssessment(engagementId: string, outcomeResult: string, outcomeNotes: string): Promise<TransactionReceipt> {
    const txHash = await this.client.writeContract({
      address: this.contractAddress,
      functionName: "submit_outcome_assessment",
      args: [engagementId, outcomeResult, outcomeNotes],
      value: BigInt(0),
    });
    return await this.client.waitForTransactionReceipt({ hash: txHash, status: "ACCEPTED" as any, retries: 60, interval: 5000 }) as TransactionReceipt;
  }

  async disputeScore(engagementId: string, justification: string): Promise<TransactionReceipt> {
    const txHash = await this.client.writeContract({
      address: this.contractAddress,
      functionName: "dispute_score",
      args: [engagementId, justification],
      value: BigInt(0),
    });
    return await this.client.waitForTransactionReceipt({ hash: txHash, status: "ACCEPTED" as any, retries: 30, interval: 5000 }) as TransactionReceipt;
  }

  async resolveDispute(disputeId: string): Promise<TransactionReceipt> {
    const txHash = await this.client.writeContract({
      address: this.contractAddress,
      functionName: "resolve_dispute",
      args: [disputeId],
      value: BigInt(0),
    });
    return await this.client.waitForTransactionReceipt({ hash: txHash, status: "ACCEPTED" as any, retries: 60, interval: 5000 }) as TransactionReceipt;
  }

  // === HELPERS ===

  private _parseMapToObj(data: any): Record<string, any> {
    if (data instanceof Map) {
      const obj: Record<string, any> = {};
      data.forEach((value: any, key: any) => {
        obj[key] = this._parseMapToObj(value);
      });
      return obj;
    }
    if (Array.isArray(data)) {
      return data.map(item => this._parseMapToObj(item));
    }
    if (typeof data === 'bigint') return Number(data);
    return data;
  }
}

export default ProofOfEffort;
