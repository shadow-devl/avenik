"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { apiGet, apiPost } from '@/lib/api';
import { RefreshCw, Target, Zap, AlertTriangle, BookOpen } from "lucide-react";

export default function EntrepreneurDigitalTwinPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [twin, setTwin] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    if (status === "authenticated" && session?.user?.id) {
      fetchDigitalTwin();
    }
  }, [status, router, session]);

  async function fetchDigitalTwin() {
    try {
      setLoading(true);
      const ctx = await apiGet<any>('/api/context/current');
      if (ctx.success && ctx.data.business) {
        const bid = ctx.data.business.id;
        const uid = session?.user?.id;
        
        let res = await apiGet<any>(`/api/maturity/digital-twin?userId=${uid}&businessId=${bid}`);
        
        if (!res.data) {
          // If no twin exists, sync it
          res = await apiPost<any>('/api/maturity/digital-twin/sync', { userId: uid, businessId: bid });
        }
        
        if (res.success && res.data) {
          setTwin(res.data);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleSync = async () => {
    try {
      setSyncing(true);
      const ctx = await apiGet<any>('/api/context/current');
      if (ctx.success && ctx.data.business) {
        const bid = ctx.data.business.id;
        const uid = session?.user?.id;
        const res = await apiPost<any>('/api/maturity/digital-twin/sync', { userId: uid, businessId: bid });
        if (res.success) {
          setTwin(res.data);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSyncing(false);
    }
  };

  if (status === "loading" || loading) return <div className="p-8 text-slate-400">Loading Digital Twin...</div>;

  return (
    <div className="min-h-screen bg-slate-950">
      <nav className="border-b border-slate-800 bg-slate-900/50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-xl font-bold tracking-tight">
              <span className="text-blue-400">A</span>venik
            </Link>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">
              Entrepreneur Digital Twin
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
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Entrepreneur Digital Twin</h1>
            <p className="mt-2 text-slate-400">A real-time canonical representation of your goals, capabilities, and business context.</p>
          </div>
          <Button onClick={handleSync} disabled={syncing} className="flex items-center gap-2">
            <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
            Sync Twin
          </Button>
        </div>

        {!twin ? (
          <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900/50 p-12 text-center">
            <p className="text-slate-400">No active business profile found. Create one in Settings to activate your Digital Twin.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div className="lg:col-span-2 space-y-8">
              <Card className="p-6 border-slate-800 bg-slate-900/50">
                <h2 className="text-lg font-medium text-white flex items-center gap-2 mb-6">
                  <Target className="h-5 w-5 text-blue-400" /> Current Goals & Priorities
                </h2>
                {twin.goals && twin.goals.length > 0 ? (
                  <div className="space-y-4">
                    {twin.goals.map((goal: any) => (
                      <div key={goal.id} className="p-4 rounded-lg bg-slate-950/50 border border-slate-800/80 flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-slate-200">{goal.title}</h4>
                          <span className={`text-xs px-2 py-1 rounded-full mt-2 inline-block ${goal.priority === 'HIGH' || goal.priority === 'CRITICAL' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'}`}>
                            {goal.priority} PRIORITY
                          </span>
                        </div>
                        <span className="text-sm font-medium text-slate-500">{goal.status}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No active goals mapped to this twin.</p>
                )}
              </Card>

              <Card className="p-6 border-slate-800 bg-slate-900/50">
                <h2 className="text-lg font-medium text-white flex items-center gap-2 mb-6">
                  <AlertTriangle className="h-5 w-5 text-amber-400" /> Capability Gaps
                </h2>
                {twin.capabilityGaps && twin.capabilityGaps.length > 0 ? (
                  <div className="space-y-4">
                    {twin.capabilityGaps.map((gap: any) => (
                      <div key={gap.id} className="p-4 rounded-lg bg-slate-950/50 border border-slate-800/80">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium text-slate-200">{gap.skillName}</h4>
                          <span className="text-xs text-amber-500 bg-amber-500/10 px-2 py-1 rounded">Gap Detected</span>
                        </div>
                        <div className="flex items-center gap-4 mt-3">
                          <div className="flex-1">
                            <div className="flex justify-between text-xs text-slate-400 mb-1">
                              <span>Current: L{gap.currentLevel}</span>
                              <span>Required: L{gap.requiredLevel}</span>
                            </div>
                            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-amber-500 rounded-full" 
                                style={{ width: `${(gap.currentLevel / gap.requiredLevel) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No capability gaps identified at this time.</p>
                )}
              </Card>
            </div>

            <div className="lg:col-span-1 space-y-8">
              <Card className="p-6 border-slate-800 bg-slate-900/50">
                <h2 className="text-lg font-medium text-white flex items-center gap-2 mb-4">
                  <Zap className="h-5 w-5 text-emerald-400" /> Active Work Context
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 rounded bg-slate-950/50 border border-slate-800">
                    <span className="text-sm text-slate-400">Active Goals</span>
                    <span className="text-lg font-semibold text-white">{twin.activeWorkContext?.activeGoals || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded bg-slate-950/50 border border-slate-800">
                    <span className="text-sm text-slate-400">Pending Actions</span>
                    <span className="text-lg font-semibold text-white">{twin.activeWorkContext?.pendingActions || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded bg-slate-950/50 border border-slate-800">
                    <span className="text-sm text-slate-400">AI Recommendations</span>
                    <span className="text-lg font-semibold text-emerald-400">{twin.activeWorkContext?.pendingRecommendations || 0}</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-slate-800 bg-slate-900/50">
                <h2 className="text-lg font-medium text-white flex items-center gap-2 mb-4">
                  <BookOpen className="h-5 w-5 text-purple-400" /> Personalized Guidance
                </h2>
                {twin.personalizedGuidance && twin.personalizedGuidance.length > 0 ? (
                  <div className="space-y-3">
                    {twin.personalizedGuidance.map((guidance: any) => (
                      <div key={guidance.id} className="p-3 rounded border-l-2 border-purple-500 bg-purple-500/5">
                        <h4 className="text-sm font-medium text-white">{guidance.title}</h4>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{guidance.reason || guidance.category}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No personalized guidance generated yet. Check the Command Center to run the AI engine.</p>
                )}
              </Card>

              <div className="text-center">
                <p className="text-xs text-slate-600">Last Synced: {new Date(twin.lastSyncedAt).toLocaleString()}</p>
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
