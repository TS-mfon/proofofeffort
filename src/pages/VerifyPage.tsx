import { useParams } from "react-router-dom";
import { useWorkerEngagements, useAverageScore, useEngagementCount } from "@/hooks/useProofOfEffort";
import { ScoreGauge } from "@/components/proof-of-effort/ScoreGauge";
import { Shield, ExternalLink } from "lucide-react";

export default function VerifyPage() {
  const { wallet } = useParams<{ wallet: string }>();
  const { data: engagements } = useWorkerEngagements(wallet);
  const { data: avgScore } = useAverageScore(wallet);
  const { data: count } = useEngagementCount(wallet);

  if (!wallet) return <div className="pt-24 text-center text-muted-foreground">No wallet address</div>;

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-score-high/30 bg-score-high/10 text-sm text-score-high mb-6">
          <Shield className="h-4 w-4" />
          Verified On-Chain Credential
        </div>

        <div className="glass-card p-8 mb-6">
          <ScoreGauge finalScore={avgScore || 0} size={200} label="Verified Average Effort Score" />
          <p className="font-mono text-sm text-muted-foreground mt-4 break-all">{wallet}</p>
          <div className="flex justify-center gap-8 mt-6">
            <div>
              <span className="text-2xl font-bold font-display">{count ?? 0}</span>
              <p className="text-xs text-muted-foreground">Total Engagements</p>
            </div>
            <div>
              <span className="text-2xl font-bold font-display score-color-high">{avgScore ?? 0}</span>
              <p className="text-xs text-muted-foreground">Average Score</p>
            </div>
          </div>
        </div>

        {engagements && engagements.length > 0 && (
          <div className="glass-card p-6 text-left">
            <h3 className="font-semibold font-display mb-4">Engagement History</h3>
            <div className="space-y-3">
              {engagements.map(eng => (
                <div key={eng.engagement_id} className="p-3 rounded-lg bg-muted/30 border border-border/30 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{eng.role_description || "Engagement"}</p>
                    <p className="text-xs text-muted-foreground">{eng.status}</p>
                  </div>
                  <a href={`/engagements/${eng.engagement_id}`} className="text-primary hover:underline">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground mt-8">
          This score is immutably stored on the GenLayer blockchain. Share this URL to prove your professional quality.
        </p>
      </div>
    </div>
  );
}
