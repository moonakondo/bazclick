import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-500 text-white shadow-md shadow-blue-500/20">
            <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-xl font-extrabold tracking-tight text-slate-900">
            Baz<span className="text-blue-600">Click</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
          <Link href="#" className="transition hover:text-blue-600">AI Tools</Link>
          <Link href="#" className="transition hover:text-blue-600">SEO Tools</Link>
          <Link href="#" className="transition hover:text-blue-600">Jobs</Link>
          <Link href="#" className="transition hover:text-blue-600">News</Link>
          <Link href="#" className="transition hover:text-blue-600">Blog</Link>
          <Link href="#" className="transition hover:text-blue-600">Roadmap</Link>
          <Link href="#" className="transition hover:text-blue-600">Pricing</Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="#" className="text-sm font-semibold text-slate-700 hover:text-blue-600">
            Sign In
          </Link>
          <Link
            href="#"
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-600/30 transition hover:bg-blue-700"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}