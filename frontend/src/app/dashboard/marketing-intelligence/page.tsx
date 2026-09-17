"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { apiGet, apiPost } from '@/lib/api';
import { Megaphone, BrainCircuit, Rocket, Activity } from "lucide-react";

export default function MarketingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mkt, setMkt] = useState<any>(null);
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
      const res = await apiPost<any>('/api/marketing-intelligence/analyze', { businessId });
      if (res.success) setMkt(res.data);
    } finally { setIsProcessing(false); }
  }

  if (status === "loading") return <div className="p-8 text-slate-400">Loading Marketing AI...</div>;

  return (
    <div className="min-h-screen bg-slate-950 pb-12">
      <nav className="border-b border-slate-800 bg-slate-900/50 px-6 py-4 flex justify-between">
        <Link href="/dashboard" className="text-xl font-bold tracking-tight text-pink-400">Avenik Marketing</Link>
        <Link href="/dashboard" className="text-sm text-slate-400">Back</Link>
      </nav>
      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-3 items-center">
            <Megaphone className="h-8 w-8 text-pink-400" />
            <h1 className="text-3xl font-bold text-white">Marketing Intelligence</h1>
          </div>
          <Button onClick={runAudit} disabled={isProcessing} className="bg-pink-600 hover:bg-pink-700 text-white flex gap-2">
            <BrainCircuit className={`h-4 w-4 ${isProcessing ? 'animate-spin' : ''}`} /> Generate Campaigns
          </Button>
        </div>

        {mkt && (
          <div className="space-y-6 animate-in fade-in">
            <Card className="p-6 bg-pink-950/20 border-pink-500/20 flex items-center gap-6">
              <div className="text-center">
                <div className="text-4xl font-black text-white">{mkt.brandResonanceScore}</div>
                <div className="text-xs text-slate-400 uppercase mt-1">Brand Resonance</div>
              </div>
              <div className="flex-1 text-slate-300 text-lg">{mkt.summary}</div>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div>
                <h3 className="text-lg font-bold text-white flex gap-2 items-center mb-4"><Rocket className="h-5 w-5 text-pink-400"/> AI Campaign Plays</h3>
                <div className="space-y-3">
                  {mkt.campaignPlays?.map((c: any, i: number) => (
                    <Card key={i} className="p-4 bg-slate-900 border-slate-800 border-l-2 border-pink-500">
                      <div className="font-bold text-white mb-1">{c.campaignName}</div>
                      <div className="text-xs text-pink-400 mb-2">Target: {c.targetSegment}</div>
                      <div className="text-sm text-slate-300 italic">"{c.coreMessage}"</div>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white flex gap-2 items-center mb-4"><Activity className="h-5 w-5 text-violet-400"/> Channel Optimization</h3>
                <div className="space-y-3">
                  {mkt.channelOptimizations?.map((o: any, i: number) => (
                    <Card key={i} className="p-4 bg-slate-900 border-slate-800 border-l-2 border-violet-500">
                      <div className="font-bold text-white mb-1">{o.channel}</div>
                      <div className="text-sm text-slate-400">{o.tactic}</div>
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
