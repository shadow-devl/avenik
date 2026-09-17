"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { apiGet, apiPost } from '@/lib/api';
import { Lightbulb, BrainCircuit, Rocket, LayoutDashboard } from "lucide-react";

export default function IdeasPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [ideas, setIdeas] = useState<any>(null);
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
      const res = await apiPost<any>('/api/ideas/analyze', { businessId });
      if (res.success) setIdeas(res.data);
    } finally { setIsProcessing(false); }
  }

  if (status === "loading") return <div className="p-8 text-slate-400">Loading Ideation Engine...</div>;

  return (
    <div className="min-h-screen bg-slate-950 pb-12">
      <nav className="border-b border-slate-800 bg-slate-900/50 px-6 py-4 flex justify-between">
        <Link href="/dashboard" className="text-xl font-bold tracking-tight text-amber-400">Avenik Ideation</Link>
        <Link href="/dashboard" className="text-sm text-slate-400">Back</Link>
      </nav>
      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-3 items-center">
            <Lightbulb className="h-8 w-8 text-amber-400" />
            <h1 className="text-3xl font-bold text-white">Ideation & Concept Engine</h1>
          </div>
          <Button onClick={runAudit} disabled={isProcessing} className="bg-amber-600 hover:bg-amber-700 text-white flex gap-2">
            <BrainCircuit className={`h-4 w-4 ${isProcessing ? 'animate-spin' : ''}`} /> Brainstorm Concepts
          </Button>
        </div>

        {ideas && (
          <div className="space-y-6 animate-in fade-in">
            <Card className="p-6 bg-amber-950/20 border-amber-500/20 flex items-center gap-6">
              <div className="text-center">
                <div className="text-4xl font-black text-white">{ideas.innovationScore}</div>
                <div className="text-xs text-slate-400 uppercase mt-1">Innovation Velocity</div>
              </div>
              <div className="flex-1 text-slate-300 text-lg">{ideas.summary}</div>
            </Card>
            
            <h3 className="text-lg font-bold text-white flex gap-2 items-center mt-8"><Rocket className="h-5 w-5 text-amber-400"/> AI Generated Concepts</h3>
            <div className="grid grid-cols-1 gap-4">
              {ideas.ideas?.map((idea: any, i: number) => (
                <Card key={i} className="p-5 bg-slate-900 border-slate-800">
                  <div className="flex justify-between mb-2">
                    <h4 className="font-bold text-white text-lg">{idea.title}</h4>
                    <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">{idea.feasibility} Feasibility</span>
                  </div>
                  <p className="text-sm text-slate-400 mb-3">{idea.description}</p>
                  <div className="text-xs text-slate-500 font-mono">Target Segment: {idea.targetSegment}</div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
