"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { apiGet, apiPost } from '@/lib/api';
import { Copyright, BrainCircuit, FileSignature, Coins } from "lucide-react";

export default function IPPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [ip, setIp] = useState<any>(null);
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
      const res = await apiPost<any>('/api/ip/analyze', { businessId });
      if (res.success) setIp(res.data);
    } finally { setIsProcessing(false); }
  }

  if (status === "loading") return <div className="p-8 text-slate-400">Loading IP Intelligence...</div>;

  return (
    <div className="min-h-screen bg-slate-950 pb-12">
      <nav className="border-b border-slate-800 bg-slate-900/50 px-6 py-4 flex justify-between">
        <Link href="/dashboard" className="text-xl font-bold tracking-tight text-purple-400">Avenik IP</Link>
        <Link href="/dashboard" className="text-sm text-slate-400">Back</Link>
      </nav>
      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-3 items-center">
            <Copyright className="h-8 w-8 text-purple-400" />
            <h1 className="text-3xl font-bold text-white">Intellectual Property</h1>
          </div>
          <Button onClick={runAudit} disabled={isProcessing} className="bg-purple-600 hover:bg-purple-700 text-white flex gap-2">
            <BrainCircuit className={`h-4 w-4 ${isProcessing ? 'animate-spin' : ''}`} /> Generate IP Strategy
          </Button>
        </div>

        {ip && (
          <div className="space-y-6 animate-in fade-in">
            <Card className="p-6 bg-purple-950/20 border-purple-500/20 flex items-center gap-6">
              <div className="text-center">
                <div className="text-4xl font-black text-white">{ip.protectionScore}</div>
                <div className="text-xs text-slate-400 uppercase mt-1">Protection Score</div>
              </div>
              <div className="flex-1 text-slate-300 text-lg">{ip.summary}</div>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div>
                <h3 className="text-lg font-bold text-white flex gap-2 items-center mb-4"><FileSignature className="h-5 w-5 text-indigo-400"/> Assets To Protect</h3>
                <div className="space-y-3">
                  {ip.assetsToProtect?.map((a: any, i: number) => (
                    <Card key={i} className="p-4 bg-slate-900 border-slate-800 border-l-2 border-indigo-500">
                      <div className="flex justify-between">
                        <div className="font-bold text-white mb-1">{a.asset}</div>
                        <div className="text-xs font-bold text-indigo-400">{a.protectionType}</div>
                      </div>
                      <div className="text-xs text-slate-400 mt-2">Priority: <span className="font-bold text-white">{a.priority}</span></div>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white flex gap-2 items-center mb-4"><Coins className="h-5 w-5 text-purple-400"/> Monetization Strategy</h3>
                <div className="space-y-3">
                  {ip.monetizationStrategies?.map((m: any, i: number) => (
                    <Card key={i} className="p-4 bg-slate-900 border-slate-800 border-l-2 border-purple-500">
                      <div className="font-bold text-white mb-1">{m.strategy}</div>
                      <div className="text-sm text-slate-400">{m.estimatedImpact}</div>
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
