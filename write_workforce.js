const fs = require('fs');

const content = \"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { apiGet, apiPost } from '@/lib/api';
import { Activity, Target, Zap, Clock, TrendingUp, Users, AlertTriangle, Briefcase, BrainCircuit } from "lucide-react";

export default function PredictiveWorkforcePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [metrics, setMetrics] = useState<any>(null);
  const [forecast, setForecast] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPredicting, setIsPredicting] = useState(false);
  const [businessId, setBusinessId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    if (status === "authenticated" && session?.user?.id) {
      fetchData();
    }
  }, [status, router, session]);

  async function fetchData() {
    try {
      setLoading(true);
      const ctx = await apiGet<any>('/api/context/current');
      if (ctx.success && ctx.data.business) {
        const bid = ctx.data.business.id;
        setBusinessId(bid);

        const res = await apiGet<any>(\\\/api/generic-intelligence/metrics?businessId=\\\&domain=workforce\\\);
        if (res.success) {
          setMetrics(res.data);
        }
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
      const res = await apiPost<any>('/api/workforce/predict', { businessId, horizonMonths: 6 });
      if (res.success) {
        setForecast(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsPredicting(false);
    }
  }

  if (status === "loading" || loading) return <div className="p-8 text-slate-400">Loading Workforce Engine...</div>;

  return (
    <div className="min-h-screen bg-slate-950 pb-12">
      <nav className="border-b border-slate-800 bg-slate-900/50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-xl font-bold tracking-tight">
              <span className="text-blue-400">A</span>venik
            </Link>
            <span className="rounded-full bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 text-xs font-medium text-indigo-400 flex items-center gap-2">
              <BrainCircuit className="h-3 w-3" /> Predictive Workforce
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
            <Users className="h-8 w-8 text-indigo-400" />
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Workforce Planning & Forecasting</h1>
              <p className="mt-1 text-slate-400">AI-driven capacity predictions based on revenue velocity and strategic goals.</p>
            </div>
          </div>
          <Button 
            onClick={runForecast}
            disabled={isPredicting}
            className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2"
          >
            {isPredicting ? (
              <span className="flex items-center gap-2"><BrainCircuit className="h-4 w-4 animate-spin" /> Analyzing Growth...</span>
            ) : (
              <span className="flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Generate 6-Month Forecast</span>
            )}
          </Button>
        </div>

        {forecast && (
          <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-indigo-400" /> AI Capacity Forecast (6 Months)
            </h2>
            <Card className="p-6 bg-indigo-950/20 border-indigo-500/20 mb-6">
              <p className="text-indigo-200 text-lg leading-relaxed">{forecast.summary}</p>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <h3 className="font-semibold text-slate-300">Predicted Role Demands</h3>
                {forecast.predictions?.map((p: any, i: number) => (
                  <Card key={i} className="p-5 bg-slate-900 border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Briefcase className="h-4 w-4 text-slate-400" />
                        <h4 className="font-bold text-white text-lg">{p.role}</h4>
                        <span className={\\\	ext-xs px-2 py-0.5 rounded-full font-bold \\\\\\}>
                          {p.urgency} URGENCY
                        </span>
                      </div>
                      <p className="text-sm text-slate-400">{p.reasoning}</p>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-xs text-slate-500 mb-1">FTE Growth</div>
                      <div className="text-2xl font-bold text-white">
                        {p.currentFTE} <span className="text-slate-600">→</span> <span className="text-indigo-400">{p.predictedFTE}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              
              <div>
                <h3 className="font-semibold text-slate-300 mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-400" /> Structural Risk Factors
                </h3>
                <div className="space-y-3">
                  {forecast.riskFactors?.map((risk: string, i: number) => (
                    <Card key={i} className="p-4 bg-slate-900 border-slate-800 border-l-4 border-l-amber-500">
                      <p className="text-sm text-slate-300">{risk}</p>
                    </Card>
                  ))}
                  {(!forecast.riskFactors || forecast.riskFactors.length === 0) && (
                    <p className="text-sm text-slate-500">No significant structural risks detected for the forecast horizon.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {metrics && (
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Current Operational State</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="p-6 bg-slate-900/50 border-slate-800">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Module Health</p>
                <div className="flex items-end gap-3">
                  <h3 className="text-3xl font-bold text-white">{metrics.overview.healthScore}/100</h3>
                </div>
              </Card>

              <Card className="p-6 bg-slate-900/50 border-slate-800">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Active Signals</p>
                <div className="flex items-end gap-3">
                  <h3 className="text-3xl font-bold text-blue-400">{metrics.overview.activeSignals}</h3>
                  <div className="p-1.5 rounded-lg mb-1 bg-blue-500/10 text-blue-400">
                    <Zap className="h-4 w-4" />
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-slate-900/50 border-slate-800">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Pending Actions</p>
                <div className="flex items-end gap-3">
                  <h3 className="text-3xl font-bold text-amber-400">{metrics.overview.pendingActions}</h3>
                  <div className="p-1.5 rounded-lg mb-1 bg-amber-500/10 text-amber-400">
                    <Clock className="h-4 w-4" />
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-slate-900/50 border-slate-800">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Associated Goals</p>
                <div className="flex items-end gap-3">
                  <h3 className="text-3xl font-bold text-purple-400">{metrics.overview.associatedGoals}</h3>
                  <div className="p-1.5 rounded-lg mb-1 bg-purple-500/10 text-purple-400">
                    <Target className="h-4 w-4" />
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
\;

fs.writeFileSync('frontend/src/app/dashboard/workforce/page.tsx', content);
