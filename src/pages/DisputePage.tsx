import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDisputeScore } from "@/hooks/useProofOfEffort";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, AlertTriangle } from "lucide-react";

export default function DisputePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const disputeMutation = useDisputeScore();
  const [justification, setJustification] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !justification.trim()) return;
    try {
      await disputeMutation.mutateAsync({ engagementId: id, justification });
      navigate(`/engagements/${id}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="flex items-center gap-3 mb-2">
          <AlertTriangle className="h-6 w-6 text-score-medium" />
          <h1 className="text-3xl font-bold font-display">File Dispute</h1>
        </div>
        <p className="text-muted-foreground mb-8">
          Submit your justification for re-evaluation. The AI will review the score with your additional context.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="glass-card p-6">
            <Label>Dispute Justification</Label>
            <Textarea
              value={justification}
              onChange={e => setJustification(e.target.value)}
              placeholder="Explain why you believe the score should be reconsidered. Provide specific evidence or context..."
              maxLength={2000}
              rows={8}
              className="mt-1.5"
            />
            <p className="text-xs text-muted-foreground mt-1">{justification.length}/2000</p>
          </div>

          <Button type="submit" size="lg" className="w-full gap-2" disabled={disputeMutation.isPending || !justification.trim()}>
            {disputeMutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Filing Dispute...</> : "Submit Dispute"}
          </Button>
        </form>
      </div>
    </div>
  );
}
