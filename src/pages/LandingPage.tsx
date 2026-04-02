import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/lib/genlayer/WalletProvider";
import { useLeaderboard } from "@/hooks/useProofOfEffort";
import { ScoreGauge } from "@/components/proof-of-effort/ScoreGauge";
import { ArrowRight, Shield, Brain, FileCheck, Wallet } from "lucide-react";

export default function LandingPage() {
  const { isConnected, connectWallet, address } = useWallet();
  const { data: leaders } = useLeaderboard("all", 5);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.08),transparent_60%)]" />
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border/50 bg-muted/30 text-sm text-muted-foreground mb-8 animate-fade-in-up">
            <span className="w-2 h-2 rounded-full bg-score-high animate-pulse" />
            On-chain professional quality verification
          </div>
          <h1 className="text-5xl md:text-7xl font-bold font-display mb-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            Your Work Speaks.
            <br />
            <span className="gradient-text">Regardless of Outcome.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            Proof of Effort is an AI-verified, outcome-independent professional quality rating system.
            Build an immutable record of your professional excellence on-chain.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            {isConnected ? (
              <>
                <Link to="/engagements/new">
                  <Button size="lg" className="gap-2 glow-primary">
                    Create Engagement <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to={`/profile/${address}`}>
                  <Button variant="outline" size="lg">View My Profile</Button>
                </Link>
              </>
            ) : (
              <Button size="lg" onClick={connectWallet} className="gap-2 glow-primary">
                <Wallet className="h-4 w-4" /> Connect Wallet to Start
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Demo Score */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="glass-card p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <ScoreGauge finalScore={89} size={180} />
            <div className="flex-1 text-center md:text-left">
              <p className="text-sm font-medium text-score-medium mb-2">Outcome: Project Cancelled</p>
              <h2 className="text-3xl font-bold font-display mb-3">
                Effort Score: <span className="score-color-high">89</span>/120
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                "Carlos delivered a 40-page research report, annotated wireframes, and 3 tested prototypes.
                The project was discontinued due to regulatory shifts — not Carlos's fault.
                His professional quality was independently verified regardless of outcome."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold font-display text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { icon: <FileCheck className="h-6 w-6" />, title: "Create Engagement", desc: "Client defines role, professional standards, and compensation terms." },
              { icon: <ArrowRight className="h-6 w-6" />, title: "Submit Work", desc: "Worker documents their process, decisions, and deliverables." },
              { icon: <Brain className="h-6 w-6" />, title: "AI Evaluation", desc: "Intelligent Contract scores process quality, decisions, documentation, and professionalism." },
              { icon: <Shield className="h-6 w-6" />, title: "Score Minted", desc: "Immutable Effort Score stored on-chain as a professional credential." },
            ].map((step, i) => (
              <div key={i} className="glass-card p-6 text-center space-y-3 animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto text-primary">
                  {step.icon}
                </div>
                <h3 className="font-semibold font-display">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leaderboard Preview */}
      {leaders && leaders.length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold font-display">Top Professionals</h2>
              <Link to="/leaderboard">
                <Button variant="outline" size="sm" className="gap-1">
                  View All <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
            <div className="space-y-3">
              {leaders.map((entry, i) => (
                <Link
                  key={entry.wallet}
                  to={`/profile/${entry.wallet}`}
                  className="glass-card p-4 flex items-center justify-between hover:bg-card/90 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-bold text-muted-foreground w-8">#{i + 1}</span>
                    <span className="font-mono text-sm">{entry.wallet.slice(0, 8)}...{entry.wallet.slice(-6)}</span>
                  </div>
                  <span className={`font-bold font-display text-lg ${
                    entry.avg_score >= 80 ? "score-color-high" : entry.avg_score >= 60 ? "score-color-medium" : "score-color-low"
                  }`}>
                    {entry.avg_score}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
