"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from '@/components/ui/Card';
import { apiGet } from '@/lib/api';
import { Globe, Users, Activity, Share2, Briefcase } from "lucide-react";

export default function EcosystemPortfolioPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [portfolio, setPortfolio] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    if (status === "authenticated" && session?.user?.id) {
      fetchPortfolio();
    }
  }, [status, router, session]);

  async function fetchPortfolio() {
    try {
      setLoading(true);
      const ctx = await apiGet<any>('/api/context/current');
      if (ctx.success && ctx.data.business) {
        const bid = ctx.data.business.id;
        const res = await apiGet<any>(`/api/ecosystem/portfolio/metrics?businessId=${bid}`);
        if (res.success) {
          setPortfolio(res.data);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading" || loading) return <div className="p-8 text-slate-400">Loading Ecosystem Portfolio...</div>;

  return (
    <div className="min-h-screen bg-slate-950 pb-12">
      <nav className="border-b border-slate-800 bg-slate-900/50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-xl font-bold tracking-tight">
              <span className="text-blue-400">A</span>venik
            </Link>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">
              Ecosystem Opportunity Portfolio
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
          <Globe className="h-8 w-8 text-blue-400" />
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Ecosystem Portfolio Intelligence</h1>
            <p className="mt-1 text-slate-400">Network participation, partnership health, and global connections.</p>
          </div>
        </div>

        {!portfolio ? (
          <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900/50 p-12 text-center">
            <h2 className="text-lg font-medium text-white">System Initializing</h2>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="p-6 bg-slate-900/50 border-slate-800">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Network Health</p>
                <div className="flex items-end gap-3">
                  <h3 className="text-3xl font-bold text-white">{portfolio.overview.averageNetworkHealth}/100</h3>
                  <div className={`p-1.5 rounded-lg mb-1`}>
                    <Activity className="h-4 w-4" />
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-slate-900/50 border-slate-800">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Active Connections</p>
                <div className="flex items-end gap-3">
                  <h3 className="text-3xl font-bold text-blue-400">{portfolio.overview.activeConnections}</h3>
                  <div className="p-1.5 rounded-lg mb-1 bg-blue-500/10 text-blue-400">
                    <Users className="h-4 w-4" />
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-slate-900/50 border-slate-800">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Networks Joined</p>
                <div className="flex items-end gap-3">
                  <h3 className="text-3xl font-bold text-purple-400">{portfolio.overview.totalNetworks}</h3>
                  <div className="p-1.5 rounded-lg mb-1 bg-purple-500/10 text-purple-400">
                    <Share2 className="h-4 w-4" />
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-slate-900/50 border-slate-800">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Network Capacity</p>
                <div className="flex items-end gap-3">
                  <h3 className="text-3xl font-bold text-emerald-400">{portfolio.overview.totalNetworkCapacity}</h3>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-bold text-white mb-4">Ecosystem Relationships</h2>
                {portfolio.portfolio.length === 0 ? (
                  <Card className="p-6 bg-slate-900 border-slate-800 text-center">
                    <p className="text-sm text-slate-400">No active relationships established yet.</p>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {portfolio.portfolio.map((rel: any) => (
                      <Card key={rel.id} className="p-4 bg-slate-900 border-slate-800 flex justify-between items-center">
                        <div className="flex gap-3 items-center">
                          <Briefcase className="w-5 h-5 text-slate-500" />
                          <div>
                            <h4 className="font-semibold text-white">{rel.partnerName}</h4>
                            <p className="text-xs text-slate-400 mt-0.5">{rel.industry} • {rel.type}</p>
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end">
                          <span className={`ext-xs px-2 py-1 rounded-full font-medium`}>
                            {rel.status}
                          </span>
                          {rel.health && (
                            <span className="text-[10px] text-slate-500 mt-1">Health: {Math.round(rel.health)}/100</span>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-xl font-bold text-white mb-4">Global Network Participation</h2>
                {portfolio.networks.length === 0 ? (
                  <Card className="p-6 bg-slate-900 border-slate-800 text-center">
                    <p className="text-sm text-slate-400">Not participating in any global networks.</p>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {portfolio.networks.map((net: any) => (
                      <Card key={net.id} className="p-4 bg-slate-900 border-slate-800">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-slate-200">{net.type.replace(/_/g, ' ')}</h4>
                            <p className="text-sm text-slate-400 mt-1">{net.region}</p>
                          </div>
                          <div className="text-right">
                            <h5 className="text-lg font-bold text-blue-400">{net.nodes}</h5>
                            <p className="text-[10px] uppercase text-slate-500">Active Nodes</p>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-slate-800/50 flex justify-between">
                          <span className={`ext-xs px-2 py-0.5 rounded`}>
                            {net.status}
                          </span>
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
