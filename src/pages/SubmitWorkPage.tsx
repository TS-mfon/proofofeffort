import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSubmitWork } from "@/hooks/useProofOfEffort";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function SubmitWorkPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { submitWork, isPending } = useSubmitWork();

  const [form, setForm] = useState({
    processDocs: "",
    decisions: "",
    deliverablesHash: "",
    selfAssessment: "",
    externalFactors: "",
  });

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await submitWork({
        engagementId: id,
        processDocs: form.processDocs,
        decisions: form.decisions,
        deliverablesHash: form.deliverablesHash,
        selfAssessment: form.selfAssessment,
        externalFactors: form.externalFactors,
      });
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

        <h1 className="text-3xl font-bold font-display mb-2">Submit Work</h1>
        <p className="text-muted-foreground mb-8">Document your professional process for AI evaluation.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="glass-card p-6 space-y-5">
            <div>
              <Label>Process Documentation</Label>
              <Textarea value={form.processDocs} onChange={update("processDocs")} placeholder="Describe your methodology, workflow, and approach..." maxLength={3000} rows={6} className="mt-1.5" />
              <p className="text-xs text-muted-foreground mt-1">{form.processDocs.length}/3000</p>
            </div>

            <div>
              <Label>Decisions & Rationale</Label>
              <Textarea value={form.decisions} onChange={update("decisions")} placeholder="Key decisions made and why..." maxLength={2000} rows={4} className="mt-1.5" />
              <p className="text-xs text-muted-foreground mt-1">{form.decisions.length}/2000</p>
            </div>

            <div>
              <Label>Deliverables Hash/Link</Label>
              <Input value={form.deliverablesHash} onChange={update("deliverablesHash")} placeholder="IPFS hash, URL, or reference to deliverables..." maxLength={500} className="mt-1.5 font-mono" />
            </div>

            <div>
              <Label>Self Assessment</Label>
              <Textarea value={form.selfAssessment} onChange={update("selfAssessment")} placeholder="Your honest assessment of the work quality..." maxLength={1000} rows={3} className="mt-1.5" />
              <p className="text-xs text-muted-foreground mt-1">{form.selfAssessment.length}/1000</p>
            </div>

            <div>
              <Label>External Factors</Label>
              <Textarea value={form.externalFactors} onChange={update("externalFactors")} placeholder="Any external factors that affected the outcome (optional)..." maxLength={500} rows={2} className="mt-1.5" />
              <p className="text-xs text-muted-foreground mt-1">{form.externalFactors.length}/500</p>
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full gap-2" disabled={isPending || !form.processDocs}>
            {isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</> : "Submit Work for Evaluation"}
          </Button>
        </form>
      </div>
    </div>
  );
}
