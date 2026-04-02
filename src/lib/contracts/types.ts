export interface Engagement {
  engagement_id: string;
  client: string;
  worker: string;
  role_description: string;
  standards_reference: string;
  compensation: number;
  status: string;
  progress_logs: ProgressLog[];
  outcome_result: string;
  outcome_notes: string;
}

export interface ProgressLog {
  log_id: string;
  note: string;
  tick: number;
}

export interface EffortScore {
  process: number;
  decision: number;
  docs: number;
  professionalism: number;
  composite: number;
  rationale: string;
}

export interface DisputeStatus {
  dispute_id: string;
  engagement_id: string;
  creator: string;
  justification: string;
  status: string;
  updated_score: EffortScore | Record<string, never>;
}

export interface LeaderboardEntry {
  wallet: string;
  avg_score: number;
}

export interface TransactionReceipt {
  status: string;
  hash: string;
  [key: string]: any;
}
