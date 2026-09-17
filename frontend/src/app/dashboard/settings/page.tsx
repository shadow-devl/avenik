"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useEffect, useState } from "react";
import { apiPost, apiGet, apiDelete } from "@/lib/api";
import { useRouter } from "next/navigation";
import { User, Building, Bell, Shield, Key } from "lucide-react";

export default function SettingsPage() {
  const [legalName, setLegalName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const router = useRouter();

  const [myRoles, setMyRoles] = useState<any[]>([]);
  const [availableRoles, setAvailableRoles] = useState<any[]>([]);
  const [selectedNewRole, setSelectedNewRole] = useState("");

  const handleCreateBusiness = async () => {
    try {
      setLoading(true);
      await apiPost("/api/business", { legalName, displayName, countryCode: "IN" });
      router.push("/dashboard");
    } catch (e) {
      console.error(e);
      alert("Failed to create business");
    } finally {
      setLoading(false);
    }
  };

  // Fetch roles when tab switches to profile
  useEffect(() => {
    if (activeTab === 'profile') {
      fetchRoles();
    }
  }, [activeTab]);

  const fetchRoles = async () => {
    try {
      const [meRes, allRes] = await Promise.all([
        apiGet<any>('/api/users/roles/me'),
        apiGet<any>('/api/users/roles/available')
      ]);
      if (meRes.success) setMyRoles(meRes.data.map((ur: any) => ur.role));
      if (allRes.success) setAvailableRoles(allRes.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddRole = async () => {
    if (!selectedNewRole) return;
    try {
      await apiPost('/api/users/roles', { roleId: selectedNewRole });
      setSelectedNewRole("");
      fetchRoles();
    } catch (e) {
      console.error(e);
      alert("Failed to add role");
    }
  };

  const handleRemoveRole = async (roleId: string) => {
    try {
      await apiDelete(`/api/users/roles/${roleId}`);
      fetchRoles();
    } catch (e) {
      console.error(e);
    }
  };

  const renderPersonalProfile = () => (
    <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
      <h2 className="text-lg font-medium text-white border-b border-slate-800 pb-4 mb-6 flex items-center gap-2">
        <User className="h-5 w-5 text-blue-400" />
        Personal Profile & Roles
      </h2>
      
      <div className="mb-8">
        <h3 className="text-sm font-medium text-slate-300 mb-4">Your Active Roles</h3>
        {myRoles.length === 0 ? (
          <p className="text-sm text-slate-500">You currently have no roles assigned.</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {myRoles.map(role => (
              <div key={role.id} className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-lg">
                <span className="text-sm text-blue-400 font-medium">{role.name}</span>
                <button 
                  onClick={() => handleRemoveRole(role.id)}
                  className="text-slate-400 hover:text-red-400 ml-2"
                  title="Remove role"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="pt-6 border-t border-slate-800">
        <h3 className="text-sm font-medium text-slate-300 mb-3">Add a Second Role</h3>
        <p className="text-xs text-slate-500 mb-4">
          Avenik supports multi-role profiles. You can be an Entrepreneur while also being an Investor or Service Provider.
        </p>
        <div className="flex gap-4 items-center">
          <select 
            value={selectedNewRole}
            onChange={(e) => setSelectedNewRole(e.target.value)}
            className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="">Select a new role...</option>
            {availableRoles.filter(ar => !myRoles.find(mr => mr.id === ar.id)).map(role => (
              <option key={role.id} value={role.id}>{role.name}</option>
            ))}
          </select>
          <Button onClick={handleAddRole} disabled={!selectedNewRole}>Add Role</Button>
        </div>
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-slate-950">
      <nav className="border-b border-slate-800 bg-slate-900/50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-xl font-bold tracking-tight">
              <span className="text-blue-400">A</span>venik
            </Link>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">
              Settings
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-6 py-12 flex flex-col md:flex-row gap-12">
        
        {/* Sidebar Tabs */}
        <aside className="w-full md:w-64 flex-shrink-0 space-y-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 px-3">Configuration</h2>
          <button 
            onClick={() => setActiveTab("profile")}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${activeTab === 'profile' ? 'bg-blue-500/10 text-blue-400' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'}`}
          >
            <User className="h-4 w-4" /> Personal Profile
          </button>
          <button 
            onClick={() => setActiveTab("business")}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${activeTab === 'business' ? 'bg-blue-500/10 text-blue-400' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'}`}
          >
            <Building className="h-4 w-4" /> Business Profile
          </button>
          <button 
            onClick={() => setActiveTab("notifications")}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${activeTab === 'notifications' ? 'bg-blue-500/10 text-blue-400' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'}`}
          >
            <Bell className="h-4 w-4" /> Notifications
          </button>
          <button 
            onClick={() => setActiveTab("security")}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${activeTab === 'security' ? 'bg-blue-500/10 text-blue-400' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'}`}
          >
            <Shield className="h-4 w-4" /> Security
          </button>
          <button 
            onClick={() => setActiveTab("api")}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${activeTab === 'api' ? 'bg-blue-500/10 text-blue-400' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'}`}
          >
            <Key className="h-4 w-4" /> API Keys
          </button>
        </aside>

        {/* Content Area */}
        <div className="flex-1 space-y-8">
          <div>
            <h1 className="text-2xl font-semibold">Account Settings</h1>
            <p className="mt-1 text-slate-400">Manage your profile, roles, and connected businesses.</p>
          </div>

          {activeTab === 'profile' && renderPersonalProfile()}

          {activeTab === 'business' && (
            <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
              <h2 className="text-lg font-medium text-white border-b border-slate-800 pb-4 mb-6">Create Business Profile</h2>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-slate-300">Display Name</label>
                  <input 
                    type="text" 
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. My Startup" 
                    className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none" 
                  />
                  <p className="text-xs text-slate-500 mt-2">This is the name that will be visible on your dashboard.</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-300">Legal Name</label>
                  <input 
                    type="text" 
                    value={legalName}
                    onChange={(e) => setLegalName(e.target.value)}
                    placeholder="e.g. My Startup Pvt Ltd" 
                    className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none" 
                  />
                  <p className="text-xs text-slate-500 mt-2">The exact name registered on your incorporation documents.</p>
                </div>
              </div>
              
              <div className="mt-6">
                 <label className="text-sm font-medium text-slate-300">Country of Registration</label>
                 <select className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none">
                    <option value="IN">India</option>
                    <option value="US" disabled>United States (Coming soon)</option>
                    <option value="UK" disabled>United Kingdom (Coming soon)</option>
                 </select>
              </div>

              <div className="mt-8 pt-6 flex justify-end border-t border-slate-800">
                <Button onClick={handleCreateBusiness} disabled={loading || !displayName}>
                  {loading ? "Saving..." : "Create Profile"}
                </Button>
              </div>
            </section>
          )}

          {activeTab !== 'business' && activeTab !== 'profile' && (
            <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-12 text-center">
               <Shield className="h-12 w-12 text-slate-700 mx-auto mb-4" />
               <h3 className="text-lg font-medium text-slate-300">Section Under Construction</h3>
               <p className="text-sm text-slate-500 mt-2">This configuration panel will be available in the upcoming Phase 3 release.</p>
            </section>
          )}

        </div>
      </main>
    </div>
  );
}
