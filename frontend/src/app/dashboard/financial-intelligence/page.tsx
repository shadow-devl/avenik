"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { apiGet, apiPost } from '@/lib/api';
import { Activity, ShieldAlert, CheckCircle2, TrendingDown, DollarSign, BrainCircuit, LineChart, AlertTriangle, CalendarDays } from 'lucide-react';

export default function FinancialIntelligencePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [readiness, setReadiness] = useState<any>(null);
  const [capitalGap, setCapitalGap] = useState<any>(null);
  const [forecast, setForecast] = useState<any>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [businessId, setBusinessId] = useState<string | null>(null);

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
        setBusinessId(bid);
        
        const [readinessRes, gapRes] = await Promise.all([
          apiGet<any>(`/api/finance/readiness?businessId=${bid}`),
          apiGet<any>(`/api/finance/capital-gap?businessId=${bid}`)
        ]);
        
        if (readinessRes.success) setReadiness(readinessRes.data);
        if (gapRes.success) setCapitalGap(gapRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function runForecast() {
    if (!businessId) return;
    setIsPredicting(true);
    try {
      const res = await apiPost<any>('/api/finance/predict-runway', { businessId, horizonMonths: 12 });
      if (res.success) {
        setForecast(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsPredicting(false);
    }
  }

  if (status === "loading" || loading) return <div className="p-8 text-slate-400">Loading Financial Intelligence Engine...</div>;

  return (
    <div className="min-h-screen bg-slate-950 pb-12">
      <nav className="border-b border-slate-800 bg-slate-900/50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-xl font-bold tracking-tight">
              <span className="text-blue-400">A</span>venik
            </Link>
            <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-400 flex items-center gap-2">
              <BrainCircuit className="h-3 w-3" /> Predictive Finance
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white transition-colors">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-emerald-400" />
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Financial Runway Forecaster</h1>
              <p className="mt-1 text-slate-400">AI-driven cash-flow trajectories, burn rate analysis, and capital readiness.</p>
            </div>
          </div>
          <Button 
            onClick={runForecast}
            disabled={isPredicting}
            className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2"
          >
            {isPredicting ? (
              <span className="flex items-center gap-2"><BrainCircuit className="h-4 w-4 animate-spin" /> Forecasting Runway...</span>
            ) : (
              <span className="flex items-center gap-2"><LineChart className="h-4 w-4" /> Generate 12-Month Forecast</span>
            )}
          </Button>
        </div>

        {forecast && (
          <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-emerald-400" /> AI Financial Trajectory (12 Months)
            </h2>
            <Card className="p-6 bg-emerald-950/20 border-emerald-500/20 mb-6">
              <p className="text-emerald-200 text-lg leading-relaxed">{forecast.summary}</p>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="p-6 bg-slate-900 border-slate-800">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Predicted Runway</p>
                <div className="flex items-end gap-3">
                  <h3 className="text-4xl font-bold text-white">
                    {forecast.projectedRunwayMonths === 999 ? 'Infinite' : forecast.projectedRunwayMonths.toFixed(1)} 
                    <span className="text-lg text-slate-400 ml-2">months</span>
                  </h3>
                </div>
              </Card>

              <Card className="p-6 bg-slate-900 border-slate-800">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Average Monthly Burn</p>
                <div className="flex items-end gap-3">
                  <h3 className="text-4xl font-bold text-rose-400">
                    ${forecast.averageMonthlyBurn?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </h3>
                  <TrendingDown className="h-5 w-5 text-rose-400 mb-1" />
                </div>
              </Card>

              <Card className="p-6 bg-slate-900 border-slate-800">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Projected Cash-Out Date</p>
                <div className="flex items-center gap-3 h-full pb-2">
                  {forecast.cashOutDate ? (
                    <>
                      <CalendarDays className="h-8 w-8 text-amber-400" />
                      <h3 className="text-2xl font-bold text-amber-400">
                        {new Date(forecast.cashOutDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}
                      </h3>
                    </>
                  ) : (
                    <span className="text-emerald-400 font-bold text-xl flex items-center gap-2">
                      <CheckCircle2 className="h-6 w-6" /> Self-Sustaining
                    </span>
                  )}
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <h3 className="font-semibold text-slate-300">Revenue vs Expense Forecast</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {forecast.revenueForecast?.slice(0, 8).map((month: any, i: number) => (
                    <Card key={i} className="p-4 bg-slate-900 border-slate-800">
                      <div className="text-xs text-slate-400 mb-2 font-mono">{month.month}</div>
                      <div className="text-emerald-400 font-bold mb-1">+${month.projectedRevenue?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                      <div className="text-rose-400 font-bold">-${month.projectedExpense?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                    </Card>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-slate-300 mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-400" /> Financial Risk Factors
                </h3>
                <div className="space-y-3">
                  {forecast.financialRisks?.map((risk: string, i: number) => (
                    <Card key={i} className="p-4 bg-slate-900 border-slate-800 border-l-4 border-l-amber-500">
                      <p className="text-sm text-slate-300">{risk}</p>
                    </Card>
                  ))}
                  {(!forecast.financialRisks || forecast.financialRisks.length === 0) && (
                    <p className="text-sm text-slate-500">No immediate structural financial risks detected.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              Capital Gap Analysis
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
                <div className="py-8 text-center text-slate-500">Capital gap data unavailable. Generate baseline telemetry.</div>
              )}
            </Card>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              Financial Readiness Score
            </h2>
            <Card className="p-6 border-emerald-500/20 bg-slate-900/50">
              {readiness ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-full border-4 border-emerald-500 flex items-center justify-center">
                      <span className="text-3xl font-bold text-emerald-400">{readiness.readinessScore || readiness.score || 0}</span>
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
                <div className="py-8 text-center text-slate-500">Readiness score unavailable. Connect accounting sources.</div>
              )}
            </Card>
          </div>

        </div>
      </main>
    </div>
  );
}
