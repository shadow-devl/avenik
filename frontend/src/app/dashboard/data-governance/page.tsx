"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { apiGet, apiPost } from '@/lib/api';
import { Database, BrainCircuit, ShieldAlert, ListChecks } from "lucide-react";

export default function DataGovernancePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [gov, setGov] = useState<any>(null);
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
      const res = await apiPost<any>('/api/data-governance/analyze', { businessId });
      if (res.success) setGov(res.data);
    } finally { setIsProcessing(false); }
  }

  if (status === "loading") return <div className="p-8 text-slate-400">Loading Governance...</div>;

  return (
    <div className="min-h-screen bg-slate-950 pb-12">
      <nav className="border-b border-slate-800 bg-slate-900/50 px-6 py-4 flex justify-between">
        <Link href="/dashboard" className="text-xl font-bold tracking-tight text-teal-400">Avenik Data Governance</Link>
        <Link href="/dashboard" className="text-sm text-slate-400">Back</Link>
      </nav>
      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-3 items-center">
            <Database className="h-8 w-8 text-teal-400" />
            <h1 className="text-3xl font-bold text-white">Data Governance & Compliance</h1>
          </div>
          <Button onClick={runAudit} disabled={isProcessing} className="bg-teal-600 hover:bg-teal-700 text-white flex gap-2">
            <BrainCircuit className={`h-4 w-4 ${isProcessing ? 'animate-spin' : ''}`} /> Run Compliance Scan
          </Button>
        </div>

        {gov && (
          <div className="space-y-6 animate-in fade-in">
            <Card className="p-6 bg-teal-950/20 border-teal-500/20 flex items-center gap-6">
              <div className="text-center">
                <div className="text-4xl font-black text-white">{gov.complianceReadinessScore}</div>
                <div className="text-xs text-slate-400 uppercase mt-1">Compliance Score</div>
              </div>
              <div className="flex-1 text-slate-300 text-lg">{gov.summary}</div>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div>
                <h3 className="text-lg font-bold text-white flex gap-2 items-center mb-4"><ShieldAlert className="h-5 w-5 text-rose-400"/> Vulnerabilities</h3>
                <div className="space-y-3">
                  {gov.governanceGaps?.map((g: any, i: number) => (
                    <Card key={i} className="p-4 bg-slate-900 border-slate-800 border-l-2 border-rose-500">
                      <div className="flex justify-between">
                        <div className="font-bold text-white mb-1">{g.gap}</div>
                        <div className="text-xs font-bold text-rose-400">{g.riskLevel}</div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white flex gap-2 items-center mb-4"><ListChecks className="h-5 w-5 text-teal-400"/> Remediation Steps</h3>
                <div className="space-y-3">
                  {gov.remediationSteps?.map((r: any, i: number) => (
                    <Card key={i} className="p-4 bg-slate-900 border-slate-800 border-l-2 border-teal-500">
                      <div className="font-bold text-white mb-1">{r.action}</div>
                      <div className="text-xs text-slate-400 bg-slate-950 p-2 rounded inline-block">Framework: <span className="font-bold text-teal-400">{r.framework}</span></div>
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
