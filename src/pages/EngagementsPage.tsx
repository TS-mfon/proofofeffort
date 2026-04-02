import { Link } from "react-router-dom";
import { useWallet } from "@/lib/genlayer/WalletProvider";
import { useWorkerEngagements } from "@/hooks/useProofOfEffort";
import { StatusBadge } from "@/components/proof-of-effort/StatusBadge";
import { Button } from "@/components/ui/button";
import { Plus, Wallet } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function EngagementsPage() {
  const { address, isConnected, connectWallet } = useWallet();
  const { data: engagements, isLoading } = useWorkerEngagements(address || undefined);

  if (!isConnected) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4 flex items-center justify-center">
        <div className="glass-card p-12 text-center max-w-md">
          <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-bold font-display mb-2">Connect Your Wallet</h2>
          <p className="text-muted-foreground mb-6">Connect your wallet to view your engagements.</p>
          <Button onClick={connectWallet} className="gap-2">
            <Wallet className="h-4 w-4" /> Connect Wallet
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold font-display">My Engagements</h1>
          <Link to="/engagements/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> New Engagement
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
          </div>
        ) : engagements?.length ? (
          <div className="space-y-3">
            {engagements.map(eng => (
              <Link
                key={eng.engagement_id}
                to={`/engagements/${eng.engagement_id}`}
                className="glass-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-card/90 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-medium truncate">{eng.role_description || "Untitled"}</p>
                    <StatusBadge status={eng.status} />
                  </div>
                  <p className="text-xs text-muted-foreground font-mono">{eng.engagement_id}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Client: {eng.client?.slice(0, 8)}...{eng.client?.slice(-4)} • Compensation: {eng.compensation} GEN
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="glass-card p-12 text-center">
            <p className="text-muted-foreground mb-4">No engagements yet.</p>
            <Link to="/engagements/new">
              <Button className="gap-2"><Plus className="h-4 w-4" /> Create Your First Engagement</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
