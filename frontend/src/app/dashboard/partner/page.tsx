"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { apiGet, apiPost } from '@/lib/api';
import { Activity, Target, Zap, Clock, Network, Users, Handshake, BrainCircuit, Search } from "lucide-react";

export default function PartnerIntelligencePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [metrics, setMetrics] = useState<any>(null);
  const [matches, setMatches] = useState<any>(null);
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
        const res = await apiGet<any>(`/api/generic-intelligence/metrics?businessId=${bid}&domain=partner`);
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

  async function runMatchmaking() {
    if (!businessId) return;
    setIsProcessing(true);
    try {
      const res = await apiPost<any>('/api/partner/match', { businessId });
      if (res.success) {
        setMatches(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  }

  const getImpactColor = (level: string) => {
    switch(level) {
      case 'HIGH': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'MEDIUM': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  if (status === "loading" || loading) return <div className="p-8 text-slate-400">Loading Ecosystem Intelligence...</div>;

  return (
    <div className="min-h-screen bg-slate-950 pb-12">
      <nav className="border-b border-slate-800 bg-slate-900/50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-xl font-bold tracking-tight">
              <span className="text-blue-400">A</span>venik
            </Link>
            <span className="rounded-full bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 text-xs font-medium text-indigo-400 flex items-center gap-2">
              <Handshake className="h-3 w-3" /> Ecosystem & Partners
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
            <Network className="h-8 w-8 text-indigo-400" />
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Partner Intelligence</h1>
              <p className="mt-1 text-slate-400">AI-driven B2B matchmaking to fill operational capabilities and gaps.</p>
            </div>
          </div>
          
          <Button 
            onClick={runMatchmaking}
            disabled={isProcessing}
            className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
          >
            {isProcessing ? (
              <span className="flex items-center gap-2"><BrainCircuit className="h-4 w-4 animate-spin" /> Analyzing Ecosystem...</span>
            ) : (
              <span className="flex items-center gap-2"><Search className="h-4 w-4" /> Find Strategic Partners</span>
            )}
          </Button>
        </div>

        {matches && (
          <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-indigo-400" /> Ecosystem Strategy
            </h2>
            <Card className="p-6 bg-indigo-950/20 border-indigo-500/20 mb-6 flex flex-col md:flex-row gap-6 items-center">
              <div className="flex-shrink-0 relative w-32 h-32 flex items-center justify-center rounded-full border-4 border-slate-800 bg-slate-950">
                <div className={`absolute inset-0 rounded-full border-4 border-t-transparent ${
                  matches.ecosystemReadinessScore > 75 ? 'border-indigo-500' :
                  matches.ecosystemReadinessScore > 40 ? 'border-amber-500' :
                  'border-rose-500'
                } opacity-50`} />
                <div className="text-center">
                  <div className="text-3xl font-black text-white">{matches.ecosystemReadinessScore}</div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Readiness</div>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-slate-300 leading-relaxed text-lg">{matches.summary}</p>
              </div>
            </Card>

            <div>
              <h3 className="font-semibold text-slate-300 mb-4 flex items-center gap-2">
                <Handshake className="h-4 w-4 text-emerald-400" /> Recommended B2B Partner Categories
              </h3>
              {matches.recommendedPartners?.length === 0 ? (
                <Card className="p-6 bg-slate-900 border-slate-800 text-center">
                  <p className="text-sm text-slate-400">No immediate partnership needs identified.</p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {matches.recommendedPartners?.map((partner: any, i: number) => (
                    <Card key={i} className="p-6 bg-slate-900 border-slate-800 hover:border-indigo-500/50 transition-colors cursor-pointer group">
                      <div className="flex items-start justify-between mb-4">
                        <div className="bg-indigo-500/10 p-3 rounded-lg group-hover:bg-indigo-500/20 transition-colors">
                          <Users className="h-6 w-6 text-indigo-400" />
                        </div>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase border ${getImpactColor(partner.expectedValue)}`}>
                          {partner.expectedValue} Value
                        </span>
                      </div>
                      <h4 className="font-bold text-white text-lg mb-2">{partner.partnerType}</h4>
                      <p className="text-sm text-slate-400 mb-4 h-10 line-clamp-2">{partner.gapAddressed}</p>
                      <div className="bg-slate-950 p-3 rounded text-xs text-slate-300 border border-slate-800">
                        <span className="text-indigo-400 font-semibold block mb-1 uppercase tracking-wider text-[10px]">Search Criteria:</span>
                        {partner.searchCriteria}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {metrics && !isProcessing && (
          <div className={matches ? "opacity-50 mt-16 pt-8 border-t border-slate-800" : ""}>
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
