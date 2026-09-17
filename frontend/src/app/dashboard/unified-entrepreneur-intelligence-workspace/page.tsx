"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from '@/components/ui/Card';
import { apiGet } from '@/lib/api';
import { LayoutDashboard, ShieldCheck, Activity, Target, Zap, Clock, TrendingUp } from "lucide-react";

export default function UnifiedWorkspacePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    if (status === "authenticated" && session?.user?.id) {
      fetchMetrics();
    }
  }, [status, router, session]);

  async function fetchMetrics() {
    try {
      setLoading(true);
      const ctx = await apiGet<any>('/api/context/current');
      if (ctx.success && ctx.data.business) {
        const bid = ctx.data.business.id;
        const res = await apiGet<any>(`/api/unified-workspace/overview?businessId=${bid}`);
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

  if (status === "loading" || loading) return <div className="p-8 text-slate-400">Loading Master Workspace...</div>;

  return (
    <div className="min-h-screen bg-slate-950 pb-12">
      <nav className="border-b border-slate-800 bg-slate-900/50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-xl font-bold tracking-tight">
              <span className="text-blue-400">A</span>venik
            </Link>
            <span className="rounded-full bg-blue-500/10 border border-blue-500/20 px-3 py-1 text-xs font-medium text-blue-400">
              Master Command Center
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white">
              Back to Modules
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="h-8 w-8 text-white" />
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Unified Intelligence Workspace</h1>
              <p className="mt-1 text-slate-400">Cross-domain executive summary and strategic overview.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <span className="px-4 py-2 rounded bg-slate-900 border border-slate-800 text-sm text-slate-300">
              Last Synced: Just now
            </span>
          </div>
        </div>

        {!metrics ? (
          <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900/50 p-12 text-center">
            <h2 className="text-lg font-medium text-white">System Initializing</h2>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Core KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="p-6 bg-slate-900/80 border-slate-700 hover:border-blue-500/50 transition-colors cursor-pointer" onClick={() => router.push('/dashboard/business-intelligence')}>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Business Health</p>
                <div className="flex items-end justify-between">
                  <h3 className="text-4xl font-bold text-white">{metrics.coreMetrics.overallHealth}<span className="text-lg text-slate-500">/100</span></h3>
                  <Activity className={`h-6 w-6`} />
                </div>
              </Card>

              <Card className="p-6 bg-slate-900/80 border-slate-700 hover:border-indigo-500/50 transition-colors cursor-pointer" onClick={() => router.push('/dashboard/avenik-trusted-intelligence')}>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Network Trust Score</p>
                <div className="flex items-end justify-between">
                  <h3 className="text-4xl font-bold text-indigo-400">{metrics.coreMetrics.trustScore}</h3>
                  <ShieldCheck className="h-6 w-6 text-indigo-400" />
                </div>
              </Card>

              <Card className="p-6 bg-slate-900/80 border-slate-700 hover:border-emerald-500/50 transition-colors cursor-pointer" onClick={() => router.push('/dashboard/financial-intelligence')}>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Financial Runway</p>
                <div className="flex items-end justify-between">
                  <h3 className="text-4xl font-bold text-emerald-400">{metrics.coreMetrics.runwayMonths}<span className="text-lg text-slate-500 ml-1">mo</span></h3>
                  <TrendingUp className="h-6 w-6 text-emerald-400" />
                </div>
              </Card>

              <Card className="p-6 bg-slate-900/80 border-slate-700 hover:border-purple-500/50 transition-colors cursor-pointer" onClick={() => router.push('/dashboard/ecosystem-opportunity-portfolio-intelligence')}>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Active Partners</p>
                <div className="flex items-end justify-between">
                  <h3 className="text-4xl font-bold text-purple-400">{metrics.coreMetrics.activeConnections}</h3>
                  <Target className="h-6 w-6 text-purple-400" />
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Execution Status */}
              <div className="col-span-1 space-y-6">
                <Card className="p-6 bg-slate-900 border-slate-800">
                  <h2 className="text-lg font-bold text-white mb-6">Execution Pipeline</h2>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-400">Active Strategic Goals</span>
                        <span className="text-white font-medium">{metrics.execution.activeGoals}</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full"><div className="bg-blue-500 h-full rounded-full" style={{width: '65%'}}></div></div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-400">Pending Execution Tasks</span>
                        <span className="text-amber-400 font-medium">{metrics.execution.pendingActions}</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full"><div className="bg-amber-500 h-full rounded-full" style={{width: '40%'}}></div></div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-400">Pending AI Decisions</span>
                        <span className="text-purple-400 font-medium">{metrics.execution.pendingDecisions}</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full"><div className="bg-purple-500 h-full rounded-full" style={{width: '25%'}}></div></div>
                    </div>
                  </div>
                  <button 
                    onClick={() => router.push('/dashboard/avenik-decision-intelligence')}
                    className="w-full mt-6 bg-slate-800 hover:bg-slate-700 text-white py-2 rounded text-sm transition-colors"
                  >
                    Review Pending Decisions
                  </button>
                </Card>
              </div>

              {/* Signals & Activity */}
              <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Zap className="h-5 w-5 text-amber-400" />
                    <h2 className="text-lg font-bold text-white">New Intelligence Signals</h2>
                  </div>
                  {metrics.signals.length === 0 ? (
                    <Card className="p-6 bg-slate-900 border-slate-800 text-center">
                      <p className="text-sm text-slate-400">No new signals detected across domains.</p>
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      {metrics.signals.map((sig: any) => (
                        <Card key={sig.id} className="p-4 bg-slate-900 border-slate-800 hover:border-slate-600 transition-colors">
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-[10px] uppercase font-medium text-blue-400">{sig.domain}</span>
                            <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">{Math.round(sig.confidence * 100)}% Conf</span>
                          </div>
                          <h4 className="font-medium text-slate-200 text-sm">{sig.title}</h4>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="h-5 w-5 text-emerald-400" />
                    <h2 className="text-lg font-bold text-white">Recent Completed Actions</h2>
                  </div>
                  {metrics.recentActivity.length === 0 ? (
                    <Card className="p-6 bg-slate-900 border-slate-800 text-center">
                      <p className="text-sm text-slate-400">No recent activity.</p>
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      {metrics.recentActivity.map((act: any) => (
                        <Card key={act.id} className="p-4 bg-slate-900 border-slate-800">
                          <h4 className="font-medium text-slate-200 text-sm truncate">{act.title}</h4>
                          <p className="text-xs text-slate-500 mt-1">Completed: {new Date(act.completedAt).toLocaleDateString()}</p>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
