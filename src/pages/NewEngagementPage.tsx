import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "@/lib/genlayer/WalletProvider";
import { useCreateEngagement } from "@/hooks/useProofOfEffort";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function NewEngagementPage() {
  const navigate = useNavigate();
  const { isConnected, address } = useWallet();
  const { createEngagement, isPending } = useCreateEngagement();

  const [form, setForm] = useState({
    roleDescription: "",
    standardsReference: "",
    workerAddress: "",
    compensation: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) return;
    try {
      await createEngagement({
        roleDescription: form.roleDescription,
        standardsReference: form.standardsReference,
        workerAddress: form.workerAddress,
        compensation: parseInt(form.compensation) || 0,
      });
      navigate("/engagements");
    } catch (err) {
      console.error(err);
    }
  };

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <h1 className="text-3xl font-bold font-display mb-2">Create Engagement</h1>
        <p className="text-muted-foreground mb-8">Define the engagement terms and professional standards for evaluation.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="glass-card p-6 space-y-5">
            <div>
              <Label htmlFor="role">Role Description</Label>
              <Textarea id="role" placeholder="e.g. Senior UX Designer - Fintech App Redesign" value={form.roleDescription} onChange={update("roleDescription")} maxLength={500} rows={3} className="mt-1.5" />
              <p className="text-xs text-muted-foreground mt-1">{form.roleDescription.length}/500</p>
            </div>

            <div>
              <Label htmlFor="standards">Professional Standards Reference</Label>
              <Textarea id="standards" placeholder="e.g. User research required, wireframes documented, design rationale written..." value={form.standardsReference} onChange={update("standardsReference")} maxLength={1000} rows={4} className="mt-1.5" />
              <p className="text-xs text-muted-foreground mt-1">{form.standardsReference.length}/1000</p>
            </div>

            <div>
              <Label htmlFor="worker">Worker Wallet Address</Label>
              <Input id="worker" placeholder="0x..." value={form.workerAddress} onChange={update("workerAddress")} className="mt-1.5 font-mono" />
            </div>

            <div>
              <Label htmlFor="compensation">Compensation (GEN)</Label>
              <Input id="compensation" type="number" placeholder="0" value={form.compensation} onChange={update("compensation")} className="mt-1.5" />
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full gap-2" disabled={isPending || !isConnected || !form.roleDescription || !form.workerAddress}>
            {isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating Engagement...</> : "Create Engagement"}
          </Button>
        </form>
      </div>
    </div>
  );
}
