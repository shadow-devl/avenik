"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Target, CheckCircle2, TrendingUp, ShieldAlert, Award } from 'lucide-react';
import { apiGet, apiPost } from '@/lib/api';
import Link from 'next/link';

interface UnifiedContext {
  user: { id: string; email: string; status: string; };
  activeRole: string | null;
  organization: { id: string; name: string; role: string; } | null;
  business: { id: string; displayName: string; status: string; } | null;
  journey: string;
  privacy: { dataSharingScope: string; };
  permissions: string[];
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [context, setContext] = useState<UnifiedContext | null>(null);
  const [healthScore, setHealthScore] = useState<number>(0);
  const [goals, setGoals] = useState<any[]>([]);
  const [nbas, setNbas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      async function fetchDashboardData() {
        try {
          const res = await apiGet<ApiResponse<UnifiedContext>>('/api/context/current');
          if (res.success) {
            setContext(res.data);
            
            if (res.data.business) {
              const [healthRes, goalsRes, nbaRes] = await Promise.all([
                apiPost<any>('/api/health-engine/calculate', { businessId: res.data.business.id }),
                apiGet<any>('/api/goals'),
                apiPost<any>('/api/nba/generate', { businessId: res.data.business.id })
              ]);
              
              if (healthRes.success) setHealthScore(healthRes.data.score);
              if (goalsRes.success) setGoals(goalsRes.data);
              if (nbaRes.success) setNbas(nbaRes.data);
            }
          } else {
            setError(res.message || "Failed to load context");
          }
        } catch (err: any) {
          console.error(err);
          if (err.status === 401 || err.status === 403) {
            setError("You do not have permission to view this dashboard.");
          } else {
            setError("Unable to connect to Avenik services.");
          }
        } finally {
          setLoading(false);
        }
      }
      fetchDashboardData();
    }
  }, [status, router]);

  if (status === "loading" || loading) return <div className="p-8 text-slate-400">Loading Context Engine...</div>;

  if (error) {
    return (
      <div className="p-8">
        <Card className="p-6 text-center border-red-500/20 bg-red-500/5">
          <ShieldAlert className="h-12 w-12 mx-auto mb-3 text-red-500/50" />
          <h2 className="text-xl font-bold mb-2 text-red-400">Access Error</h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">Retry</Button>
        </Card>
      </div>
    );
  }

  if (!context?.business) {
    return (
      <div className="p-8">
        <Card className="p-6 text-center">
          <h2 className="text-xl font-bold mb-4">Welcome to Avenik</h2>
          <p className="text-slate-400 mb-6">You haven't created a business profile yet.</p>
          <Button onClick={() => router.push("/dashboard/settings")}>Create Business Profile</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {context.business.displayName}</h1>
        <p className="text-slate-400">Your Unified Entrepreneur Intelligence Dashboard</p>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border-blue-500/20 bg-blue-500/5 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400 mb-1">Business Health <span className="text-[10px] bg-blue-900/50 text-blue-300 px-1 py-0.5 rounded ml-1">CALCULATED</span></p>
            <h3 className="text-3xl font-bold text-blue-400">{healthScore}<span className="text-lg text-slate-500">/100</span></h3>
          </div>
          <TrendingUp className="h-10 w-10 text-blue-500/50" />
        </Card>

        <Card className="p-6 border-emerald-500/20 bg-emerald-500/5 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400 mb-1">Trust Profile <span className="text-[10px] bg-slate-800 px-1 py-0.5 rounded ml-1">STATUS</span></p>
            <h3 className="text-xl font-bold text-slate-300">{context.business.status === 'ACTIVE' ? 'BASIC VERIFIED' : 'UNVERIFIED'}</h3>
            <p className="text-[10px] text-slate-500 mt-1">Platform level only. No Gov KYC.</p>
          </div>
          <Award className="h-10 w-10 text-emerald-500/50" />
        </Card>

        <Card className="p-6 border-purple-500/20 bg-purple-500/5 flex items-center justify-between cursor-pointer hover:bg-purple-500/10 transition-colors" onClick={() => router.push('/dashboard/growth-planning')}>
          <div>
            <p className="text-sm text-slate-400 mb-1">Active Goals</p>
            <h3 className="text-3xl font-bold text-purple-400">{goals.length}</h3>
          </div>
          <Target className="h-10 w-10 text-purple-500/50" />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-amber-500" />
            Next Best Action <span className="text-[10px] bg-amber-900/50 text-amber-300 px-1.5 py-0.5 rounded ml-1 uppercase font-normal">Calculated</span>
          </h2>
          {nbas.length > 0 ? (
            nbas.map((action, i) => (
              <Card key={i} className="p-5 border-amber-500/30">
                <h4 className="font-bold text-amber-400">{action.title}</h4>
                <p className="text-sm text-slate-300 mt-2">{action.description}</p>
                <div className="mt-4 flex gap-2">
                  <span className="text-xs px-2 py-1 bg-slate-800 rounded-md text-slate-400">Source: {action.sourceAiModel}</span>
                  <span className="text-xs px-2 py-1 bg-slate-800 rounded-md text-slate-400">Confidence: {action.confidenceScore * 100}%</span>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-6 text-center text-slate-400">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-emerald-500/50" />
              <p>You're all caught up! No urgent actions required.</p>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              Current Trajectory
            </h2>
            <Link href="/dashboard/growth-planning" className="text-sm text-blue-400 hover:text-blue-300">
              Manage Goals
            </Link>
          </div>
          <Card className="p-0 overflow-hidden">
            <div className="divide-y divide-slate-800">
              {goals.length > 0 ? goals.map((goal, i) => (
                <div key={i} className="p-5 hover:bg-slate-800/50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-white">{goal.title}</h4>
                    <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded-full">{goal.category}</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 mt-4">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: goal.status === 'COMPLETED' ? '100%' : '30%' }}></div>
                  </div>
                </div>
              )) : (
                <div className="p-5 text-center text-slate-400">
                  <p>No active goals found.</p>
                  <Button onClick={() => router.push('/dashboard/growth-planning')} className="mt-4" size="sm" variant="outline">Set a Goal</Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
