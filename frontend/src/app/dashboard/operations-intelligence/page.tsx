
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from '@/components/ui/Card';
import { apiGet } from '@/lib/api';
import { Activity, AlertTriangle, CheckCircle, Clock } from "lucide-react";

export default function OperationsIntelligencePage() {
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
        const res = await apiGet<any>(`/api/operations/metrics?businessId=${bid}`);
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

  if (status === "loading" || loading) return <div className="p-8 text-slate-400">Analyzing Operational Health...</div>;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Operations Intelligence</h1>
        <p className="text-slate-400 mt-2">Workflow bottlenecks, capacity planning, and automation risks.</p>
      </div>

      {!metrics ? (
        <Card className="p-12 bg-slate-900 border-slate-800 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
            <Activity className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">System Initializing</h2>
          <p className="text-slate-400 max-w-md mb-6">
            Connecting to your live operational data streams.
          </p>
        </Card>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 bg-slate-900/50 border-slate-800">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">System Health</p>
                  <h3 className="text-3xl font-bold text-white mt-1">{metrics.systemHealth}%</h3>
                </div>
                <div className={`p-2 rounded-lg ${metrics.systemHealth > 80 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                  <Activity className="h-5 w-5" />
                </div>
              </div>
              <p className="text-xs text-slate-500">Overall operational efficiency score</p>
            </Card>

            <Card className="p-6 bg-slate-900/50 border-slate-800">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">Active Risks</p>
                  <h3 className="text-3xl font-bold text-rose-400 mt-1">{metrics.activeRisks.length}</h3>
                </div>
                <div className="p-2 bg-rose-500/10 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-rose-400" />
                </div>
              </div>
              <p className="text-xs text-slate-500">Unmitigated operational hazards</p>
            </Card>

            <Card className="p-6 bg-slate-900/50 border-slate-800">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">Process Bottlenecks</p>
                  <h3 className="text-3xl font-bold text-amber-400 mt-1">{metrics.bottlenecks.length}</h3>
                </div>
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <Clock className="h-5 w-5 text-amber-400" />
                </div>
              </div>
              <p className="text-xs text-slate-500">Tasks exceeding SLA or pending</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Unmitigated Risks</h2>
              {metrics.activeRisks.length === 0 ? (
                <Card className="p-6 bg-slate-900 border-slate-800 text-center">
                  <CheckCircle className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">No active operational risks detected.</p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {metrics.activeRisks.map((risk: any) => (
                    <Card key={risk.id} className="p-4 bg-slate-900 border-slate-800 flex justify-between items-center">
                      <div>
                        <h4 className="font-medium text-white">{risk.area}</h4>
                        <p className="text-xs text-slate-500">Detected: {new Date(risk.date).toLocaleDateString()}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        risk.severity === 'CRITICAL' ? 'bg-red-500/10 text-red-400' :
                        risk.severity === 'HIGH' ? 'bg-rose-500/10 text-rose-400' :
                        'bg-amber-500/10 text-amber-400'
                      }`}>
                        {risk.severity} SEVERITY
                      </span>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-4">Workflow Bottlenecks</h2>
              {metrics.bottlenecks.length === 0 ? (
                <Card className="p-6 bg-slate-900 border-slate-800 text-center">
                  <CheckCircle className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">All workflows are operating smoothly.</p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {metrics.bottlenecks.map((task: any) => (
                    <Card key={task.id} className="p-4 bg-slate-900 border-slate-800 flex justify-between items-center">
                      <h4 className="font-medium text-slate-200">{task.title}</h4>
                      <span className="text-xs px-2 py-1 rounded-full bg-slate-800 text-slate-400">
                        {task.status}
                      </span>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
