export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 px-6 py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="text-sm text-slate-500">
          © {new Date().getFullYear()} Avenik. All rights reserved.
        </p>
        <p className="text-sm text-slate-600">
          Avenik Platform
        </p>
      </div>
    </footer>
  );
}
