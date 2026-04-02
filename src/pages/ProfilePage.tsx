import { useParams, Link } from "react-router-dom";
import { useWorkerEngagements, useAverageScore, useEngagementCount } from "@/hooks/useProofOfEffort";
import { ScoreGauge } from "@/components/proof-of-effort/ScoreGauge";
import { StatusBadge } from "@/components/proof-of-effort/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilePage() {
  const { wallet } = useParams<{ wallet: string }>();
  const { data: engagements, isLoading } = useWorkerEngagements(wallet);
  const { data: avgScore } = useAverageScore(wallet);
  const { data: count } = useEngagementCount(wallet);

  if (!wallet) return <div className="pt-24 text-center text-muted-foreground">No wallet address provided</div>;

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="glass-card p-8 mb-8 flex flex-col md:flex-row items-center gap-8">
          <ScoreGauge finalScore={avgScore || 0} size={160} label="Average Effort Score" />
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold font-display mb-2">Professional Profile</h1>
            <p className="font-mono text-sm text-muted-foreground mb-4 break-all">{wallet}</p>
            <div className="flex gap-6 justify-center md:justify-start">
              <div>
                <span className="text-2xl font-bold font-display">{count ?? 0}</span>
                <p className="text-xs text-muted-foreground">Engagements</p>
              </div>
              <div>
                <span className="text-2xl font-bold font-display score-color-high">{avgScore ?? 0}</span>
                <p className="text-xs text-muted-foreground">Avg Score</p>
              </div>
            </div>
          </div>
        </div>

        {/* Engagements List */}
        <h2 className="text-xl font-bold font-display mb-4">Engagement History</h2>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
          </div>
        ) : engagements?.length ? (
          <div className="space-y-3">
            {engagements.map(eng => (
              <Link
                key={eng.engagement_id}
                to={`/engagements/${eng.engagement_id}`}
                className="glass-card p-4 flex items-center justify-between hover:bg-card/90 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{eng.role_description || "Untitled Engagement"}</p>
                  <p className="text-xs text-muted-foreground font-mono mt-1">{eng.engagement_id}</p>
                </div>
                <StatusBadge status={eng.status} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="glass-card p-8 text-center text-muted-foreground">
            No engagements found for this wallet.
          </div>
        )}
      </div>
    </div>
  );
}
