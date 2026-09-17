"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { apiGet, apiPost } from '@/lib/api';
import { HeartHandshake, BrainCircuit, Frown, Gift } from "lucide-react";

export default function CustomerExperiencePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [cx, setCx] = useState<any>(null);
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
      const res = await apiPost<any>('/api/customer-experience/analyze', { businessId });
      if (res.success) setCx(res.data);
    } finally { setIsProcessing(false); }
  }

  if (status === "loading") return <div className="p-8 text-slate-400">Loading CX...</div>;

  return (
    <div className="min-h-screen bg-slate-950 pb-12">
      <nav className="border-b border-slate-800 bg-slate-900/50 px-6 py-4 flex justify-between">
        <Link href="/dashboard" className="text-xl font-bold tracking-tight text-fuchsia-400">Avenik CX</Link>
        <Link href="/dashboard" className="text-sm text-slate-400">Back</Link>
      </nav>
      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-3 items-center">
            <HeartHandshake className="h-8 w-8 text-fuchsia-400" />
            <h1 className="text-3xl font-bold text-white">Customer Experience Intelligence</h1>
          </div>
          <Button onClick={runAudit} disabled={isProcessing} className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white flex gap-2">
            <BrainCircuit className={`h-4 w-4 ${isProcessing ? 'animate-spin' : ''}`} /> Analyze Journeys
          </Button>
        </div>

        {cx && (
          <div className="space-y-6 animate-in fade-in">
            <Card className="p-6 bg-fuchsia-950/20 border-fuchsia-500/20 flex items-center gap-6">
              <div className="text-center">
                <div className="text-4xl font-black text-white">{cx.cxHealthScore}</div>
                <div className="text-xs text-slate-400 uppercase mt-1">CX Health</div>
              </div>
              <div className="flex-1 text-slate-300 text-lg">{cx.summary}</div>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div>
                <h3 className="text-lg font-bold text-white flex gap-2 items-center mb-4"><Frown className="h-5 w-5 text-rose-400"/> Friction Points</h3>
                <div className="space-y-3">
                  {cx.frictionPoints?.map((f: any, i: number) => (
                    <Card key={i} className="p-4 bg-slate-900 border-slate-800 border-l-2 border-rose-500">
                      <div className="flex justify-between">
                        <div className="font-bold text-white mb-1">{f.journeyStage}</div>
                        <div className="text-xs font-bold text-rose-400">{f.severity}</div>
                      </div>
                      <div className="text-xs text-slate-300 mt-2 bg-slate-950 p-2 rounded">Resolution: {f.resolution}</div>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white flex gap-2 items-center mb-4"><Gift className="h-5 w-5 text-fuchsia-400"/> Loyalty Initiatives</h3>
                <div className="space-y-3">
                  {cx.loyaltyInitiatives?.map((l: any, i: number) => (
                    <Card key={i} className="p-4 bg-slate-900 border-slate-800 border-l-2 border-fuchsia-500">
                      <div className="font-bold text-white mb-1">{l.initiative}</div>
                      <div className="text-sm text-slate-400 mb-2">Target: {l.targetSegment}</div>
                      <div className="text-xs text-emerald-400 bg-slate-950 p-2 rounded inline-block">{l.expectedLift}</div>
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
