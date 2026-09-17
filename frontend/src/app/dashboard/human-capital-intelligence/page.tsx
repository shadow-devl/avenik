"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { apiGet, apiPost } from '@/lib/api';
import { Users, BrainCircuit, Target, Briefcase } from "lucide-react";

export default function HumanCapitalPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [talent, setTalent] = useState<any>(null);
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
      const res = await apiPost<any>('/api/human-capital-intelligence/analyze', { businessId });
      if (res.success) setTalent(res.data);
    } finally { setIsProcessing(false); }
  }

  if (status === "loading") return <div className="p-8 text-slate-400">Loading Talent...</div>;

  return (
    <div className="min-h-screen bg-slate-950 pb-12">
      <nav className="border-b border-slate-800 bg-slate-900/50 px-6 py-4 flex justify-between">
        <Link href="/dashboard" className="text-xl font-bold tracking-tight text-pink-400">Avenik Human Capital</Link>
        <Link href="/dashboard" className="text-sm text-slate-400">Back</Link>
      </nav>
      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-3 items-center">
            <Users className="h-8 w-8 text-pink-400" />
            <h1 className="text-3xl font-bold text-white">Human Capital Intelligence</h1>
          </div>
          <Button onClick={runAudit} disabled={isProcessing} className="bg-pink-600 hover:bg-pink-700 text-white flex gap-2">
            <BrainCircuit className={`h-4 w-4 ${isProcessing ? 'animate-spin' : ''}`} /> Analyze Talent Map
          </Button>
        </div>

        {talent && (
          <div className="space-y-6 animate-in fade-in">
            <Card className="p-6 bg-pink-950/20 border-pink-500/20 flex items-center gap-6">
              <div className="text-center">
                <div className="text-4xl font-black text-white">{talent.talentHealthScore}</div>
                <div className="text-xs text-slate-400 uppercase">Talent Score</div>
              </div>
              <div className="flex-1 text-slate-300 text-lg">{talent.summary}</div>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div>
                <h3 className="text-lg font-bold text-white flex gap-2 items-center mb-4"><Briefcase className="h-5 w-5 text-pink-400"/> Critical Hires</h3>
                <div className="space-y-3">
                  {talent.criticalHires?.map((h: any, i: number) => (
                    <Card key={i} className="p-4 bg-slate-900 border-slate-800 border-l-2 border-pink-500">
                      <div className="flex justify-between">
                        <div className="font-bold text-white mb-1">{h.role}</div>
                        <div className="text-xs font-bold text-pink-400">{h.urgency}</div>
                      </div>
                      <div className="text-sm text-slate-400 mt-2">{h.reason}</div>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white flex gap-2 items-center mb-4"><Target className="h-5 w-5 text-purple-400"/> Upskilling Tracks</h3>
                <div className="space-y-3">
                  {talent.upskillingTracks?.map((u: any, i: number) => (
                    <Card key={i} className="p-4 bg-slate-900 border-slate-800 border-l-2 border-purple-500">
                      <div className="font-bold text-white mb-1">{u.targetGroup}</div>
                      <div className="text-xs text-purple-400 font-bold uppercase mb-2">Focus: {u.focusArea}</div>
                      <div className="text-sm text-slate-300">{u.impact}</div>
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
