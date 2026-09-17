"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from '@/components/ui/Card';
import { Activity, CreditCard, BarChart, Link2, Loader2, CheckCircle2 } from "lucide-react";
import { apiGet, apiPost } from "@/lib/api";

export default function IntegrationsSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchIntegrations();
    }
  }, [status, router]);

  async function fetchIntegrations() {
    try {
      // In a real flow, we'd pick the active business ID from a context provider
      // For now, we fetch current context to get businessId
      const ctx = await apiGet<any>('/api/context/current');
      if (ctx.success && ctx.data.business) {
        const bid = ctx.data.business.id;
        const res = await apiGet<any>(/api/integrations?businessId=);
        if (res.success) {
          setIntegrations(res.data);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function toggleIntegration(provider: string, currentState: boolean) {
    try {
      setProcessing(provider);
      const ctx = await apiGet<any>('/api/context/current');
      if (ctx.success && ctx.data.business) {
        const bid = ctx.data.business.id;
        
        // Toggle action
        await apiPost<any>(/api/integrations/toggle?businessId=, {
          provider,
          active: !currentState
        });
        
        await fetchIntegrations(); // refresh
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(null);
    }
  }

  function getStatus(provider: string) {
    const intg = integrations.find(i => i.provider === provider);
    return intg?.status === 'ACTIVE';
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 pb-12">
      <nav className="border-b border-slate-800 bg-slate-900/50">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-xl font-bold tracking-tight text-white hover:text-blue-400 transition-colors">
              <span className="text-blue-400">A</span>venik
            </Link>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">
              Integrations & Data Sources
            </span>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="flex items-center gap-3 mb-8">
          <Link2 className="h-8 w-8 text-blue-400" />
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">External Data Integrations</h1>
            <p className="mt-1 text-slate-400">Connect third-party platforms to feed real-time data into your Avenik Core AI Engine.</p>
          </div>
        </div>

        <div className="space-y-6">
          
          <Card className="p-6 bg-slate-900 border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20">
                <CreditCard className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  Stripe
                  {getStatus('STRIPE') && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </h2>
                <p className="text-sm text-slate-400">Sync payments, subscriptions, and MRR directly to Financial Intelligence.</p>
              </div>
            </div>
            <button 
              onClick={() => toggleIntegration('STRIPE', getStatus('STRIPE'))}
              disabled={processing === 'STRIPE'}
              className={px-4 py-2 rounded-lg font-medium transition-colors }
            >
              {processing === 'STRIPE' ? 'Working...' : (getStatus('STRIPE') ? 'Disconnect' : 'Connect Stripe')}
            </button>
          </Card>

          <Card className="p-6 bg-slate-900 border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
                <BarChart className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  Google Analytics
                  {getStatus('GOOGLE_ANALYTICS') && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </h2>
                <p className="text-sm text-slate-400">Feed live traffic and conversion data into Marketing Intelligence.</p>
              </div>
            </div>
            <button 
              onClick={() => toggleIntegration('GOOGLE_ANALYTICS', getStatus('GOOGLE_ANALYTICS'))}
              disabled={processing === 'GOOGLE_ANALYTICS'}
              className={px-4 py-2 rounded-lg font-medium transition-colors }
            >
              {processing === 'GOOGLE_ANALYTICS' ? 'Working...' : (getStatus('GOOGLE_ANALYTICS') ? 'Disconnect' : 'Connect Analytics')}
            </button>
          </Card>

          <Card className="p-6 bg-slate-900 border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20">
                <Activity className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  Plaid
                  {getStatus('PLAID') && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </h2>
                <p className="text-sm text-slate-400">Connect corporate bank accounts for automated cash runway forecasting.</p>
              </div>
            </div>
            <button 
              onClick={() => toggleIntegration('PLAID', getStatus('PLAID'))}
              disabled={processing === 'PLAID'}
              className={px-4 py-2 rounded-lg font-medium transition-colors }
            >
              {processing === 'PLAID' ? 'Working...' : (getStatus('PLAID') ? 'Disconnect' : 'Connect Plaid')}
            </button>
          </Card>

        </div>
      </main>
    </div>
  );
}
