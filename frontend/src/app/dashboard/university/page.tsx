"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { apiGet, apiPost } from '@/lib/api';
import { GraduationCap, BrainCircuit, BookOpen, Clock } from "lucide-react";

export default function UniversityPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [uni, setUni] = useState<any>(null);
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
      const res = await apiPost<any>('/api/university/analyze', { businessId });
      if (res.success) setUni(res.data);
    } finally { setIsProcessing(false); }
  }

  if (status === "loading") return <div className="p-8 text-slate-400">Loading University...</div>;

  return (
    <div className="min-h-screen bg-slate-950 pb-12">
      <nav className="border-b border-slate-800 bg-slate-900/50 px-6 py-4 flex justify-between">
        <Link href="/dashboard" className="text-xl font-bold tracking-tight text-blue-400">Avenik University</Link>
        <Link href="/dashboard" className="text-sm text-slate-400">Back</Link>
      </nav>
      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-3 items-center">
            <GraduationCap className="h-8 w-8 text-blue-400" />
            <h1 className="text-3xl font-bold text-white">Corporate University & L&D</h1>
          </div>
          <Button onClick={runAudit} disabled={isProcessing} className="bg-blue-600 hover:bg-blue-700 text-white flex gap-2">
            <BrainCircuit className={`h-4 w-4 ${isProcessing ? 'animate-spin' : ''}`} /> Generate Curriculum
          </Button>
        </div>

        {uni && (
          <div className="space-y-6 animate-in fade-in">
            <Card className="p-6 bg-blue-950/20 border-blue-500/20 flex items-center gap-6">
              <div className="text-center">
                <div className="text-4xl font-black text-white">{uni.workforceReadinessScore}</div>
                <div className="text-xs text-slate-400 uppercase mt-1">Readiness Score</div>
              </div>
              <div className="flex-1 text-slate-300 text-lg">{uni.summary}</div>
            </Card>
            
            <h3 className="text-lg font-bold text-white flex gap-2 items-center mt-8"><BookOpen className="h-5 w-5 text-indigo-400"/> AI Curated Learning Tracks</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {uni.learningTracks?.map((t: any, i: number) => (
                <Card key={i} className="p-5 bg-slate-900 border-slate-800">
                  <div className="flex justify-between mb-2">
                    <h4 className="font-bold text-white text-lg">{t.trackName}</h4>
                    <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded flex items-center gap-1"><Clock className="h-3 w-3"/> {t.duration}</span>
                  </div>
                  <p className="text-sm text-slate-400 mb-3">Target Role: <span className="text-white font-medium">{t.targetRole}</span></p>
                  <div className="text-xs text-slate-500 font-mono">Addresses Gap: {t.skillAddressed}</div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
