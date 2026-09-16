import Link from "next/link";

export default function CustomerLoyaltyPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <nav className="border-b border-slate-800 bg-slate-900/50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-xl font-bold tracking-tight">
              <span className="text-blue-400">A</span>venik
            </Link>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">
              Customer Loyalty
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
        <h1 className="text-2xl font-semibold text-white">Customer Loyalty</h1>
        <p className="mt-1 text-slate-400">Manage your module settings and insights.</p>

        <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900/50 p-12 text-center">
          <h2 className="text-lg font-medium text-white">Module Unavailable</h2>
          <p className="mt-2 text-sm text-slate-400">This capability is not currently available. The backend services, database schema, and AI intelligence engines for this module have not yet been implemented.</p>
        </div>
      </main>
    </div>
  );
}
