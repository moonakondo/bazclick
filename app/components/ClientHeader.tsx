'use client';

import { useState } from 'react';

export default function ClientHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">

        {/* Logo */}
        <a href="#" className="flex items-center gap-2.5 text-2xl font-black tracking-tight text-slate-900">
          <span className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-purple-600 to-indigo-500 flex items-center justify-center text-white text-xl shadow-md shadow-blue-500/20">
            <i className="fa-solid font-bold fa-bolt" aria-hidden="true" />
          </span>
          <span>Baz<span className="text-blue-600">Click</span></span>
        </a>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-600">
          <a href="#ai-tools" className="hover:text-blue-600 transition-colors">AI Tools</a>
          <a href="#seo-suite" className="hover:text-blue-600 transition-colors">SEO Tools</a>
          <a href="#jobs" className="hover:text-blue-600 transition-colors">Jobs</a>
          <a href="#news" className="hover:text-blue-600 transition-colors">News</a>
          <a href="#blog" className="hover:text-blue-600 transition-colors">Blog</a>
          <a href="#roadmap" className="hover:text-blue-600 transition-colors">Roadmap</a>
          <a href="#" className="hover:text-blue-600 transition-colors">Pricing</a>
        </nav>

        {/* Desktop Right CTA */}
        <div className="hidden sm:flex items-center gap-4">
          <a href="#" className="text-sm font-semibold text-slate-700 hover:text-blue-600 px-3 py-2 transition-colors">
            Sign In
          </a>
          <a
            href="#ai-tools"
            className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-xl shadow-lg shadow-blue-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Get Started
          </a>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          type="button"
          aria-expanded={isMobileMenuOpen}
          aria-label="Toggle Navigation Menu"
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 focus:outline-none"
        >
          <i
            className={`fa-solid ${isMobileMenuOpen ? 'fa-xmark' : 'fa-bars'} text-2xl`}
            aria-hidden="true"
          />
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3">
          <a href="#ai-tools" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-base font-medium text-slate-700 hover:text-blue-600">AI Tools</a>
          <a href="#seo-suite" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-base font-medium text-slate-700 hover:text-blue-600">SEO Tools</a>
          <a href="#data-tools" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-base font-medium text-slate-700 hover:text-blue-600">Data Tools</a>
          <a href="#jobs" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-base font-medium text-slate-700 hover:text-blue-600">Jobs</a>
          <a href="#news" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-base font-medium text-slate-700 hover:text-blue-600">News</a>
          <a href="#blog" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-base font-medium text-slate-700 hover:text-blue-600">Blog</a>
          <a href="#roadmap" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-base font-medium text-slate-700 hover:text-blue-600">Roadmap</a>
          <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
            <a href="#" className="w-full text-center py-2.5 text-slate-700 font-semibold rounded-xl border border-slate-200">Sign In</a>
            <a href="#ai-tools" onClick={() => setIsMobileMenuOpen(false)} className="w-full text-center py-2.5 text-white font-semibold bg-blue-600 rounded-xl shadow-md">Get Started</a>
          </div>
        </div>
      )}
    </header>
  );
}