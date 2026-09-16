"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

function RegisterContent() {
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const handleOAuth = async (provider: string) => {
    setLoading(true);
    await signIn(provider, { callbackUrl });
  };

  return (
    <div className="mt-8 space-y-4">
      <button
        type="button"
        onClick={() => handleOAuth('google')}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-700 transition-colors disabled:opacity-50"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <path d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z" fill="#EA4335"/>
          <path d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z" fill="#4285F4"/>
          <path d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z" fill="#FBBC05"/>
          <path d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.26538 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z" fill="#34A853"/>
        </svg>
        Sign up with Google
      </button>

      <button
        type="button"
        onClick={() => handleOAuth('microsoft-entra-id')}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-700 transition-colors disabled:opacity-50"
      >
        <svg viewBox="0 0 23 23" className="h-5 w-5">
          <path fill="#f3f3f3" d="M0 0h23v23H0z" />
          <path fill="#f35325" d="M1 1h10v10H1z" />
          <path fill="#81bc06" d="M12 1h10v10H12z" />
          <path fill="#05a6f0" d="M1 12h10v10H1z" />
          <path fill="#ffba08" d="M12 12h10v10H12z" />
        </svg>
        Sign up with Microsoft
      </button>

      <p className="text-center text-sm text-slate-500 mt-4">
        Already have an account?{" "}
        <Link href="/login" className="text-blue-400 hover:text-blue-300">
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <Link href="/" className="mb-8 text-sm text-slate-400 hover:text-white transition-colors">
        ← Back to Avenik
      </Link>
      <h1 className="text-3xl font-bold">Create Account</h1>
      <p className="mt-3 text-slate-400">
        Join the Avenik ecosystem securely with a verified identity.
      </p>
      
      <Suspense fallback={<div>Loading...</div>}>
        <RegisterContent />
      </Suspense>
    </main>
  );
}
