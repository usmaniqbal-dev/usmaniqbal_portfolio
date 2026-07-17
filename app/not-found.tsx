import Link from "next/link";

/** Displays a graceful fallback when a visitor opens an unknown route. */
export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#020807] px-6 text-white">
      <div className="max-w-md text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#16f2a4]">NURAXTECH</p>
        <h1 className="mt-4 text-4xl font-black">Page not found</h1>
        <p className="mt-4 text-white/65">The page you are looking for does not exist or may have moved.</p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center rounded-full bg-[#16f2a4] px-6 py-3 font-bold text-[#03150f] transition hover:bg-[#5ef7c2]"
        >
          Return home
        </Link>
      </div>
    </main>
  );
}
