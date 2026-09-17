"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { apiGet, apiPost } from '@/lib/api';
import { LineChart, BrainCircuit, TrendingUp, AlertOctagon } from "lucide-react";

export default function FinancialPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [fin, setFin] = useState<any>(null);
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
      const res = await apiPost<any>('/api/financial-intelligence/analyze', { businessId });
      if (res.success) setFin(res.data);
    } finally { setIsProcessing(false); }
  }

  if (status === "loading") return <div className="p-8 text-slate-400">Loading Finance Engine...</div>;

  return (
    <div className="min-h-screen bg-slate-950 pb-12">
      <nav className="border-b border-slate-800 bg-slate-900/50 px-6 py-4 flex justify-between">
        <Link href="/dashboard" className="text-xl font-bold tracking-tight text-emerald-400">Avenik Finance</Link>
        <Link href="/dashboard" className="text-sm text-slate-400">Back</Link>
      </nav>
      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-3 items-center">
            <LineChart className="h-8 w-8 text-emerald-400" />
            <h1 className="text-3xl font-bold text-white">Financial Intelligence</h1>
          </div>
          <Button onClick={runAudit} disabled={isProcessing} className="bg-emerald-600 hover:bg-emerald-700 text-white flex gap-2">
            <BrainCircuit className={`h-4 w-4 ${isProcessing ? 'animate-spin' : ''}`} /> Analyze Margins
          </Button>
        </div>

        {fin && (
          <div className="space-y-6 animate-in fade-in">
            <Card className="p-6 bg-emerald-950/20 border-emerald-500/20 flex items-center gap-6">
              <div className="text-center">
                <div className="text-4xl font-black text-white">{fin.financialHealthScore}</div>
                <div className="text-xs text-slate-400 uppercase mt-1">Health Score</div>
              </div>
              <div className="flex-1 text-slate-300 text-lg">{fin.summary}</div>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div>
                <h3 className="text-lg font-bold text-white flex gap-2 items-center mb-4"><TrendingUp className="h-5 w-5 text-emerald-400"/> Margin Optimizations</h3>
                <div className="space-y-3">
                  {fin.marginOptimizations?.map((m: any, i: number) => (
                    <Card key={i} className="p-4 bg-slate-900 border-slate-800 border-l-2 border-emerald-500">
                      <div className="font-bold text-white mb-1">{m.area}</div>
                      <div className="text-sm text-slate-400 mb-2">{m.strategy}</div>
                      <div className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded inline-block">Impact: {m.impact}</div>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white flex gap-2 items-center mb-4"><AlertOctagon className="h-5 w-5 text-rose-400"/> Anomalies Detected</h3>
                <div className="space-y-3">
                  {fin.anomaliesDetected?.map((a: any, i: number) => (
                    <Card key={i} className="p-4 bg-slate-900 border-slate-800 border-l-2 border-rose-500">
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-slate-300">{a.description}</div>
                        <div className="text-xs font-bold text-rose-400 ml-4">{a.severity}</div>
                      </div>
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
