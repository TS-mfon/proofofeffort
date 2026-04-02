import { useParams, Link, useNavigate } from "react-router-dom";
import { useEngagement, useEffortScore, useDisputeWindow, useAcceptEngagement, useLogProgress, useSubmitOutcome } from "@/hooks/useProofOfEffort";
import { useWallet } from "@/lib/genlayer/WalletProvider";
import { StatusBadge } from "@/components/proof-of-effort/StatusBadge";
import { ScoreGauge } from "@/components/proof-of-effort/ScoreGauge";
import { SubScores } from "@/components/proof-of-effort/SubScores";
import { Typewriter } from "@/components/proof-of-effort/Typewriter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, FileText, AlertTriangle, Loader2, Send } from "lucide-react";
import { useState } from "react";

export default function EngagementDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { address } = useWallet();
  const { data: engagement, isLoading } = useEngagement(id);
  const { data: score } = useEffortScore(id);
  const { data: canDispute } = useDisputeWindow(id);
  const acceptMutation = useAcceptEngagement();
  const logMutation = useLogProgress();
  const outcomeMutation = useSubmitOutcome();

  const [progressNote, setProgressNote] = useState("");
  const [outcomeResult, setOutcomeResult] = useState("");
  const [outcomeNotes, setOutcomeNotes] = useState("");
  const [showOutcomeForm, setShowOutcomeForm] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!engagement) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4 text-center">
        <p className="text-muted-foreground">Engagement not found.</p>
      </div>
    );
  }

  const isWorker = address?.toLowerCase() === engagement.worker?.toLowerCase();
  const isClient = address?.toLowerCase() === engagement.client?.toLowerCase();

  const handleAccept = async () => {
    if (!id) return;
    await acceptMutation.mutateAsync(id);
  };

  const handleLogProgress = async () => {
    if (!id || !progressNote.trim()) return;
    await logMutation.mutateAsync({ engagementId: id, progressNote });
    setProgressNote("");
  };

  const handleSubmitOutcome = async () => {
    if (!id) return;
    await outcomeMutation.submitOutcome({ engagementId: id, outcomeResult, outcomeNotes });
    setShowOutcomeForm(false);
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        {/* Header */}
        <div className="glass-card p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold font-display">{engagement.role_description || "Engagement"}</h1>
                <StatusBadge status={engagement.status} />
              </div>
              <p className="text-xs font-mono text-muted-foreground mb-3">{id}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Client</p>
                  <p className="font-mono text-xs">{engagement.client?.slice(0, 10)}...{engagement.client?.slice(-6)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Worker</p>
                  <Link to={`/profile/${engagement.worker}`} className="font-mono text-xs text-primary hover:underline">
                    {engagement.worker?.slice(0, 10)}...{engagement.worker?.slice(-6)}
                  </Link>
                </div>
                <div>
                  <p className="text-muted-foreground">Compensation</p>
                  <p>{engagement.compensation} GEN</p>
                </div>
              </div>
            </div>
          </div>
          {engagement.standards_reference && (
            <div className="mt-4 pt-4 border-t border-border/50">
              <p className="text-xs text-muted-foreground mb-1">Professional Standards</p>
              <p className="text-sm">{engagement.standards_reference}</p>
            </div>
          )}
        </div>

        {/* Worker actions */}
        {isWorker && engagement.status === "CREATED" && (
          <div className="glass-card p-6 mb-6 text-center">
            <p className="text-muted-foreground mb-4">You have been invited to this engagement.</p>
            <Button onClick={handleAccept} disabled={acceptMutation.isPending} className="gap-2">
              {acceptMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Accept Engagement
            </Button>
          </div>
        )}

        {isWorker && engagement.status === "ACTIVE" && (
          <div className="space-y-4 mb-6">
            {/* Log Progress */}
            <div className="glass-card p-6">
              <h3 className="font-semibold mb-3">Log Progress</h3>
              <Textarea value={progressNote} onChange={e => setProgressNote(e.target.value)} placeholder="Document your progress..." maxLength={1000} rows={3} />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-muted-foreground">{progressNote.length}/1000</span>
                <Button size="sm" onClick={handleLogProgress} disabled={logMutation.isPending || !progressNote.trim()} className="gap-1">
                  <Send className="h-3 w-3" /> Log
                </Button>
              </div>
            </div>

            <Link to={`/engagements/${id}/submit`}>
              <Button variant="outline" className="w-full gap-2">
                <FileText className="h-4 w-4" /> Submit Final Work
              </Button>
            </Link>
          </div>
        )}

        {/* Progress Logs */}
        {engagement.progress_logs?.length > 0 && (
          <div className="glass-card p-6 mb-6">
            <h3 className="font-semibold mb-4">Progress Logs</h3>
            <div className="space-y-3">
              {engagement.progress_logs.map((log: any, i: number) => (
                <div key={i} className="p-3 rounded-lg bg-muted/30 border border-border/30">
                  <p className="text-sm">{log.note}</p>
                  <p className="text-xs text-muted-foreground mt-1">Tick: {log.tick}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Client: Submit Outcome */}
        {isClient && engagement.status === "WORK_SUBMITTED" && (
          <div className="glass-card p-6 mb-6">
            {!showOutcomeForm ? (
              <div className="text-center">
                <p className="text-muted-foreground mb-4">Work has been submitted. Review and submit your outcome assessment.</p>
                <Button onClick={() => setShowOutcomeForm(true)} className="gap-2">
                  Submit Outcome Assessment
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="font-semibold">Outcome Assessment</h3>
                <div>
                  <label className="text-sm text-muted-foreground">Outcome Result</label>
                  <Textarea value={outcomeResult} onChange={e => setOutcomeResult(e.target.value)} placeholder="e.g. Project completed successfully / Project cancelled..." maxLength={500} rows={2} className="mt-1" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Outcome Notes</label>
                  <Textarea value={outcomeNotes} onChange={e => setOutcomeNotes(e.target.value)} placeholder="Describe what went well/poorly..." maxLength={1000} rows={3} className="mt-1" />
                </div>
                <Button onClick={handleSubmitOutcome} disabled={outcomeMutation.isPending} className="gap-2">
                  {outcomeMutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Evaluating...</> : "Submit & Trigger AI Evaluation"}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Outcome Info */}
        {engagement.outcome_result && (
          <div className="glass-card p-6 mb-6">
            <h3 className="font-semibold mb-3">Outcome</h3>
            <p className="text-sm mb-1"><span className="text-muted-foreground">Result:</span> {engagement.outcome_result}</p>
            {engagement.outcome_notes && <p className="text-sm"><span className="text-muted-foreground">Notes:</span> {engagement.outcome_notes}</p>}
          </div>
        )}

        {/* Score */}
        {score && score.composite !== undefined && (
          <div className="glass-card p-8 mb-6">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <ScoreGauge finalScore={score.composite} size={180} />
              <div className="flex-1 w-full">
                {engagement.outcome_result && (
                  <div className="mb-4 p-3 rounded-lg bg-score-high/10 border border-score-high/20">
                    <p className="text-sm">
                      <span className="text-muted-foreground">Outcome:</span>{" "}
                      <span className="font-medium">{engagement.outcome_result}</span>
                      {" — "}
                      <span className="font-bold score-color-high">Effort Score: {score.composite}/120</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Your professional quality was independently verified regardless of outcome.
                    </p>
                  </div>
                )}
                <SubScores
                  process={score.process || 0}
                  decision={score.decision || 0}
                  docs={score.docs || 0}
                  professionalism={score.professionalism || 0}
                />
                {score.rationale && (
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <p className="text-xs text-muted-foreground mb-2">AI Rationale</p>
                    <Typewriter text={score.rationale} speed={12} />
                  </div>
                )}
              </div>
            </div>

            {/* Dispute */}
            {canDispute && (isWorker || isClient) && (
              <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <AlertTriangle className="h-4 w-4" />
                  Dispute window is open
                </div>
                <Link to={`/engagements/${id}/dispute`}>
                  <Button variant="outline" size="sm">File Dispute</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
