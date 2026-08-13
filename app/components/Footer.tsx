export default function Footer() {
  return (
    <footer className="bg-[#0b132b] text-slate-400 text-sm py-16">
      <div className="mx-auto max-w-7xl px-6 grid grid-cols-1 md:grid-cols-5 gap-10">
        <div className="md:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white">
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-white">BazClick</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            The all-in-one AI platform for marketers, developers, freelancers, and growing businesses.
          </p>
        </div>

        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Products</h4>
          <ul className="space-y-2.5 text-xs">
            <li><a href="#" className="hover:text-white">AI Writer</a></li>
            <li><a href="#" className="hover:text-white">AI Generator</a></li>
            <li><a href="#" className="hover:text-white">SEO Suite</a></li>
            <li><a href="#" className="hover:text-white">Data Tools</a></li>
            <li><a href="#" className="hover:text-white">Remote Jobs</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Resources</h4>
          <ul className="space-y-2.5 text-xs">
            <li><a href="#" className="hover:text-white">Global News</a></li>
            <li><a href="#" className="hover:text-white">Growth Blog</a></li>
            <li><a href="#" className="hover:text-white">Documentation</a></li>
            <li><a href="#" className="hover:text-white">Public Roadmap</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Developers</h4>
          <ul className="space-y-2.5 text-xs">
            <li><a href="#" className="hover:text-white">API Docs</a></li>
            <li><a href="#" className="hover:text-white">Integrations</a></li>
            <li><a href="#" className="hover:text-white">GitHub Repo</a></li>
            <li><a href="#" className="hover:text-white">System Status</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Legal & Support</h4>
          <ul className="space-y-2.5 text-xs">
            <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-white">Terms of Service</a></li>
            <li><a href="#" className="hover:text-white">Compliance</a></li>
            <li><a href="#" className="hover:text-white">Contact Us</a></li>
          </ul>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 mt-12 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
        © 2026 BazClick. All rights reserved. Built for growth.
      </div>
    </footer>
  );
}