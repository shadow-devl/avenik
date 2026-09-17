import Link from 'next/link';
import { ArrowRight, Bot, BarChart3, ShieldCheck, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans overflow-x-hidden selection:bg-blue-500/30">
      {/* Navigation */}
      <nav className="fixed w-full z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">A</div>
            <span className="text-xl font-bold tracking-tight text-white">Avenik</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link 
              href="/register" 
              className="rounded-full bg-white px-5 py-2 text-sm font-medium text-slate-900 transition-all hover:bg-slate-200 hover:scale-105"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative pt-32 pb-20 lg:pt-48 lg:pb-32">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-1/2 -z-10 -translate-x-1/2 blur-3xl xl:-top-6" aria-hidden="true">
          <div className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}></div>
        </div>

        <div className="mx-auto max-w-7xl px-6 text-center">
          <div className="inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-sm font-medium text-blue-400 mb-8 backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-blue-500 mr-2 animate-pulse"></span>
            Avenik Intelligence Engine 2.0 is Live
          </div>
          
          <h1 className="mx-auto max-w-4xl text-5xl font-extrabold tracking-tight sm:text-7xl bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
            The Autonomous OS for <br className="hidden sm:block" /> Modern Entrepreneurs
          </h1>
          
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Avenik is not a dashboard. It is an autonomous intelligence platform that connects your financials, operations, and ecosystem into a single real-time brain. Let AI drive your growth.
          </p>
          
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link 
              href="/register" 
              className="group flex items-center gap-2 rounded-full bg-blue-600 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-500 hover:scale-105"
            >
              Launch Workspace <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="#features" className="text-sm font-semibold leading-6 text-white hover:text-slate-300 transition-colors">
              Explore Architecture <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Feature Grid */}
      <section id="features" className="py-24 sm:py-32 bg-slate-900/50 border-y border-white/5 relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-blue-400">Deploy Instantly</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">Everything you need to scale, governed by AI.</p>
          </div>
          
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-4">
              
              <div className="flex flex-col bg-slate-900 p-8 rounded-3xl border border-white/5 hover:border-blue-500/30 transition-colors group">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                  <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                    <Bot className="h-5 w-5 text-blue-400" />
                  </div>
                  Strategic Copilot
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-400">
                  <p className="flex-auto">Talk directly to your company's data. Avenik's multimodal AI answers complex questions about your runway, risk, and opportunities instantly.</p>
                </dd>
              </div>

              <div className="flex flex-col bg-slate-900 p-8 rounded-3xl border border-white/5 hover:border-indigo-500/30 transition-colors group">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                  <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-indigo-500/10 group-hover:bg-indigo-500/20 transition-colors">
                    <BarChart3 className="h-5 w-5 text-indigo-400" />
                  </div>
                  Financial Intelligence
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-400">
                  <p className="flex-auto">Connect your banking and accounting systems. Avenik automatically categorizes expenses, forecasts burn rate, and models revenue.</p>
                </dd>
              </div>

              <div className="flex flex-col bg-slate-900 p-8 rounded-3xl border border-white/5 hover:border-emerald-500/30 transition-colors group">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                  <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
                    <ShieldCheck className="h-5 w-5 text-emerald-400" />
                  </div>
                  Zero-Trust Governance
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-400">
                  <p className="flex-auto">Enterprise-grade RBAC, context-isolated schemas, and real-time anomaly detection keep your intellectual property perfectly secure.</p>
                </dd>
              </div>

              <div className="flex flex-col bg-slate-900 p-8 rounded-3xl border border-white/5 hover:border-amber-500/30 transition-colors group">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                  <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-amber-500/10 group-hover:bg-amber-500/20 transition-colors">
                    <Zap className="h-5 w-5 text-amber-400" />
                  </div>
                  70+ Modular Engines
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-400">
                  <p className="flex-auto">From Government Scheme Matchmaking to Human Capital Forecasting—activate the modules you need, precisely when you need them.</p>
                </dd>
              </div>

            </dl>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-slate-950 py-12">
        <div className="mx-auto max-w-7xl px-6 text-center text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} Avenik. Building the unified entrepreneur ecosystem. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
