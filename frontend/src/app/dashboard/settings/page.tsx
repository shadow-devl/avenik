import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function SettingsPage() {
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

      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-2xl font-semibold">Account Settings</h1>
        <p className="mt-1 text-slate-400">Manage your profile, roles, and connected businesses.</p>

        <div className="mt-8 space-y-8">
          {/* Profile Section */}
          <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
            <h2 className="text-lg font-medium text-white">Public Profile</h2>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-300">First Name</label>
                <input type="text" defaultValue="Jane" className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300">Last Name</label>
                <input type="text" defaultValue="Doe" className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none" />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-slate-300">Bio</label>
                <textarea rows={3} defaultValue="Tech entrepreneur building the future of SaaS." className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none" />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button>Save Changes</Button>
            </div>
          </section>

          {/* Roles Section */}
          <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
            <h2 className="text-lg font-medium text-white">Active Roles</h2>
            <p className="mt-1 text-sm text-slate-400">Your current contexts within the Avenik ecosystem.</p>
            
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-950 p-4">
                <div>
                  <span className="font-medium text-white">Entrepreneur</span>
                  <p className="text-xs text-slate-400 mt-1">Default role</p>
                </div>
                <span className="rounded-full bg-green-900/30 px-3 py-1 text-xs font-medium text-green-400 border border-green-800/50">Active</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-950 p-4">
                <div>
                  <span className="font-medium text-white">Mentor</span>
                  <p className="text-xs text-slate-400 mt-1">Verified by Startup India</p>
                </div>
                <Button variant="outline" size="sm">Switch to Role</Button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
