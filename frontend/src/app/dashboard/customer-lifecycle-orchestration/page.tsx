"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { apiGet, apiPost } from '@/lib/api';
import { Activity, Target, Zap, Clock, ShieldCheck, Repeat, UserCheck, HeartHandshake, BrainCircuit, Users } from "lucide-react";

export default function CustomerLifecycleOrchestrationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [metrics, setMetrics] = useState<any>(null);
  const [orchestration, setOrchestration] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [businessId, setBusinessId] = useState<string | null>(null);

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
        setBusinessId(bid);
        const res = await apiGet<any>(`/api/generic-intelligence/metrics?businessId=${bid}&domain=customer-lifecycle-orchestration`);
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

  async function runOrchestration() {
    if (!businessId) return;
    setIsProcessing(true);
    try {
      const res = await apiPost<any>('/api/customer-lifecycle-orchestration/orchestrate', { businessId });
      if (res.success) {
        setOrchestration(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  }

  const getRiskColor = (level: string) => {
    switch(level) {
      case 'HIGH': return 'text-rose-400 bg-rose-500/10';
      case 'MEDIUM': return 'text-amber-400 bg-amber-500/10';
      default: return 'text-emerald-400 bg-emerald-500/10';
    }
  };
  
  const getTrajectoryIcon = (traj: string) => {
    switch(traj) {
      case 'INCREASING': return <Activity className="h-4 w-4 text-emerald-400" />;
      case 'DECREASING': return <Activity className="h-4 w-4 text-rose-400" />;
      default: return <Activity className="h-4 w-4 text-slate-400" />;
    }
  };

  if (status === "loading" || loading) return <div className="p-8 text-slate-400">Loading Orchestration Engine...</div>;

  return (
    <div className="min-h-screen bg-slate-950 pb-12">
      <nav className="border-b border-slate-800 bg-slate-900/50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-xl font-bold tracking-tight">
              <span className="text-blue-400">A</span>venik
            </Link>
            <span className="rounded-full bg-purple-500/10 border border-purple-500/20 px-3 py-1 text-xs font-medium text-purple-400 flex items-center gap-2">
              <BrainCircuit className="h-3 w-3" /> Predictive Lifecycle
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
            <Repeat className="h-8 w-8 text-purple-400" />
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Customer Lifecycle Orchestration</h1>
              <p className="mt-1 text-slate-400">AI churn prediction and automated engagement tracking.</p>
            </div>
          </div>
          
          <Button 
            onClick={runOrchestration}
            disabled={isProcessing}
            className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
          >
            {isProcessing ? (
              <span className="flex items-center gap-2"><BrainCircuit className="h-4 w-4 animate-spin" /> Analyzing Segments...</span>
            ) : (
              <span className="flex items-center gap-2"><HeartHandshake className="h-4 w-4" /> Orchestrate Lifecycle Tracks</span>
            )}
          </Button>
        </div>

        {orchestration && (
          <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-purple-400" /> Engagement Strategy
            </h2>
            <Card className="p-6 bg-purple-950/20 border-purple-500/20 mb-6 flex flex-col md:flex-row gap-6 items-center">
              <div className="flex-shrink-0 relative w-32 h-32 flex items-center justify-center rounded-full border-4 border-slate-800 bg-slate-950">
                <div className={`absolute inset-0 rounded-full border-4 border-t-transparent ${
                  orchestration.overallChurnRisk > 75 ? 'border-rose-500' :
                  orchestration.overallChurnRisk > 40 ? 'border-amber-500' :
                  'border-emerald-500'
                } opacity-50`} />
                <div className="text-center">
                  <div className="text-3xl font-black text-white">{orchestration.overallChurnRisk}%</div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Churn Risk</div>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-slate-300 leading-relaxed text-lg">{orchestration.summary}</p>
              </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-slate-300 mb-4 flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-400" /> Segment Intelligence
                </h3>
                {orchestration.segments?.length === 0 ? (
                  <Card className="p-6 bg-slate-900 border-slate-800 text-center">
                    <p className="text-sm text-slate-400">No segments identified to orchestrate.</p>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {orchestration.segments?.map((seg: any, i: number) => (
                      <Card key={i} className="p-5 bg-slate-900 border-slate-800">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-bold text-white text-lg">{seg.name}</h4>
                          <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${getRiskColor(seg.predictedChurnRisk)}`}>
                            {seg.predictedChurnRisk} Risk
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
                          <span>LTV Trajectory:</span>
                          <span className="flex items-center gap-1 font-semibold text-slate-300">
                            {getTrajectoryIcon(seg.lifetimeValueTrajectory)} {seg.lifetimeValueTrajectory}
                          </span>
                        </div>
                        <div className="bg-slate-950 p-3 rounded text-sm text-slate-300 border border-slate-800">
                          <span className="text-purple-400 font-semibold block mb-1">Recommended Action:</span>
                          {seg.recommendedAction}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="font-semibold text-slate-300 mb-4 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-400" /> Automated Engagement Tracks
                </h3>
                <div className="space-y-4">
                  {orchestration.automatedTracks?.map((track: any, i: number) => (
                    <Card key={i} className="p-5 bg-slate-900 border-slate-800 border-l-4 border-l-purple-500">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-white">{track.trackName}</h4>
                        <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                          {track.expectedConversionLift} Lift
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-3">
                        <div>
                          <div className="text-[10px] uppercase text-slate-500 font-bold mb-1">Target Audience</div>
                          <div className="text-sm text-slate-300">{track.targetAudience}</div>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase text-slate-500 font-bold mb-1">Trigger Event</div>
                          <div className="text-sm text-slate-300">{track.triggerEvent}</div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {metrics && !isProcessing && (
          <div className={orchestration ? "opacity-50 mt-16 pt-8 border-t border-slate-800" : ""}>
            <h2 className="text-xl font-bold text-white mb-4">Historical Pipeline Health</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
}
