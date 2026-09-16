"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { apiGet, apiPost } from '@/lib/api';

export default function GrowthPlanningPage() {
  const { status } = useSession();
  const router = useRouter();
  
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("FINANCIAL");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    if (status === "authenticated") {
      fetchGoals();
    }
  }, [status, router]);

  async function fetchGoals() {
    try {
      setLoading(true);
      const res = await apiGet<any>('/api/goals');
      if (res.success) {
        setGoals(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateGoal() {
    try {
      await apiPost('/api/goals', { title, category, type: 'GOAL' });
      setTitle("");
      fetchGoals();
    } catch (err) {
      console.error(err);
      alert("Failed to create goal");
    }
  }

  if (status === "loading" || loading) return <div className="p-8 text-slate-400">Loading Goals...</div>;

  return (
    <div className="min-h-screen bg-slate-950">
      <nav className="border-b border-slate-800 bg-slate-900/50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-xl font-bold tracking-tight">
              <span className="text-blue-400">A</span>venik
            </Link>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">
              Growth Planning
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="text-2xl font-semibold text-white">Growth Planning & Goals</h1>
        <p className="mt-1 text-slate-400">Manage your business goals, objectives, and milestones.</p>

        <div className="mt-8 space-y-6">
          <Card className="p-6 border-slate-800 bg-slate-900/50">
            <h2 className="text-lg font-medium text-white mb-4">Create New Goal</h2>
            <div className="flex gap-4">
              <input 
                type="text" 
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="E.g., Secure Seed Funding" 
                className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none" 
              />
              <select 
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="FINANCIAL">Financial</option>
                <option value="PRODUCT">Product</option>
                <option value="MARKET">Market</option>
                <option value="FUNDING">Funding</option>
              </select>
              <Button onClick={handleCreateGoal} disabled={!title}>Create</Button>
            </div>
          </Card>

          <div className="space-y-4">
            {goals.length === 0 ? (
               <div className="p-8 text-center border border-slate-800 rounded-xl bg-slate-900/50 text-slate-400">
                 No active goals. Create one above to set your trajectory.
               </div>
            ) : (
              goals.map((goal: any) => (
                <Card key={goal.id} className="p-6 border-slate-800 bg-slate-900/50 flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-white">{goal.title}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">{goal.category}</span>
                    </div>
                    <p className="text-sm text-slate-400">Status: {goal.status}</p>
                  </div>
                  <Button variant="outline" size="sm">Update Progress</Button>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
