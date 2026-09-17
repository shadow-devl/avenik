"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { apiGet, apiPost } from '@/lib/api';
import { Network, Handshake, Users, ArrowRight } from "lucide-react";

export default function EcosystemOpportunityOrchestrationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    if (status === "authenticated" && session?.user?.id) {
      fetchMatches();
    }
  }, [status, router, session]);

  async function fetchMatches() {
    try {
      setLoading(true);
      const ctx = await apiGet<any>('/api/context/current');
      if (ctx.success && ctx.data.business) {
        const bid = ctx.data.business.id;
        const res = await apiGet<any>(`/api/ecosystem/discover?businessId=${bid}`);
        if (res.success && res.data) {
          setMatches(res.data);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleRequestConnection = async (targetBusinessId: string) => {
    try {
      setRequesting(targetBusinessId);
      const ctx = await apiGet<any>('/api/context/current');
      if (ctx.success && ctx.data.business) {
        const bid = ctx.data.business.id;
        await apiPost<any>('/api/ecosystem/request', {
          sourceBusinessId: bid,
          targetBusinessId,
          message: "Hi, our AI engine identified a high-synergy match between our businesses. I'd love to explore a partnership."
        });
        alert("Connection request sent successfully!");
        fetchMatches(); // refresh
      }
    } catch (e) {
      console.error(e);
      alert("Failed to send request.");
    } finally {
      setRequesting(null);
    }
  };

  if (status === "loading" || loading) return <div className="p-8 text-slate-400">Discovering Ecosystem Synergies...</div>;

  return (
    <div className="min-h-screen bg-slate-950">
      <nav className="border-b border-slate-800 bg-slate-900/50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-xl font-bold tracking-tight">
              <span className="text-blue-400">A</span>venik
            </Link>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">
              Ecosystem Orchestration
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
        <div className="flex items-center gap-3 mb-2">
          <Network className="h-8 w-8 text-blue-400" />
          <h1 className="text-3xl font-bold text-white tracking-tight">B2B Ecosystem Synergies</h1>
        </div>
        <p className="text-slate-400 mb-8">Discover and orchestrate high-value partnerships based on mutual capability gaps and strategic goals.</p>

        {matches.length === 0 ? (
          <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900/50 p-12 text-center">
            <Users className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <h2 className="text-lg font-medium text-white">No Synergies Found Yet</h2>
            <p className="mt-2 text-sm text-slate-400">Your profile is currently being indexed against the global business graph. Check back later for strategic partnership matches.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {matches.map((match: any, idx: number) => (
              <Card key={idx} className="p-6 border-slate-800 bg-slate-900/50 hover:border-slate-700 transition-all flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">{match.targetBusinessName}</h3>
                    <p className="text-sm text-slate-400 flex items-center gap-1 mt-1">
                      <span className="text-blue-400 font-medium">B2B Match</span>
                    </p>
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                    <span className="text-sm font-semibold text-emerald-400">{Math.round(match.synergyScore * 100)}% Synergy</span>
                  </div>
                </div>

                <div className="flex-1 space-y-4 mb-6">
                  <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-lg">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Mutual Value Proposition</h4>
                    <p className="text-sm text-slate-300">
                      {match.matchingReason || "High alignment based on complimentary supply chain capabilities and shared market expansion goals."}
                    </p>
                  </div>
                  
                  {match.capabilityMatches && match.capabilityMatches.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Bridged Gaps</h4>
                      <div className="flex flex-wrap gap-2">
                        {match.capabilityMatches.map((cap: string, i: number) => (
                          <span key={i} className="px-2 py-1 bg-blue-500/5 border border-blue-500/20 text-blue-300 text-xs rounded">
                            {cap}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-800 mt-auto">
                  <Button 
                    onClick={() => handleRequestConnection(match.targetBusinessId)}
                    disabled={requesting === match.targetBusinessId}
                    className="w-full flex justify-center items-center gap-2"
                  >
                    {requesting === match.targetBusinessId ? (
                      "Sending Request..."
                    ) : (
                      <>
                        <Handshake className="h-4 w-4" /> Request Warm Intro
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
