"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { apiGet, apiPost } from '@/lib/api';
import { Activity, BrainCircuit, Cog, Zap } from "lucide-react";

export default function OperationsIntelligencePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [ops, setOps] = useState<any>(null);
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
      const res = await apiPost<any>('/api/operations-intelligence/analyze', { businessId });
      if (res.success) setOps(res.data);
    } finally { setIsProcessing(false); }
  }

  if (status === "loading") return <div className="p-8 text-slate-400">Loading Operations...</div>;

  return (
    <div className="min-h-screen bg-slate-950 pb-12">
      <nav className="border-b border-slate-800 bg-slate-900/50 px-6 py-4 flex justify-between">
        <Link href="/dashboard" className="text-xl font-bold tracking-tight text-orange-400">Avenik Operations Intelligence</Link>
        <Link href="/dashboard" className="text-sm text-slate-400">Back</Link>
      </nav>
      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-3 items-center">
            <Cog className="h-8 w-8 text-orange-400" />
            <h1 className="text-3xl font-bold text-white">Operations Intelligence</h1>
          </div>
          <Button onClick={runAudit} disabled={isProcessing} className="bg-orange-600 hover:bg-orange-700 text-white flex gap-2">
            <BrainCircuit className={`h-4 w-4 ${isProcessing ? 'animate-spin' : ''}`} /> Scan Telemetry
          </Button>
        </div>

        {ops && (
          <div className="space-y-6 animate-in fade-in">
            <Card className="p-6 bg-orange-950/20 border-orange-500/20 flex items-center gap-6">
              <div className="text-center">
                <div className="text-4xl font-black text-white">{ops.workflowEfficiencyScore}</div>
                <div className="text-xs text-slate-400 uppercase mt-1">Workflow Efficiency</div>
              </div>
              <div className="flex-1 text-slate-300 text-lg">{ops.summary}</div>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div>
                <h3 className="text-lg font-bold text-white flex gap-2 items-center mb-4"><Zap className="h-5 w-5 text-amber-400"/> Bottlenecks & Automation</h3>
                <div className="space-y-3">
                  {ops.processBottlenecks?.map((b: any, i: number) => (
                    <Card key={i} className="p-4 bg-slate-900 border-slate-800 border-l-2 border-amber-500">
                      <div className="flex justify-between">
                        <div className="font-bold text-white mb-1">{b.process}</div>
                        <div className="text-xs font-bold text-amber-400">{b.impact} Impact</div>
                      </div>
                      <div className="text-xs text-slate-300 mt-2 bg-slate-950 p-2 rounded">Automation: {b.automationPotential}</div>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white flex gap-2 items-center mb-4"><Activity className="h-5 w-5 text-orange-400"/> Resource Allocation</h3>
                <div className="space-y-3">
                  {ops.resourceAllocations?.map((r: any, i: number) => (
                    <Card key={i} className="p-4 bg-slate-900 border-slate-800 border-l-2 border-orange-500">
                      <div className="font-bold text-white mb-1">{r.resource}</div>
                      <div className="text-sm text-slate-400">{r.action}</div>
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
