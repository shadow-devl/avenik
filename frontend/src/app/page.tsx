import Link from "next/link";
import { FEATURES } from "@/lib/constants";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Navbar />

      {/* ── Hero ───────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-24 text-center md:py-32">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
            India&apos;s Startup Ecosystem Platform
          </p>
          <h1 className="mt-4 text-5xl font-bold leading-tight md:text-6xl lg:text-7xl">
            Build. Grow.{" "}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Succeed.
            </span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-400 md:text-xl">
            Connect with government schemes, investors, mentors, incubators, and
            the entire entrepreneurial ecosystem — on a single platform designed
            with trust, privacy, and intelligence at its core.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className="w-full rounded-xl bg-blue-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-500 transition-all sm:w-auto"
            >
              Get Started — It&apos;s Free
            </Link>
            <a
              href="#features"
              className="w-full rounded-xl border border-slate-700 px-8 py-3.5 text-base font-semibold text-slate-300 hover:border-slate-500 hover:text-white transition-all sm:w-auto"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────── */}
      <section id="features" className="border-t border-slate-800">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
            Features
          </p>
          <h2 className="mt-3 text-3xl font-semibold md:text-4xl">
            Everything you need to build and grow.
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ title, description }) => (
              <article
                key={title}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 transition-colors hover:border-slate-700"
              >
                <h3 className="text-xl font-semibold">{title}</h3>
                <p className="mt-3 leading-7 text-slate-400">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Ecosystem ──────────────────────────── */}
      <section id="ecosystem" className="mx-auto max-w-7xl px-6 py-20">
        <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
          Ecosystem
        </p>
        <h2 className="mt-3 text-3xl font-semibold md:text-4xl">
          Designed for the entire entrepreneurial ecosystem.
        </h2>
        <p className="mt-5 max-w-3xl leading-8 text-slate-400">
          Entrepreneurs, investors, mentors, advisors, incubators,
          accelerators, government organizations, corporates, universities,
          researchers, students, and service providers can participate through
          role-specific experiences and permission-controlled data.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          {[
            "Entrepreneurs", "Investors", "Mentors", "Advisors",
            "Incubators", "Accelerators", "Government",
            "Corporates", "Students", "Universities", "Service Providers",
          ].map((role) => (
            <span
              key={role}
              className="rounded-full border border-slate-700 bg-slate-800/50 px-4 py-2 text-sm text-slate-300"
            >
              {role}
            </span>
          ))}
        </div>
      </section>

      {/* ── Trust ──────────────────────────────── */}
      <section id="trust" className="border-t border-slate-800">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
              Trust by design
            </p>
            <h2 className="mt-3 text-3xl font-semibold md:text-4xl">
              Verify privately. Prove selectively.
            </h2>
            <p className="mt-5 leading-8 text-slate-400">
              Avenik separates identity verification, provenance, reputation,
              freshness, and confidence. Sensitive evidence remains private
              while users can selectively prove relevant attributes. Every
              piece of data carries provenance — you always know where
              information came from and how trustworthy it is.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                { label: "Data Provenance", desc: "Track the origin and authority of every data point" },
                { label: "Privacy First", desc: "Your data stays private until you choose to share it" },
                { label: "Selective Disclosure", desc: "Prove specific attributes without revealing everything" },
                { label: "Verification Freshness", desc: "Know when information was last verified and validated" },
              ].map(({ label, desc }) => (
                <div key={label} className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                  <h3 className="font-semibold text-blue-400">{label}</h3>
                  <p className="mt-1 text-sm text-slate-400">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────── */}
      <section className="border-t border-slate-800 bg-slate-900/30">
        <div className="mx-auto max-w-7xl px-6 py-20 text-center">
          <h2 className="text-3xl font-semibold md:text-4xl">
            Ready to build your future?
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            Join Avenik and get connected to India&apos;s startup ecosystem today.
          </p>
          <Link
            href="/register"
            className="mt-8 inline-block rounded-xl bg-blue-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-500 transition-all"
          >
            Create Your Account
          </Link>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────── */}
      <Footer />
    </main>
  );
}
