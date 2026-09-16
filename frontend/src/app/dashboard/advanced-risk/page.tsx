"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { apiGet, apiPost } from '@/lib/api';
import { ShieldAlert } from 'lucide-react';

export default function AdvancedRiskPage() {
  const { status } = useSession();
  const router = useRouter();
  
  const [fraudCases, setFraudCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    if (status === "authenticated") {
      fetchRiskData();
    }
  }, [status, router]);

  async function fetchRiskData() {
    try {
      setLoading(true);
      const ctx = await apiGet<any>('/api/context/current');
      if (ctx.success && ctx.data.business) {
        const bid = ctx.data.business.id;
        
        const res = await apiGet<any>('/api/fraud', { headers: { 'x-business-id': bid } });
        if (res.success) {
          setFraudCases(res.data);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function reportFraud() {
    try {
      const ctx = await apiGet<any>('/api/context/current');
      if (ctx.success && ctx.data.business) {
        const bid = ctx.data.business.id;
        await apiPost<any>('/api/fraud/report', {
          targetUserId: "SYSTEM_MONITORING",
          reason: "Anomalous transaction volume detected",
          evidence: { source: "payment_gateway" }
        }, { headers: { 'x-business-id': bid } });
        fetchRiskData();
      }
    } catch (err) {
      console.error(err);
    }
  }

  if (status === "loading" || loading) return <div className="p-8 text-slate-400">Loading Risk Intelligence...</div>;

  return (
    <div className="min-h-screen bg-slate-950">
      <nav className="border-b border-slate-800 bg-slate-900/50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-xl font-bold tracking-tight">
              <span className="text-blue-400">A</span>venik
            </Link>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">
              Advanced Risk Engine
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Advanced Risk Engine</h1>
            <p className="text-slate-400 mt-2">Holistic risk identification and mitigation intelligence.</p>
          </div>
          <Button onClick={reportFraud} variant="outline" className="text-red-400 border-red-500/20 hover:bg-red-500/10">Run System Audit</Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-red-500" />
              Active Risk Flags & Fraud Reports
            </h2>
            <Card className="p-0 overflow-hidden border-slate-800 bg-slate-900/50">
              {fraudCases.length === 0 ? (
                <div className="p-6 text-center text-slate-400">No risk flags detected. Environment secure.</div>
              ) : (
                <div className="divide-y divide-slate-800">
                  {fraudCases.map(f => (
                    <div key={f.id} className="p-5">
                      <div className="flex justify-between items-start">
                        <h4 className="font-semibold text-red-400">{f.reason}</h4>
                        <span className="text-xs px-2 py-1 bg-red-500/10 text-red-400 rounded-full">{f.status}</span>
                      </div>
                      <p className="text-sm text-slate-400 mt-2">Target: {f.targetUserId}</p>
                      <p className="text-xs text-slate-500 mt-1">Reported: {new Date(f.createdAt).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
