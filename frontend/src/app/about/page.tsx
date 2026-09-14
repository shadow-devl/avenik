import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <Navbar />

      {/* ── Content ────────────────────────────── */}
      <div className="mx-auto max-w-4xl px-6 py-20">
        <h1 className="text-4xl font-bold md:text-5xl">About Avenik</h1>
        <p className="mt-6 text-xl leading-8 text-slate-400">
          Avenik is India's comprehensive startup ecosystem platform, designed to bridge the gap between innovation and opportunity.
        </p>

        <div className="mt-16 space-y-12">
          <section>
            <h2 className="text-2xl font-semibold">The Vision</h2>
            <p className="mt-4 text-lg text-slate-300">
              India has one of the world's largest and fastest-growing startup ecosystems, yet many founders struggle to find the right mentors, secure funding, or navigate the complex landscape of government schemes. Avenik was created to solve this fragmentation.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">Trust by Design</h2>
            <p className="mt-4 leading-7 text-slate-300">
              Unlike traditional platforms where anyone can claim any credential, Avenik separates identity from provenance. We enable users to <strong>verify privately and prove selectively</strong>. When you connect with a mentor or investor on Avenik, you know their credentials are backed by verifiable sources.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">An Ecosystem Built for Growth</h2>
            <ul className="mt-6 space-y-4 text-slate-300">
              <li className="flex gap-4">
                <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-900/50 text-blue-400">1</div>
                <div>
                  <strong className="text-white">Intelligent Matching</strong>
                  <p className="mt-1 text-sm text-slate-400">Our AI-powered engine matches startups with the right government schemes, grants, and investors based on their verified business metrics.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-900/50 text-blue-400">2</div>
                <div>
                  <strong className="text-white">Business Operating System</strong>
                  <p className="mt-1 text-sm text-slate-400">Not just a directory, Avenik provides tools to track KPIs, visualize business growth, and execute next-best actions.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-900/50 text-blue-400">3</div>
                <div>
                  <strong className="text-white">Multi-Role Architecture</strong>
                  <p className="mt-1 text-sm text-slate-400">A single platform where incubators, corporates, universities, and government bodies collaborate seamlessly.</p>
                </div>
              </li>
            </ul>
          </section>
        </div>
      </div>

      {/* ── Footer ─────────────────────────────── */}
      <div className="mt-20">
        <Footer />
      </div>
    </main>
  );
}
