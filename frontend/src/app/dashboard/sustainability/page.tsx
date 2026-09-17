"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { apiGet, apiPost } from '@/lib/api';
import { Leaf, BrainCircuit, Activity, Sprout } from "lucide-react";

export default function SustainabilityPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [esg, setEsg] = useState<any>(null);
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
      const res = await apiPost<any>('/api/sustainability/analyze', { businessId });
      if (res.success) setEsg(res.data);
    } finally { setIsProcessing(false); }
  }

  if (status === "loading") return <div className="p-8 text-slate-400">Loading ESG...</div>;

  return (
    <div className="min-h-screen bg-slate-950 pb-12">
      <nav className="border-b border-slate-800 bg-slate-900/50 px-6 py-4 flex justify-between">
        <Link href="/dashboard" className="text-xl font-bold tracking-tight text-emerald-400">Avenik ESG</Link>
        <Link href="/dashboard" className="text-sm text-slate-400">Back</Link>
      </nav>
      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-3 items-center">
            <Leaf className="h-8 w-8 text-emerald-400" />
            <h1 className="text-3xl font-bold text-white">Sustainability & ESG</h1>
          </div>
          <Button onClick={runAudit} disabled={isProcessing} className="bg-emerald-600 hover:bg-emerald-700 text-white flex gap-2">
            <BrainCircuit className={`h-4 w-4 ${isProcessing ? 'animate-spin' : ''}`} /> Analyze ESG Posture
          </Button>
        </div>

        {esg && (
          <div className="space-y-6 animate-in fade-in">
            <Card className="p-6 bg-emerald-950/20 border-emerald-500/20 flex items-center gap-6">
              <div className="text-center">
                <div className="text-4xl font-black text-white">{esg.esgScore}</div>
                <div className="text-xs text-slate-400 uppercase">ESG Score</div>
              </div>
              <div className="flex-1 text-slate-300 text-lg">{esg.summary}</div>
              <div className="text-center border-l border-slate-800 pl-6">
                <div className="text-xl font-bold text-emerald-400">{esg.carbonFootprintEstimate}</div>
                <div className="text-xs text-slate-400 uppercase">Carbon Footprint</div>
              </div>
            </Card>
            
            <h3 className="text-lg font-bold text-white flex gap-2 items-center mt-8"><Sprout className="h-5 w-5 text-emerald-400"/> Recommended Initiatives</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {esg.initiatives?.map((init: any, i: number) => (
                <Card key={i} className="p-5 bg-slate-900 border-slate-800">
                  <div className="flex justify-between mb-2">
                    <h4 className="font-bold text-white">{init.title}</h4>
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">{init.impact} Impact</span>
                  </div>
                  <p className="text-sm text-slate-400 mb-3">{init.description}</p>
                  <div className="text-xs text-slate-500 font-mono">Cost: {init.costEstimate}</div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
