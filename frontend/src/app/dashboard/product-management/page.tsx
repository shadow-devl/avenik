"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { apiGet, apiPost } from '@/lib/api';
import { Activity, Target, Zap, Clock, Lightbulb, Beaker, SearchCheck, BrainCircuit, Box } from "lucide-react";

export default function ProductManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [metrics, setMetrics] = useState<any>(null);
  const [innovation, setInnovation] = useState<any>(null);
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
        const res = await apiGet<any>(`/api/generic-intelligence/metrics?businessId=${bid}&domain=product-management`);
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

  async function runInnovationEngine() {
    if (!businessId) return;
    setIsProcessing(true);
    try {
      const res = await apiPost<any>('/api/product-management/innovation', { businessId });
      if (res.success) {
        setInnovation(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  }

  const getImpactColor = (level: string) => {
    switch(level) {
      case 'HIGH': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'MEDIUM': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  if (status === "loading" || loading) return <div className="p-8 text-slate-400">Loading Product Intelligence...</div>;

  return (
    <div className="min-h-screen bg-slate-950 pb-12">
      <nav className="border-b border-slate-800 bg-slate-900/50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-xl font-bold tracking-tight">
              <span className="text-blue-400">A</span>venik
            </Link>
            <span className="rounded-full bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 text-xs font-medium text-cyan-400 flex items-center gap-2">
              <Lightbulb className="h-3 w-3" /> Product Innovation
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
            <Box className="h-8 w-8 text-cyan-400" />
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Product Innovation Engine</h1>
              <p className="mt-1 text-slate-400">AI-driven market gap analysis and product pipeline validation.</p>
            </div>
          </div>
          
          <Button 
            onClick={runInnovationEngine}
            disabled={isProcessing}
            className="bg-cyan-600 hover:bg-cyan-700 text-white flex items-center gap-2"
          >
            {isProcessing ? (
              <span className="flex items-center gap-2"><BrainCircuit className="h-4 w-4 animate-spin" /> Synthesizing Pipeline...</span>
            ) : (
              <span className="flex items-center gap-2"><Beaker className="h-4 w-4" /> Run Innovation Scan</span>
            )}
          </Button>
        </div>

        {innovation && (
          <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-cyan-400" /> Innovation Strategy
            </h2>
            <Card className="p-6 bg-cyan-950/20 border-cyan-500/20 mb-6 flex flex-col md:flex-row gap-6 items-center">
              <div className="flex-shrink-0 relative w-32 h-32 flex items-center justify-center rounded-full border-4 border-slate-800 bg-slate-950">
                <div className={`absolute inset-0 rounded-full border-4 border-t-transparent ${
                  innovation.pipelineHealthScore > 80 ? 'border-emerald-500' :
                  innovation.pipelineHealthScore > 50 ? 'border-amber-500' :
                  'border-rose-500'
                } opacity-50`} />
                <div className="text-center">
                  <div className="text-3xl font-black text-white">{innovation.pipelineHealthScore}</div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Health</div>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-slate-300 leading-relaxed text-lg">{innovation.summary}</p>
              </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-slate-300 mb-4 flex items-center gap-2">
                  <SearchCheck className="h-4 w-4 text-amber-400" /> Identified Market Gaps
                </h3>
                {innovation.marketGaps?.length === 0 ? (
                  <Card className="p-6 bg-slate-900 border-slate-800 text-center">
                    <p className="text-sm text-slate-400">No immediate market gaps identified.</p>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {innovation.marketGaps?.map((gap: any, i: number) => (
                      <Card key={i} className="p-5 bg-slate-900 border-slate-800">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-white">{gap.gapName}</h4>
                          <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase border ${getImpactColor(gap.potentialImpact)}`}>
                            {gap.potentialImpact} Impact
                          </span>
                        </div>
                        <p className="text-sm text-slate-400">{gap.description}</p>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="font-semibold text-slate-300 mb-4 flex items-center gap-2">
                  <Beaker className="h-4 w-4 text-cyan-400" /> Recommended Product Pipelines
                </h3>
                <div className="space-y-4">
                  {innovation.recommendedPipelines?.map((pipe: any, i: number) => (
                    <Card key={i} className="p-5 bg-slate-900 border-slate-800 border-l-4 border-l-cyan-500">
                      <h4 className="font-semibold text-white mb-1">{pipe.productConcept}</h4>
                      <p className="text-sm text-slate-400 mb-3">{pipe.rationale}</p>
                      <div className="bg-slate-950 p-3 rounded text-sm text-slate-300 border border-slate-800">
                        <span className="text-cyan-400 font-semibold block mb-1">Validation Step:</span>
                        {pipe.validationStep}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {metrics && !isProcessing && (
          <div className={innovation ? "opacity-50 mt-16 pt-8 border-t border-slate-800" : ""}>
            <h2 className="text-xl font-bold text-white mb-4">Base Operations Telemetry</h2>
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
