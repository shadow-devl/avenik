"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from '@/components/ui/Card';
import { apiGet, apiPut } from '@/lib/api';
import { UserCircle, Briefcase, Save, ShieldCheck } from "lucide-react";

export default function ProfileSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [profile, setProfile] = useState<any>({
    firstName: "",
    lastName: "",
    bio: "",
    primaryRole: "",
    secondaryRole: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const availableRoles = [
    "Entrepreneur",
    "Investor",
    "Consultant",
    "Government Agent",
    "Legal Advisor",
    "Analyst"
  ];

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    if (status === "authenticated") {
      fetchProfile();
    }
  }, [status, router]);

  async function fetchProfile() {
    try {
      setLoading(true);
      const res = await apiGet<any>('/api/profile');
      if (res.success && res.data) {
        setProfile({
          firstName: res.data.firstName || "",
          lastName: res.data.lastName || "",
          bio: res.data.bio || "",
          primaryRole: res.data.primaryRole || "",
          secondaryRole: res.data.secondaryRole || ""
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await apiPut<any>('/api/profile', profile);
      if (res.success) {
        alert("Profile saved successfully.");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to save profile.");
    } finally {
      setSaving(false);
    }
  }

  if (status === "loading" || loading) return <div className="p-8 text-slate-400">Loading Profile...</div>;

  return (
    <div className="min-h-screen bg-slate-950 pb-12">
      <nav className="border-b border-slate-800 bg-slate-900/50">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-xl font-bold tracking-tight">
              <span className="text-blue-400">A</span>venik
            </Link>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">
              Profile Settings
            </span>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="flex items-center gap-3 mb-8">
          <UserCircle className="h-8 w-8 text-blue-400" />
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Your Identity & Roles</h1>
            <p className="mt-1 text-slate-400">Manage your personal profile and Avenik ecosystem roles.</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-8">
          
          <Card className="p-6 bg-slate-900 border-slate-800">
            <div className="flex items-center gap-2 mb-6">
              <Briefcase className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-bold text-white">Ecosystem Roles</h2>
            </div>
            
            <p className="text-sm text-slate-400 mb-6">
              Select your primary and secondary roles within the Avenik platform. This determines which intelligence views and permissions you have access to.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Primary Role</label>
                <select
                  value={profile.primaryRole}
                  onChange={e => setProfile({...profile, primaryRole: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select Primary Role</option>
                  {availableRoles.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Secondary Role</label>
                <select
                  value={profile.secondaryRole}
                  onChange={e => setProfile({...profile, secondaryRole: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">None</option>
                  {availableRoles.map(r => (
                    <option key={r} value={r} disabled={profile.primaryRole === r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-slate-900 border-slate-800">
             <div className="flex items-center gap-2 mb-6">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white">Personal Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">First Name</label>
                <input
                  type="text"
                  value={profile.firstName}
                  onChange={e => setProfile({...profile, firstName: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  placeholder="E.g., Jane"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Last Name</label>
                <input
                  type="text"
                  value={profile.lastName}
                  onChange={e => setProfile({...profile, lastName: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  placeholder="E.g., Doe"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-slate-300">Bio</label>
                <textarea
                  value={profile.bio}
                  onChange={e => setProfile({...profile, bio: e.target.value})}
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  placeholder="A brief description of yourself..."
                />
              </div>
            </div>
          </Card>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>

        </form>
      </main>
    </div>
  );
}
