import { useLeaderboard } from "@/hooks/useProofOfEffort";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy } from "lucide-react";

export default function LeaderboardPage() {
  const { data: leaders, isLoading } = useLeaderboard("all", 50);

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Trophy className="h-8 w-8 text-score-medium" />
          <h1 className="text-3xl font-bold font-display">Effort Leaderboard</h1>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
          </div>
        ) : leaders?.length ? (
          <div className="space-y-2">
            {leaders.map((entry, i) => (
              <Link
                key={entry.wallet}
                to={`/profile/${entry.wallet}`}
                className="glass-card p-4 flex items-center justify-between hover:bg-card/90 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className={`text-lg font-bold w-10 text-center ${
                    i === 0 ? "text-score-medium" : i < 3 ? "text-muted-foreground" : "text-muted-foreground/50"
                  }`}>
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                  </span>
                  <span className="font-mono text-sm">
                    {entry.wallet.slice(0, 10)}...{entry.wallet.slice(-6)}
                  </span>
                </div>
                <span className={`font-bold font-display text-xl ${
                  entry.avg_score >= 80 ? "score-color-high" : entry.avg_score >= 60 ? "score-color-medium" : "score-color-low"
                }`}>
                  {entry.avg_score}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="glass-card p-12 text-center text-muted-foreground">
            No scores recorded yet. Be the first!
          </div>
        )}
      </div>
    </div>
  );
}
