"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { apiGet, apiPost } from '@/lib/api';
import { TrendingUp, Activity } from 'lucide-react';

export default function ForecastingIntelligencePage() {
  const { status } = useSession();
  const router = useRouter();
  
  const [forecasts, setForecasts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    if (status === "authenticated") {
      fetchForecasts();
    }
  }, [status, router]);

  async function fetchForecasts() {
    try {
      setLoading(true);
      const ctx = await apiGet<any>('/api/context/current');
      if (ctx.success && ctx.data.business) {
        const bid = ctx.data.business.id;
        
        const res = await apiGet<any>('/api/forecasts', { headers: { 'x-business-id': bid } });
        if (res.success) {
          setForecasts(res.data);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function generateForecasts() {
    try {
      setLoading(true);
      const ctx = await apiGet<any>('/api/context/current');
      if (ctx.success && ctx.data.business) {
        const bid = ctx.data.business.id;
        await apiPost<any>('/api/forecasts/generate', {}, { headers: { 'x-business-id': bid } });
        fetchForecasts();
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }

  if (status === "loading" || loading) return <div className="p-8 text-slate-400">Loading Forecasts...</div>;

  return (
    <div className="min-h-screen bg-slate-950">
      <nav className="border-b border-slate-800 bg-slate-900/50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-xl font-bold tracking-tight">
              <span className="text-blue-400">A</span>venik
            </Link>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">
              Forecasting Intelligence
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-white">Forecasting Intelligence</h1>
            <p className="mt-1 text-slate-400">AI-driven predictive models for revenue, cashflow, and growth.</p>
          </div>
          <Button onClick={generateForecasts} className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Run Projection Model
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {forecasts.length === 0 ? (
             <div className="col-span-full p-12 text-center border border-slate-800 rounded-xl bg-slate-900/50 text-slate-400">
               No forecasts generated yet. Run the projection model to calculate future metrics.
             </div>
          ) : (
            forecasts.map(f => (
              <Card key={f.id} className="p-6 border-slate-800 bg-slate-900/50">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-semibold text-white capitalize">{f.metricType.toLowerCase().replace('_', ' ')}</h3>
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-400">Projected Value</p>
                    <p className="text-2xl font-bold text-blue-400">{f.projectedValue}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Target Date</p>
                    <p className="text-white">{new Date(f.targetDate).toLocaleDateString()}</p>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500 border-t border-slate-800 pt-3">
                    <span>Confidence: {f.confidenceScore}%</span>
                    <span>Source: {f.modelSource}</span>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
