"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { apiGet, apiPost } from '@/lib/api';
import { Factory, BrainCircuit, Wrench, ArrowRightLeft } from "lucide-react";

export default function ProductionHubPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [prod, setProd] = useState<any>(null);
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
      const res = await apiPost<any>('/api/production-hub/optimize', { businessId });
      if (res.success) setProd(res.data);
    } finally { setIsProcessing(false); }
  }

  if (status === "loading") return <div className="p-8 text-slate-400">Loading Hub...</div>;

  return (
    <div className="min-h-screen bg-slate-950 pb-12">
      <nav className="border-b border-slate-800 bg-slate-900/50 px-6 py-4 flex justify-between">
        <Link href="/dashboard" className="text-xl font-bold tracking-tight text-blue-400">Avenik Production Hub</Link>
        <Link href="/dashboard" className="text-sm text-slate-400">Back</Link>
      </nav>
      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-3 items-center">
            <Factory className="h-8 w-8 text-blue-400" />
            <h1 className="text-3xl font-bold text-white">Production & Logistics Hub</h1>
          </div>
          <Button onClick={runAudit} disabled={isProcessing} className="bg-blue-600 hover:bg-blue-700 text-white flex gap-2">
            <BrainCircuit className={`h-4 w-4 ${isProcessing ? 'animate-spin' : ''}`} /> Optimize Supply Chain
          </Button>
        </div>

        {prod && (
          <div className="space-y-6 animate-in fade-in">
            <Card className="p-6 bg-blue-950/20 border-blue-500/20 flex items-center gap-6">
              <div className="text-center">
                <div className="text-4xl font-black text-white">{prod.efficiencyScore}</div>
                <div className="text-xs text-slate-400 uppercase">Efficiency</div>
              </div>
              <div className="flex-1 text-slate-300 text-lg">{prod.summary}</div>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div>
                <h3 className="text-lg font-bold text-white flex gap-2 items-center mb-4"><Wrench className="h-5 w-5 text-rose-400"/> Bottlenecks</h3>
                <div className="space-y-3">
                  {prod.bottlenecks?.map((b: any, i: number) => (
                    <Card key={i} className="p-4 bg-slate-900 border-slate-800 border-l-2 border-rose-500">
                      <div className="font-bold text-white mb-1">{b.area}</div>
                      <div className="text-sm text-slate-400 mb-2">Severity: <span className="text-rose-400 font-bold">{b.severity}</span></div>
                      <div className="text-xs bg-slate-950 p-2 text-slate-300">{b.solution}</div>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white flex gap-2 items-center mb-4"><ArrowRightLeft className="h-5 w-5 text-blue-400"/> Strategic Optimizations</h3>
                <div className="space-y-3">
                  {prod.optimizations?.map((opt: any, i: number) => (
                    <Card key={i} className="p-4 bg-slate-900 border-slate-800 border-l-2 border-blue-500">
                      <div className="font-bold text-white mb-1">{opt.strategy}</div>
                      <div className="text-xs text-emerald-400 font-bold">{opt.estimatedSavings}</div>
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
