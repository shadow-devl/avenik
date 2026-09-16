"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { apiGet } from '@/lib/api';

export default function UnifiedEntrepreneurIntelligenceWorkspacePage() {
  const { status } = useSession();
  const router = useRouter();
  
  const [timeline, setTimeline] = useState<any[]>([]);
  const [memory, setMemory] = useState<any[]>([]);
  const [graph, setGraph] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    if (status === "authenticated") {
      fetchWorkspaceData();
    }
  }, [status, router]);

  async function fetchWorkspaceData() {
    try {
      setLoading(true);
      const ctx = await apiGet<any>('/api/context/current');
      if (ctx.success && ctx.data.business) {
        const bid = ctx.data.business.id;
        
        const [timeRes, memRes, graphRes] = await Promise.all([
          apiGet<any>('/api/timeline', { headers: { 'x-business-id': bid } }),
          apiGet<any>('/api/memory', { headers: { 'x-business-id': bid } }),
          apiGet<any>('/api/graph', { headers: { 'x-business-id': bid } })
        ]);
        
        if (timeRes.success) setTimeline(timeRes.data);
        if (memRes.success) setMemory(memRes.data);
        if (graphRes.success) setGraph(graphRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading" || loading) return <div className="p-8 text-slate-400">Loading Unified Workspace...</div>;

  return (
    <div className="min-h-screen bg-slate-950">
      <nav className="border-b border-slate-800 bg-slate-900/50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-xl font-bold tracking-tight">
              <span className="text-blue-400">A</span>venik
            </Link>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">
              Intelligence Workspace
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
        <h1 className="text-2xl font-semibold text-white">Unified Intelligence Workspace</h1>
        <p className="mt-1 text-slate-400">Your single source of truth for business events, relationships, and organizational memory.</p>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Business Timeline</h2>
            <Card className="p-0 overflow-hidden border-slate-800 bg-slate-900/50">
              {timeline.length === 0 ? (
                <div className="p-6 text-center text-slate-400">No timeline events found.</div>
              ) : (
                <div className="divide-y divide-slate-800">
                  {timeline.map(t => (
                    <div key={t.id} className="p-5">
                      <div className="flex justify-between items-start">
                        <h4 className="font-semibold text-white">{t.eventType}</h4>
                        <span className="text-xs text-slate-500">{new Date(t.eventDate).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-slate-400 mt-2">{t.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Organizational Memory</h2>
            <Card className="p-0 overflow-hidden border-slate-800 bg-slate-900/50">
              {memory.length === 0 ? (
                <div className="p-6 text-center text-slate-400">No memory fragments found.</div>
              ) : (
                <div className="divide-y divide-slate-800">
                  {memory.map(m => (
                    <div key={m.id} className="p-5">
                      <h4 className="font-semibold text-blue-400">{m.domain}</h4>
                      <p className="text-sm text-slate-300 mt-2">{m.fact}</p>
                      <div className="mt-3 text-xs text-slate-500">Source: {m.source} | Confidence: {m.confidence}</div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Business Graph</h2>
            <Card className="p-0 overflow-hidden border-slate-800 bg-slate-900/50">
              {graph.length === 0 ? (
                <div className="p-6 text-center text-slate-400">No ecosystem connections mapped.</div>
              ) : (
                <div className="divide-y divide-slate-800">
                  {graph.map(g => (
                    <div key={g.id} className="p-5">
                      <h4 className="font-semibold text-emerald-400">{g.relationType}</h4>
                      <p className="text-sm text-slate-400 mt-1">Connected Node: {g.targetNodeId}</p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

        </div>
      </main>
    </div>
  );
}
