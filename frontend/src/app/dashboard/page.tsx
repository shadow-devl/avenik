"use client";

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Target, CheckCircle2, TrendingUp, ShieldAlert, Award } from 'lucide-react';

interface ContextData {
  hasBusiness: boolean;
  businessId: string;
  businessName: string;
  healthScore: number;
  trustLevel: string;
  activeGoals: any[];
  pendingTasks: any[];
  nextBestActions: any[];
}

export default function DashboardPage() {
  const [context, setContext] = useState<ContextData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchContext() {
      try {
        // Mocking the auth businessId for the SIH demo
        const res = await fetch('http://localhost:4000/api/context/current');
        const json = await res.json();
        if (json.success) {
          setContext(json.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchContext();
  }, []);

  if (loading) return <div className="p-8 text-slate-400">Loading Context Engine...</div>;

  if (!context?.hasBusiness) {
    return (
      <div className="p-8">
        <Card className="p-6 text-center">
          <h2 className="text-xl font-bold mb-4">Welcome to Avenik</h2>
          <p className="text-slate-400 mb-6">You haven't created a business profile yet.</p>
          <Button>Create Business Profile</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {context.businessName}</h1>
        <p className="text-slate-400">Your Unified Entrepreneur Intelligence Dashboard</p>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border-blue-500/20 bg-blue-500/5 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400 mb-1">Business Health</p>
            <h3 className="text-3xl font-bold text-blue-400">{context.healthScore}<span className="text-lg text-slate-500">/100</span></h3>
          </div>
          <TrendingUp className="h-10 w-10 text-blue-500/50" />
        </Card>

        <Card className="p-6 border-emerald-500/20 bg-emerald-500/5 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400 mb-1">Trust Profile</p>
            <h3 className="text-2xl font-bold text-emerald-400">{context.trustLevel}</h3>
          </div>
          <Award className="h-10 w-10 text-emerald-500/50" />
        </Card>

        <Card className="p-6 border-purple-500/20 bg-purple-500/5 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400 mb-1">Active Goals</p>
            <h3 className="text-3xl font-bold text-purple-400">{context.activeGoals.length}</h3>
          </div>
          <Target className="h-10 w-10 text-purple-500/50" />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Next Best Action (Recommendation Engine) */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-amber-500" />
            Next Best Action
          </h2>
          {context.nextBestActions.length > 0 ? (
            context.nextBestActions.map((action, i) => (
              <Card key={i} className="p-5 border-amber-500/30">
                <h4 className="font-bold text-amber-400">{action.title}</h4>
                <p className="text-sm text-slate-300 mt-2">{action.description}</p>
                <Button className="mt-4" size="sm" variant="outline">Take Action</Button>
              </Card>
            ))
          ) : (
            <Card className="p-6 text-center text-slate-400">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-emerald-500/50" />
              <p>You're all caught up! No urgent actions required.</p>
            </Card>
          )}
        </div>

        {/* Goals & Tasks */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-500" />
            Current Trajectory
          </h2>
          <Card className="p-0 overflow-hidden">
            <div className="divide-y divide-slate-800">
              {context.activeGoals.map((goal, i) => (
                <div key={i} className="p-5 hover:bg-slate-800/50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-white">{goal.title}</h4>
                    <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded-full">{goal.category}</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 mt-4">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
