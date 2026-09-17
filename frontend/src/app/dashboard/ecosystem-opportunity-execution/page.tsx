"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { apiGet, apiPost } from '@/lib/api';
import { Network, BrainCircuit, Handshake, Target } from "lucide-react";

export default function EcosystemPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [eco, setEco] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [businessId, setBusinessId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated" && session?.user?.id) {
      apiGet<any>('/api/context/current').then(ctx => {
        if (ctx.success && ctx.data.business) setBusinessId(ctx.data.business.id);
      });
    }
  }, [status, router, session]);

  async function runAudit() {
    if (!businessId) return;
    setIsProcessing(true);
    try {
      const res = await apiPost<any>('/api/ecosystem-opportunity-execution/analyze', { businessId });
      if (res.success) setEco(res.data);
    } finally { setIsProcessing(false); }
  }

  if (status === "loading") return <div className="p-8 text-slate-400">Loading Ecosystem...</div>;

  return (
    <div className="min-h-screen bg-slate-950 pb-12">
      <nav className="border-b border-slate-800 bg-slate-900/50 px-6 py-4 flex justify-between">
        <Link href="/dashboard" className="text-xl font-bold tracking-tight text-fuchsia-400">Avenik Ecosystem</Link>
        <Link href="/dashboard" className="text-sm text-slate-400">Back</Link>
      </nav>
      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-3 items-center">
            <Network className="h-8 w-8 text-fuchsia-400" />
            <h1 className="text-3xl font-bold text-white">Opportunity Execution</h1>
          </div>
          <Button onClick={runAudit} disabled={isProcessing} className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white flex gap-2">
            <BrainCircuit className={`h-4 w-4 ${isProcessing ? 'animate-spin' : ''}`} /> Scout Partnerships
          </Button>
        </div>

        {eco && (
          <div className="space-y-6 animate-in fade-in">
            <Card className="p-6 bg-fuchsia-950/20 border-fuchsia-500/20 flex items-center gap-6">
              <div className="text-center">
                <div className="text-4xl font-black text-white">{eco.ecosystemReadinessScore}</div>
                <div className="text-xs text-slate-400 uppercase mt-1">Readiness Score</div>
              </div>
              <div className="flex-1 text-slate-300 text-lg">{eco.summary}</div>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div>
                <h3 className="text-lg font-bold text-white flex gap-2 items-center mb-4"><Handshake className="h-5 w-5 text-fuchsia-400"/> Joint Ventures</h3>
                <div className="space-y-3">
                  {eco.jointVentures?.map((j: any, i: number) => (
                    <Card key={i} className="p-4 bg-slate-900 border-slate-800 border-l-2 border-fuchsia-500">
                      <div className="font-bold text-white mb-1">{j.opportunity}</div>
                      <div className="text-xs text-fuchsia-400 bg-fuchsia-500/10 px-2 py-0.5 rounded inline-block mb-2">{j.targetPartnerProfile}</div>
                      <div className="text-sm text-slate-400">{j.expectedSynergy}</div>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white flex gap-2 items-center mb-4"><Target className="h-5 w-5 text-rose-400"/> Execution Steps</h3>
                <div className="space-y-3">
                  {eco.executionSteps?.map((e: any, i: number) => (
                    <Card key={i} className="p-4 bg-slate-900 border-slate-800 border-l-2 border-rose-500">
                      <div className="font-bold text-white mb-1">{e.step}</div>
                      <div className="text-xs text-slate-400 font-mono">Timeline: {e.timeline}</div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
