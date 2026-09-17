"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from '@/components/ui/Card';
import { apiGet } from '@/lib/api';
import { Landmark, FileCheck, CircleDollarSign, AlertCircle, Clock } from "lucide-react";

export default function AdvancedSupportExecutionPage() {
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
        const res = await apiGet<any>(`/api/advanced-government-support/metrics?businessId=${bid}`);
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

  if (status === "loading" || loading) return <div className="p-8 text-slate-400">Loading Support Execution...</div>;

  return (
    <div className="min-h-screen bg-slate-950 pb-12">
      <nav className="border-b border-slate-800 bg-slate-900/50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-xl font-bold tracking-tight">
              <span className="text-blue-400">A</span>venik
            </Link>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">
              Government Support Execution
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
        <div className="flex items-center gap-3 mb-8">
          <Landmark className="h-8 w-8 text-emerald-400" />
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Advanced Support Execution</h1>
            <p className="mt-1 text-slate-400">Track applications, milestones, and evidence gathering.</p>
          </div>
        </div>

        {!metrics ? (
          <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900/50 p-12 text-center">
            <h2 className="text-lg font-medium text-white">System Initializing</h2>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="p-6 bg-slate-900/50 border-slate-800">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Active Applications</p>
                <div className="flex items-end gap-3">
                  <h3 className="text-3xl font-bold text-white">{metrics.overview.activeApplications}</h3>
                  <div className="p-1.5 rounded-lg mb-1 bg-blue-500/10 text-blue-400">
                    <FileCheck className="h-4 w-4" />
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-slate-900/50 border-slate-800">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Potential Value</p>
                <div className="flex items-end gap-3">
                  <h3 className="text-2xl font-bold text-emerald-400">
                    
                  </h3>
                  <div className="p-1.5 rounded-lg mb-1 bg-emerald-500/10 text-emerald-400">
                    <CircleDollarSign className="h-4 w-4" />
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-slate-900/50 border-slate-800">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Pending Tasks</p>
                <div className="flex items-end gap-3">
                  <h3 className="text-3xl font-bold text-amber-400">{metrics.overview.pendingActions}</h3>
                  <div className="p-1.5 rounded-lg mb-1 bg-amber-500/10 text-amber-400">
                    <Clock className="h-4 w-4" />
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-slate-900/50 border-slate-800">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Overdue Evidences</p>
                <div className="flex items-end gap-3">
                  <h3 className="text-3xl font-bold text-rose-400">{metrics.overview.overdueActions}</h3>
                  <div className="p-1.5 rounded-lg mb-1 bg-rose-500/10 text-rose-400">
                    <AlertCircle className="h-4 w-4" />
                  </div>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-bold text-white mb-4">Application Pipeline</h2>
                {metrics.pipeline.length === 0 ? (
                  <Card className="p-6 bg-slate-900 border-slate-800 text-center">
                    <p className="text-sm text-slate-400">No active support applications.</p>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {metrics.pipeline.map((opp: any) => (
                      <Card key={opp.id} className="p-4 bg-slate-900 border-slate-800 flex justify-between items-center">
                        <div>
                          <h4 className="font-semibold text-white">{opp.title}</h4>
                          <span className={`ext-[10px] uppercase mt-1 inline-block px-2 py-0.5 rounded-full`}>
                            {opp.status}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-emerald-400"></p>
                          <p className="text-xs text-slate-500">Likelihood: {Math.round((opp.likelihood || 0) * 100)}%</p>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-xl font-bold text-white mb-4">Execution & Evidence Tasks</h2>
                {metrics.executionTasks.length === 0 ? (
                  <Card className="p-6 bg-slate-900 border-slate-800 text-center">
                    <p className="text-sm text-slate-400">All compliance and execution tasks completed.</p>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {metrics.executionTasks.map((task: any) => (
                      <Card key={task.id} className={`p-4 bg-slate-900 border`}>
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            {task.overdue && <AlertCircle className="w-4 h-4 text-rose-400" />}
                            <h4 className="font-medium text-slate-200">{task.title}</h4>
                          </div>
                          <span className={`ext-[10px] uppercase px-2 py-0.5 rounded`}>
                            {task.priority}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400">Status: {task.status}</span>
                          {task.dueDate && (
                            <span className={task.overdue ? 'text-rose-400 font-medium' : 'text-slate-500'}>
                              Due: {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
