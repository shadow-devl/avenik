"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { apiGet, apiPost } from '@/lib/api';
import { Scale, BrainCircuit, AlertTriangle, CheckCircle } from "lucide-react";

export default function LegalPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [legal, setLegal] = useState<any>(null);
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
      const res = await apiPost<any>('/api/legal/audit', { businessId });
      if (res.success) setLegal(res.data);
    } finally { setIsProcessing(false); }
  }

  if (status === "loading") return <div className="p-8 text-slate-400">Loading Legal...</div>;

  return (
    <div className="min-h-screen bg-slate-950 pb-12">
      <nav className="border-b border-slate-800 bg-slate-900/50 px-6 py-4 flex justify-between">
        <Link href="/dashboard" className="text-xl font-bold tracking-tight text-purple-400">Avenik Legal Hub</Link>
        <Link href="/dashboard" className="text-sm text-slate-400">Back</Link>
      </nav>
      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-3 items-center">
            <Scale className="h-8 w-8 text-purple-400" />
            <h1 className="text-3xl font-bold text-white">Legal & Compliance Orchestration</h1>
          </div>
          <Button onClick={runAudit} disabled={isProcessing} className="bg-purple-600 hover:bg-purple-700 text-white flex gap-2">
            <BrainCircuit className={`h-4 w-4 ${isProcessing ? 'animate-spin' : ''}`} /> Run Compliance Audit
          </Button>
        </div>

        {legal && (
          <div className="space-y-6 animate-in fade-in">
            <Card className="p-6 bg-purple-950/20 border-purple-500/20 flex items-center gap-6">
              <div className="text-center">
                <div className="text-4xl font-black text-white">{legal.complianceScore}</div>
                <div className="text-xs text-slate-400 uppercase">Compliance Score</div>
              </div>
              <div className="flex-1 text-slate-300 text-lg">{legal.summary}</div>
              <div className="text-center border-l border-slate-800 pl-6">
                <div className="text-xl font-bold text-purple-400">{legal.riskLevel}</div>
                <div className="text-xs text-slate-400 uppercase">Risk Level</div>
              </div>
            </Card>
            
            <h3 className="text-lg font-bold text-white flex gap-2 items-center mt-8"><CheckCircle className="h-5 w-5 text-purple-400"/> Legal Action Items</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {legal.actionItems?.map((item: any, i: number) => (
                <Card key={i} className="p-5 bg-slate-900 border-slate-800 flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-white">{item.task}</h4>
                    <div className="text-xs text-slate-500 font-mono mt-2">{item.category}</div>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${item.priority === 'URGENT' ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'}`}>
                    {item.priority}
                  </span>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
