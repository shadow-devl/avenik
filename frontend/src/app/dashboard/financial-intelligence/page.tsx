"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { apiGet, apiPost } from '@/lib/api';
import { Activity, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function FinancialIntelligencePage() {
  const { status } = useSession();
  const router = useRouter();
  
  const [readiness, setReadiness] = useState<any>(null);
  const [capitalGap, setCapitalGap] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    if (status === "authenticated" && session?.user?.id) {
      fetchFinanceData();
    }
  }, [status, router, session]);

  async function fetchFinanceData() {
    try {
      setLoading(true);
      const ctx = await apiGet<any>('/api/context/current');
      if (ctx.success && ctx.data.business) {
        const bid = ctx.data.business.id;
        
        const [readinessRes, gapRes, metricsRes] = await Promise.all([
          apiGet<any>(`/api/finance/readiness?businessId=${bid}`),
          apiGet<any>(`/api/finance/capital-gap?businessId=${bid}`),
          apiGet<any>(`/api/financial-intelligence/metrics?businessId=${bid}`)
        ]);
        
        if (readinessRes.success) setReadiness(readinessRes.data);
        if (gapRes.success) setCapitalGap(gapRes.data);
        if (metricsRes.success) setMetrics(metricsRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading" || loading) return <div className="p-8 text-slate-400">Loading Financial Intelligence...</div>;

  return (
    <div className="min-h-screen bg-slate-950">
      <nav className="border-b border-slate-800 bg-slate-900/50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-xl font-bold tracking-tight">
              <span className="text-blue-400">A</span>venik
            </Link>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">
              Financial Intelligence
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
        <h1 className="text-3xl font-bold text-white tracking-tight">Financial Intelligence</h1>
        <p className="text-slate-400 mt-2">Capital gap analysis, runway metrics, and predictive insights.</p>

        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
            <Card className="p-4 bg-slate-900/50 border-slate-800">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Est. Runway</p>
              <h3 className="text-2xl font-bold text-emerald-400 mt-1">{metrics.overview.estimatedRunwayMonths} months</h3>
            </Card>
            <Card className="p-4 bg-slate-900/50 border-slate-800">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Monthly Burn</p>
              <h3 className="text-2xl font-bold text-rose-400 mt-1">${metrics.overview.monthlyBurnRate.toLocaleString()}</h3>
            </Card>
            <Card className="p-4 bg-slate-900/50 border-slate-800">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Cash Flow</p>
              <h3 className="text-2xl font-bold text-blue-400 mt-1">${metrics.overview.currentCashFlow.toLocaleString()}</h3>
            </Card>
            <Card className="p-4 bg-slate-900/50 border-slate-800">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Revenue</p>
              <h3 className="text-2xl font-bold text-emerald-400 mt-1">${metrics.overview.totalRevenue.toLocaleString()}</h3>
            </Card>
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              Capital Gap Analysis
              <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-normal uppercase">Calculated</span>
            </h2>
            <Card className="p-6 border-blue-500/20 bg-slate-900/50">
              {capitalGap ? (
                <div className="space-y-6">
                  <div>
                    <p className="text-sm text-slate-400">Identified Capital Gap</p>
                    <p className="text-4xl font-bold text-blue-400">${(capitalGap.gapAmount || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-2">Recommended Funding Sources</h3>
                    <div className="flex gap-2 flex-wrap">
                      {capitalGap.recommendations?.map((r: string, i: number) => (
                        <span key={i} className="px-3 py-1 bg-slate-800 text-slate-300 rounded-full text-xs">
                          {r.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-slate-500">Capital gap data unavailable for this context.</div>
              )}
            </Card>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              Financial Readiness Score
              <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-normal uppercase">Calculated</span>
            </h2>
            <Card className="p-6 border-emerald-500/20 bg-slate-900/50">
              {readiness ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-full border-4 border-emerald-500 flex items-center justify-center">
                      <span className="text-3xl font-bold text-emerald-400">{readiness.readinessScore || readiness.score}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-white">Overall Readiness</p>
                      <p className="text-sm text-slate-400 mt-1">Based on compliance, trajectory, and operational metrics.</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-white mb-3">Key Factors</h3>
                    <ul className="space-y-2">
                      {readiness.factors?.map((f: any, i: number) => (
                        <li key={i} className="flex justify-between items-center text-sm border-b border-slate-800 pb-2">
                          <span className="text-slate-300">{f.name}</span>
                          <span className={f.passed ? "text-emerald-400" : "text-amber-400"}>{f.passed ? "Pass" : "Attention"}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-slate-500">Readiness score unavailable for this context.</div>
              )}
            </Card>
          </div>

        </div>
      </main>
    </div>
  );
}
