import type { Metadata } from 'next';
import Script from 'next/script';
import ClientHeader from './components/ClientHeader';

export const metadata: Metadata = {
  title: 'BazClick — The AI Platform Built for Growth',
  description:
    'Discover AI tools, analyze SEO, scrape public data responsibly, hire talent, explore global tech news, and grow your business—all from one platform.',
  keywords: [
    'AI tools',
    'SEO software',
    'Remote jobs',
    'Tech news',
    'Public data research',
    'Digital marketing resources',
  ],
  authors: [{ name: 'BazClick Team' }],
  openGraph: {
    title: 'BazClick — The AI Platform Built for Growth',
    description:
      'Discover AI tools, analyze SEO, scrape public data responsibly, hire talent, explore global tech news, and grow your business—all from one platform.',
    url: 'https://bazclick.com',
    siteName: 'BazClick',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BazClick — The AI Platform Built for Growth',
    description:
      'Discover AI tools, analyze SEO, scrape public data responsibly, hire talent, explore global tech news, and grow your business.',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://bazclick.com',
  },
};

export default function HomePage() {
  return (
    <>
      {/* FontAwesome CDN for Icons */}
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/js/all.min.js"
        strategy="lazyOnload"
      />

      <div className="bg-slate-50 text-slate-800 font-sans antialiased selection:bg-blue-500 selection:text-white">

        {/* HEADER / NAVIGATION */}
        <ClientHeader />

        <main id="main-content">
          {/* HERO SECTION */}
          <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-32 overflow-hidden">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-tr from-blue-500/10 to-purple-500/10 blur-3xl rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-3xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-xs sm:text-sm font-semibold mb-6">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                  <span>The All-in-One AI Platform for Growth</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                  The AI Platform Built for{' '}
                  <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Growth
                  </span>
                </h1>

                <p className="mt-6 text-lg sm:text-xl text-slate-600 leading-relaxed font-normal">
                  Discover AI tools, analyze SEO, scrape public data responsibly, hire talent, explore global tech news, and grow your business—all from one platform.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <a
                    href="#ai-tools"
                    className="w-full sm:w-auto px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base shadow-xl shadow-blue-600/25 transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
                  >
                    <span>Try AI Tools</span>
                    <i className="fa-solid fa-arrow-right text-sm" aria-hidden="true" />
                  </a>
                  <a
                    href="#jobs"
                    className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-semibold text-base border border-slate-200 shadow-sm transition-all flex items-center justify-center gap-2"
                  >
                    <i className="fa-solid fa-briefcase text-slate-500" aria-hidden="true" />
                    <span>Explore Jobs</span>
                  </a>
                </div>
              </div>

              {/* Animated Dashboard Preview Widget */}
              <div className="mt-14 relative max-w-5xl mx-auto">
                <div className="rounded-2xl border border-slate-200/80 bg-white shadow-2xl p-4 sm:p-6 lg:p-8 backdrop-blur-xl">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-rose-400" />
                      <span className="w-3 h-3 rounded-full bg-amber-400" />
                      <span className="w-3 h-3 rounded-full bg-emerald-400" />
                      <span className="text-xs font-mono text-slate-400 ml-2">app.bazclick.com/dashboard</span>
                    </div>
                    <div className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Systems Operational
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-slate-600 text-xs font-semibold uppercase tracking-wider">
                        <span>SEO Health Audit</span>
                        <i className="fa-solid fa-chart-line text-blue-600" aria-hidden="true" />
                      </div>
                      <div className="my-3 flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-slate-900">94/100</span>
                        <span className="text-xs font-semibold text-emerald-600">
                          <i className="fa-solid fa-arrow-up" aria-hidden="true" /> +12%
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '94%' }} />
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-slate-600 text-xs font-semibold uppercase tracking-wider">
                        <span>AI Assistant Snippet</span>
                        <i className="fa-solid fa-wand-magic-sparkles text-purple-600" aria-hidden="true" />
                      </div>
                      <div className="my-2 p-2.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 italic">
                        &quot;Optimizing landing page copy for organic CTR...&quot;
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                        <span>Tokens: 1,420</span>
                        <span className="text-purple-600 font-semibold">Done in 0.4s</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-slate-600 text-xs font-semibold uppercase tracking-wider">
                        <span>Live Marketplace &amp; Jobs</span>
                        <i className="fa-solid fa-globe text-blue-500" aria-hidden="true" />
                      </div>
                      <div className="my-2 grid grid-cols-2 gap-2 text-center">
                        <div className="p-2 bg-white rounded-lg border border-slate-200">
                          <div className="text-lg font-bold text-slate-900">1,240</div>
                          <div className="text-[10px] text-slate-500 uppercase font-medium">Remote Jobs</div>
                        </div>
                        <div className="p-2 bg-white rounded-lg border border-slate-200">
                          <div className="text-lg font-bold text-slate-900">5.2k+</div>
                          <div className="text-[10px] text-slate-500 uppercase font-medium">News Feed</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* STATS BAR */}
          <section className="border-y border-slate-200 bg-white py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                <div>
                  <p className="text-3xl sm:text-4xl font-extrabold text-slate-900">10+</p>
                  <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1 uppercase tracking-wider">AI Productivity Tools</p>
                </div>
                <div>
                  <p className="text-3xl sm:text-4xl font-extrabold text-slate-900">5,000+</p>
                  <p class="text-xs sm:text-sm font-medium text-slate-500 mt-1 uppercase tracking-wider">Curated Tech Articles</p>
                </div>
                <div>
                  <p className="text-3xl sm:text-4xl font-extrabold text-slate-900">1,000+</p>
                  <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1 uppercase tracking-wider">Active Tech Jobs</p>
                </div>
                <div>
                  <p className="text-3xl sm:text-4xl font-extrabold text-slate-900">100+</p>
                  <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1 uppercase tracking-wider">Countries Reached</p>
                </div>
              </div>
            </div>
          </section>

          {/* MAIN PRODUCTS CARDS */}
          <section className="py-20 bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-2xl mx-auto mb-16">
                <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">One Unified Platform. Six Pillars.</h2>
                <p className="mt-4 text-slate-600 text-base">Stop stitching together dozens of subscriptions. BazClick unifies your operational workflow.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="p-8 bg-white rounded-2xl border border-slate-200 hover:border-blue-500 shadow-sm hover:shadow-xl transition-all group flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 text-xl group-hover:scale-110 transition-transform mb-6">
                      <i className="fa-solid fa-wand-magic-sparkles" aria-hidden="true" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">AI Tools</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      Create content, automate workflows, generate code, and dramatically increase productivity with tailored AI tools.
                    </p>
                  </div>
                  <a href="#ai-tools" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 group-hover:text-blue-700">
                    Explore AI Suite <i className="fa-solid fa-arrow-right text-xs" aria-hidden="true" />
                  </a>
                </div>

                <div className="p-8 bg-white rounded-2xl border border-slate-200 hover:border-blue-500 shadow-sm hover:shadow-xl transition-all group flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 text-xl group-hover:scale-110 transition-transform mb-6">
                      <i className="fa-solid fa-chart-pie" aria-hidden="true" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">SEO Suite</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      Keyword research, backlink insights, technical site audits, and complete website visibility analysis.
                    </p>
                  </div>
                  <a href="#seo-suite" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 group-hover:text-emerald-700">
                    Analyze Rankings <i className="fa-solid fa-arrow-right text-xs" aria-hidden="true" />
                  </a>
                </div>

                <div className="p-8 bg-white rounded-2xl border border-slate-200 hover:border-blue-500 shadow-sm hover:shadow-xl transition-all group flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 text-xl group-hover:scale-110 transition-transform mb-6">
                      <i className="fa-solid fa-database" aria-hidden="true" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">Data Tools</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      Collect, organize, and export publicly available web data for research workflows while respecting robot policies.
                    </p>
                  </div>
                  <a href="#data-tools" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-purple-600 group-hover:text-purple-700">
                    Research Data <i className="fa-solid fa-arrow-right text-xs" aria-hidden="true" />
                  </a>
                </div>

                <div className="p-8 bg-white rounded-2xl border border-slate-200 hover:border-blue-500 shadow-sm hover:shadow-xl transition-all group flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 text-xl group-hover:scale-110 transition-transform mb-6">
                      <i className="fa-solid fa-briefcase" aria-hidden="true" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">Jobs Board</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      Find flexible remote engineering/marketing opportunities or connect your business with skilled global professionals.
                    </p>
                  </div>
                  <a href="#jobs" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 group-hover:text-indigo-700">
                    Find Talent &amp; Jobs <i className="fa-solid fa-arrow-right text-xs" aria-hidden="true" />
                  </a>
                </div>

                <div className="p-8 bg-white rounded-2xl border border-slate-200 hover:border-blue-500 shadow-sm hover:shadow-xl transition-all group flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 text-xl group-hover:scale-110 transition-transform mb-6">
                      <i className="fa-solid fa-newspaper" aria-hidden="true" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">Global News</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      Stay ahead with curated real-time updates across AI, tech startups, venture capital, and software innovations.
                    </p>
                  </div>
                  <a href="#news" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-amber-600 group-hover:text-amber-700">
                    Read News Feed <i className="fa-solid fa-arrow-right text-xs" aria-hidden="true" />
                  </a>
                </div>

                <div className="p-8 bg-slate-100 rounded-2xl border border-slate-200 relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute top-4 right-4 bg-slate-800 text-white text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full">
                    Coming Soon
                  </div>
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-slate-200 flex items-center justify-center text-slate-500 text-xl mb-6">
                      <i className="fa-solid fa-store" aria-hidden="true" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-3">Marketplace</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">
                      Buy and sell vetted digital assets, UI templates, SaaS boilerplates, and custom trained AI prompt workflows.
                    </p>
                  </div>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-400 cursor-not-allowed">
                    Launch in Q4
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* AI TOOLS SECTION */}
          <section id="ai-tools" className="py-20 bg-white border-t border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
                <div>
                  <span class="text-xs font-bold text-blue-600 uppercase tracking-widest">Productivity Unleashed</span>
                  <h2 className="text-3xl font-extrabold text-slate-900 mt-1">Popular AI Tools</h2>
                </div>
                <a href="#" className="mt-4 md:mt-0 text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  View All AI Tools <i className="fa-solid fa-arrow-right text-xs" aria-hidden="true" />
                </a>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl border border-slate-200 hover:shadow-lg transition-all bg-white flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="p-3 rounded-xl bg-blue-50 text-blue-600 text-lg">
                        <i className="fa-solid fa-pen-nib" aria-hidden="true" />
                      </span>
                      <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-2.5 py-1 rounded-full">v2.4 Ready</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">AI Writer</h3>
                    <p className="text-slate-600 text-sm mt-2">Generate high-converting blog posts, social hooks, and marketing emails in seconds.</p>
                  </div>
                  <button className="mt-6 w-full py-2.5 rounded-xl border border-slate-200 hover:border-blue-600 hover:bg-blue-50 text-slate-700 hover:text-blue-600 font-semibold text-sm transition-all flex items-center justify-center gap-2">
                    <span>Open Tool</span> <i className="fa-solid fa-up-right-from-square text-xs" aria-hidden="true" />
                  </button>
                </div>

                <div className="p-6 rounded-2xl border border-slate-200 hover:shadow-lg transition-all bg-white flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="p-3 rounded-xl bg-purple-50 text-purple-600 text-lg">
                        <i className="fa-solid fa-image" aria-hidden="true" />
                      </span>
                      <span className="text-xs bg-purple-50 text-purple-700 font-semibold px-2.5 py-1 rounded-full">HD Generator</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">AI Image Generator</h3>
                    <p className="text-slate-600 text-sm mt-2">Transform text descriptions into photorealistic visuals and brand vector graphics.</p>
                  </div>
                  <button className="mt-6 w-full py-2.5 rounded-xl border border-slate-200 hover:border-blue-600 hover:bg-blue-50 text-slate-700 hover:text-blue-600 font-semibold text-sm transition-all flex items-center justify-center gap-2">
                    <span>Open Tool</span> <i className="fa-solid fa-up-right-from-square text-xs" aria-hidden="true" />
                  </button>
                </div>

                <div className="p-6 rounded-2xl border border-slate-200 hover:shadow-lg transition-all bg-white flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="p-3 rounded-xl bg-emerald-50 text-emerald-600 text-lg">
                        <i className="fa-solid fa-magnifying-glass-chart" aria-hidden="true" />
                      </span>
                      <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-2.5 py-1 rounded-full">Pro</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">AI SEO Assistant</h3>
                    <p className="text-slate-600 text-sm mt-2">Audit content for search intent, optimize meta-tags, and fix missing keywords seamlessly.</p>
                  </div>
                  <button className="mt-6 w-full py-2.5 rounded-xl border border-slate-200 hover:border-blue-600 hover:bg-blue-50 text-slate-700 hover:text-blue-600 font-semibold text-sm transition-all flex items-center justify-center gap-2">
                    <span>Open Tool</span> <i className="fa-solid fa-up-right-from-square text-xs" aria-hidden="true" />
                  </button>
                </div>

                <div className="p-6 rounded-2xl border border-slate-200 hover:shadow-lg transition-all bg-white flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="p-3 rounded-xl bg-amber-50 text-amber-600 text-lg">
                        <i className="fa-solid fa-comments" aria-hidden="true" />
                      </span>
                      <span className="text-xs bg-slate-100 text-slate-600 font-semibold px-2.5 py-1 rounded-full">Multi-Model</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">AI Chat Hub</h3>
                    <p className="text-slate-600 text-sm mt-2">Conversational intelligence powered by top LLMs tailored to business research.</p>
                  </div>
                  <button className="mt-6 w-full py-2.5 rounded-xl border border-slate-200 hover:border-blue-600 hover:bg-blue-50 text-slate-700 hover:text-blue-600 font-semibold text-sm transition-all flex items-center justify-center gap-2">
                    <span>Open Tool</span> <i className="fa-solid fa-up-right-from-square text-xs" aria-hidden="true" />
                  </button>
                </div>

                <div className="p-6 rounded-2xl border border-slate-200 hover:shadow-lg transition-all bg-white flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="p-3 rounded-xl bg-indigo-50 text-indigo-600 text-lg">
                        <i className="fa-solid fa-code" aria-hidden="true" />
                      </span>
                      <span className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-2.5 py-1 rounded-full">Dev Suite</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">AI Code Assistant</h3>
                    <p className="text-slate-600 text-sm mt-2">Refactor, debug, and auto-generate clean JavaScript, Python, and HTML/CSS snippets.</p>
                  </div>
                  <button className="mt-6 w-full py-2.5 rounded-xl border border-slate-200 hover:border-blue-600 hover:bg-blue-50 text-slate-700 hover:text-blue-600 font-semibold text-sm transition-all flex items-center justify-center gap-2">
                    <span>Open Tool</span> <i className="fa-solid fa-up-right-from-square text-xs" aria-hidden="true" />
                  </button>
                </div>

                <div className="p-6 rounded-2xl border border-slate-200 hover:shadow-lg transition-all bg-white flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="p-3 rounded-xl bg-rose-50 text-rose-600 text-lg">
                        <i className="fa-solid fa-language" aria-hidden="true" />
                      </span>
                      <span className="text-xs bg-slate-100 text-slate-600 font-semibold px-2.5 py-1 rounded-full">50+ Languages</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">AI Translator</h3>
                    <p className="text-slate-600 text-sm mt-2">Context-aware localization that maintains tone, nuances, and brand messaging.</p>
                  </div>
                  <button className="mt-6 w-full py-2.5 rounded-xl border border-slate-200 hover:border-blue-600 hover:bg-blue-50 text-slate-700 hover:text-blue-600 font-semibold text-sm transition-all flex items-center justify-center gap-2">
                    <span>Open Tool</span> <i className="fa-solid fa-up-right-from-square text-xs" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* SEO SECTION */}
          <section id="seo-suite" className="py-20 bg-slate-900 text-white relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                <div className="lg:col-span-5">
                  <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">Search Engine Optimization</span>
                  <h2 className="text-3xl font-extrabold text-white mt-2 sm:text-4xl">Data-Driven SEO Suite</h2>
                  <p className="mt-4 text-slate-400 leading-relaxed text-sm sm:text-base">
                    Outrank competitors with deep website diagnostics, keyword tracking, link analysis, and actionable AI recommendations.
                  </p>

                  <div className="mt-8 grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center gap-3">
                      <i className="fa-solid fa-check text-emerald-400" aria-hidden="true" />
                      <span className="text-sm font-medium text-slate-200">Site Audits</span>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center gap-3">
                      <i className="fa-solid fa-check text-emerald-400" aria-hidden="true" />
                      <span className="text-sm font-medium text-slate-200">Backlink Checker</span>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center gap-3">
                      <i className="fa-solid fa-check text-emerald-400" aria-hidden="true" />
                      <span className="text-sm font-medium text-slate-200">Keyword Research</span>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center gap-3">
                      <i className="fa-solid fa-check text-emerald-400" aria-hidden="true" />
                      <span className="text-sm font-medium text-slate-200">Competitor Insights</span>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center gap-3">
                      <i className="fa-solid fa-check text-emerald-400" aria-hidden="true" />
                      <span className="text-sm font-medium text-slate-200">Broken Link Finder</span>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center gap-3">
                      <i className="fa-solid fa-check text-emerald-400" aria-hidden="true" />
                      <span className="text-sm font-medium text-slate-200">Technical Checks</span>
                    </div>
                  </div>

                  <div className="mt-8">
                    <a href="#" className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all shadow-lg shadow-blue-600/30">
                      <span>Explore SEO Suite</span>
                      <i className="fa-solid fa-arrow-right text-xs" aria-hidden="true" />
                    </a>
                  </div>
                </div>

                <div className="lg:col-span-7">
                  <div className="p-6 rounded-2xl bg-slate-800 border border-slate-700 shadow-2xl space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-700 text-xs text-slate-400">
                      <div className="flex items-center gap-2">
                        <i className="fa-solid fa-magnifying-glass text-blue-400" aria-hidden="true" />
                        <span className="font-mono text-slate-300">https://yourdomain.com</span>
                      </div>
                      <span className="bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded font-semibold">Audit Complete</span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-700/50">
                        <div className="text-xl font-bold text-emerald-400">98%</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">Health Score</div>
                      </div>
                      <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-700/50">
                        <div className="text-xl font-bold text-blue-400">14.2k</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">Backlinks</div>
                      </div>
                      <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-700/50">
                        <div className="text-xl font-bold text-purple-400">3.8k</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">Ranked Keywords</div>
                      </div>
                    </div>

                    <div className="overflow-x-auto text-xs">
                      <table className="w-full text-left text-slate-300">
                        <thead className="bg-slate-900/80 text-slate-400 font-semibold uppercase text-[10px]">
                          <tr>
                            <th className="p-2.5">Target Keyword</th>
                            <th className="p-2.5">Volume</th>
                            <th className="p-2.5">Difficulty</th>
                            <th className="p-2.5">Position</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                          <tr>
                            <td className="p-2.5 font-medium text-white">ai automation software</td>
                            <td className="p-2.5">18,400</td>
                            <td className="p-2.5"><span className="text-amber-400 font-semibold">Medium (45)</span></td>
                            <td className="p-2.5 text-emerald-400 font-bold">#2 <i className="fa-solid fa-caret-up" aria-hidden="true" /></td>
                          </tr>
                          <tr>
                            <td className="p-2.5 font-medium text-white">free seo tools suite</td>
                            <td className="p-2.5">32,100</td>
                            <td className="p-2.5"><span className="text-emerald-400 font-semibold">Easy (22)</span></td>
                            <td className="p-2.5 text-emerald-400 font-bold">#1 <i className="fa-solid fa-caret-up" aria-hidden="true" /></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* DATA TOOLS SECTION */}
          <section id="data-tools" className="py-20 bg-slate-50 border-t border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-3xl mx-auto text-center mb-12">
                <span className="text-xs font-bold text-purple-600 uppercase tracking-widest">Ethical Data Extraction</span>
                <h2 className="text-3xl font-extrabold text-slate-900 mt-1">Responsible Data Scraping &amp; Research Tools</h2>
                <p className="mt-3 text-slate-600 text-sm sm:text-base">
                  Collect, organize, and export public web data for analysis while respecting website permissions and applicable laws.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="p-6 bg-white rounded-xl border border-slate-200 text-center">
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center mx-auto mb-4 text-lg">
                    <i className="fa-solid fa-filter" aria-hidden="true" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1">Data Extraction</h3>
                  <p className="text-xs text-slate-500">Structured DOM parsing for public product catalogs &amp; market research.</p>
                </div>

                <div className="p-6 bg-white rounded-xl border border-slate-200 text-center">
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center mx-auto mb-4 text-lg">
                    <i className="fa-solid fa-file-csv" aria-hidden="true" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1">Instant CSV Export</h3>
                  <p className="text-xs text-slate-500">Export clean datasets to CSV, JSON, or direct Google Sheets sync.</p>
                </div>

                <div className="p-6 bg-white rounded-xl border border-slate-200 text-center">
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center mx-auto mb-4 text-lg">
                    <i className="fa-solid fa-clock" aria-hidden="true" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1">Scheduled Tasks</h3>
                  <p className="text-xs text-slate-500">Run recurring data collection workflows with webhook notifications.</p>
                </div>

                <div className="p-6 bg-white rounded-xl border border-slate-200 text-center">
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center mx-auto mb-4 text-lg">
                    <i className="fa-solid fa-shield-halved" aria-hidden="true" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1">Compliance First</h3>
                  <p className="text-xs text-slate-500">Respects robots.txt directives and automated rate limits built-in.</p>
                </div>
              </div>
            </div>
          </section>

          {/* JOBS SECTION */}
          <section id="jobs" className="py-20 bg-white border-t border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
                <div>
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Global Talent Exchange</span>
                  <h2 className="text-3xl font-extrabold text-slate-900 mt-1">Latest Tech &amp; Remote Jobs</h2>
                </div>
                <div className="mt-4 md:mt-0 flex gap-3">
                  <a href="#" className="px-4 py-2 rounded-lg bg-indigo-50 text-indigo-700 font-semibold text-xs hover:bg-indigo-100 transition-colors">
                    Browse All Jobs
                  </a>
                  <a href="#" className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 transition-colors">
                    Post a Job
                  </a>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-5 rounded-2xl border border-slate-200 hover:border-indigo-300 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg shrink-0">
                      N
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-base">Senior Full-Stack Engineer (Next.js &amp; AI)</h3>
                        <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded">Remote</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                        <span><i className="fa-solid fa-building text-slate-400 mr-1" aria-hidden="true" /> Nexus AI Solutions</span>
                        <span><i className="fa-solid fa-location-dot text-slate-400 mr-1" aria-hidden="true" /> Global / Worldwide</span>
                        <span className="font-semibold text-slate-700">$120k – $150k / yr</span>
                      </div>
                    </div>
                  </div>
                  <a href="#" className="self-start md:self-auto px-5 py-2 rounded-xl bg-slate-100 hover:bg-indigo-600 hover:text-white font-semibold text-xs text-slate-700 transition-all">
                    Apply Now
                  </a>
                </div>

                <div className="p-5 rounded-2xl border border-slate-200 hover:border-indigo-300 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shrink-0">
                      G
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-base">SEO &amp; Organic Growth Lead</h3>
                        <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded">Remote</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                        <span><i className="fa-solid fa-building text-slate-400 mr-1" aria-hidden="true" /> GrowthPulse</span>
                        <span><i className="fa-solid fa-location-dot text-slate-400 mr-1" aria-hidden="true" /> US / Europe</span>
                        <span className="font-semibold text-slate-700">$85k – $110k / yr</span>
                      </div>
                    </div>
                  </div>
                  <a href="#" className="self-start md:self-auto px-5 py-2 rounded-xl bg-slate-100 hover:bg-indigo-600 hover:text-white font-semibold text-xs text-slate-700 transition-all">
                    Apply Now
                  </a>
                </div>

                <div className="p-5 rounded-2xl border border-slate-200 hover:border-indigo-300 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-lg shrink-0">
                      A
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-base">Prompt Engineer &amp; Content Strategist</h3>
                        <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded">Hybrid</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                        <span><i className="fa-solid fa-building text-slate-400 mr-1" aria-hidden="true" /> AutomationX</span>
                        <span><i className="fa-solid fa-location-dot text-slate-400 mr-1" aria-hidden="true" /> London, UK</span>
                        <span className="font-semibold text-slate-700">£60k – £75k / yr</span>
                      </div>
                    </div>
                  </div>
                  <a href="#" className="self-start md:self-auto px-5 py-2 rounded-xl bg-slate-100 hover:bg-indigo-600 hover:text-white font-semibold text-xs text-slate-700 transition-all">
                    Apply Now
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* NEWS SECTION */}
          <section id="news" className="py-20 bg-slate-50 border-t border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
                <div>
                  <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">Industry Pulse</span>
                  <h2 className="text-3xl font-extrabold text-slate-900 mt-1">Global Tech &amp; AI News</h2>
                </div>
                <a href="#" className="mt-4 md:mt-0 text-sm font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1">
                  Explore News Hub <i className="fa-solid fa-arrow-right text-xs" aria-hidden="true" />
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <article className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                  <div>
                    <div className="h-44 bg-slate-800 flex items-center justify-center text-slate-400 relative">
                      <i className="fa-solid fa-robot text-4xl" aria-hidden="true" />
                      <span className="absolute top-3 left-3 bg-blue-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-md uppercase">AI &amp; Tech</span>
                    </div>
                    <div className="p-6">
                      <p className="text-xs text-slate-400 font-medium">August 3, 2026 • 4 min read</p>
                      <h3 className="text-lg font-bold text-slate-900 mt-2 hover:text-blue-600 transition-colors">
                        How LLM Search Engines Are Changing Organic Web Traffic
                      </h3>
                      <p className="text-slate-600 text-xs mt-3 line-clamp-3">
                        An in-depth report on how AI synthesis answers affect traditional website click-through rates and referral sources.
                      </p>
                    </div>
                  </div>
                  <div className="px-6 pb-6">
                    <a href="#" className="text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1">
                      Read Article <i className="fa-solid fa-chevron-right text-[10px]" aria-hidden="true" />
                    </a>
                  </div>
                </article>

                <article className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                  <div>
                    <div className="h-44 bg-slate-800 flex items-center justify-center text-slate-400 relative">
                      <i className="fa-solid fa-chart-line text-4xl" aria-hidden="true" />
                      <span className="absolute top-3 left-3 bg-amber-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-md uppercase">Business</span>
                    </div>
                    <div className="p-6">
                      <p className="text-xs text-slate-400 font-medium">August 2, 2026 • 5 min read</p>
                      <h3 className="text-lg font-bold text-slate-900 mt-2 hover:text-amber-600 transition-colors">
                        The Rise of One-Person $1M SaaS Micro-Startups
                      </h3>
                      <p className="text-slate-600 text-xs mt-3 line-clamp-3">
                        How solo founders are leveraging modular AI platforms to manage marketing, SEO, and development simultaneously.
                      </p>
                    </div>
                  </div>
                  <div className="px-6 pb-6">
                    <a href="#" className="text-xs font-bold text-amber-600 hover:underline inline-flex items-center gap-1">
                      Read Article <i className="fa-solid fa-chevron-right text-[10px]" aria-hidden="true" />
                    </a>
                  </div>
                </article>

                <article className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                  <div>
                    <div className="h-44 bg-slate-800 flex items-center justify-center text-slate-400 relative">
                      <i className="fa-solid fa-laptop-code text-4xl" aria-hidden="true" />
                      <span className="absolute top-3 left-3 bg-purple-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-md uppercase">Software</span>
                    </div>
                    <div className="p-6">
                      <p className="text-xs text-slate-400 font-medium">July 30, 2026 • 3 min read</p>
                      <h3 className="text-lg font-bold text-slate-900 mt-2 hover:text-purple-600 transition-colors">
                        Next-Gen Web Frameworks: What Developers Need to Know
                      </h3>
                      <p className="text-slate-600 text-xs mt-3 line-clamp-3">
                        Exploring edge rendering, automated API generation, and real-time data sync in modern web stacks.
                      </p>
                    </div>
                  </div>
                  <div className="px-6 pb-6">
                    <a href="#" className="text-xs font-bold text-purple-600 hover:underline inline-flex items-center gap-1">
                      Read Article <i className="fa-solid fa-chevron-right text-[10px]" aria-hidden="true" />
                    </a>
                  </div>
                </article>
              </div>
            </div>
          </section>

          {/* BLOG SECTION */}
          <section id="blog" className="py-20 bg-white border-t border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-2xl mx-auto mb-12">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Tutorials &amp; Guides</span>
                <h2 className="text-3xl font-extrabold text-slate-900 mt-1">Popular Growth Blogs</h2>
                <p className="mt-2 text-slate-600 text-sm">Actionable guides on SEO, programming, and AI workflow automation.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <a href="#" className="p-6 rounded-2xl border border-slate-200 hover:border-blue-500 hover:shadow-lg transition-all group">
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full uppercase">SEO Guide</span>
                  <h3 className="font-bold text-slate-900 text-base mt-3 group-hover:text-blue-600 transition-colors">How to Rank in AI Search Engines (GEO)</h3>
                  <p className="text-xs text-slate-500 mt-2">Step-by-step framework to optimize your site for Perplexity, ChatGPT, and AI overviews.</p>
                </a>

                <a href="#" className="p-6 rounded-2xl border border-slate-200 hover:border-blue-500 hover:shadow-lg transition-all group">
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full uppercase">Checklist</span>
                  <h3 className="font-bold text-slate-900 text-base mt-3 group-hover:text-emerald-600 transition-colors">The Ultimate 2026 Technical SEO Audit Checklist</h3>
                  <p className="text-xs text-slate-500 mt-2">Find and fix indexing issues, broken links, and slow Core Web Vitals quickly.</p>
                </a>

                <a href="#" className="p-6 rounded-2xl border border-slate-200 hover:border-blue-500 hover:shadow-lg transition-all group">
                  <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full uppercase">Programming</span>
                  <h3 className="font-bold text-slate-900 text-base mt-3 group-hover:text-purple-600 transition-colors">Building Scalable Apps with Next.js &amp; Tailwind</h3>
                  <p className="text-xs text-slate-500 mt-2">A practical developer guide to clean component structures and server actions.</p>
                </a>
              </div>
            </div>
          </section>

          {/* WHY BAZCLICK SECTION */}
          <section className="py-20 bg-slate-900 text-white border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-2xl mx-auto mb-16">
                <h2 className="text-3xl font-extrabold sm:text-4xl">Why Choose BazClick?</h2>
                <p className="mt-3 text-slate-400 text-sm sm:text-base">Designed for builders, marketers, and businesses who value velocity.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="p-8 rounded-2xl bg-slate-800/60 border border-slate-700/80 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center mx-auto mb-6 text-2xl">
                    <i className="fa-solid fa-clock-rotate-left" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Save Time</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Eliminate context switching. Access AI generation, SEO audits, and industry news from one centralized browser tab.
                  </p>
                </div>

                <div className="p-8 rounded-2xl bg-slate-800/60 border border-slate-700/80 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6 text-2xl">
                    <i className="fa-solid fa-rocket" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Grow Faster</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Data-backed tools engineered specifically to boost search rankings, organic audience acquisition, and user conversion.
                  </p>
                </div>

                <div className="p-8 rounded-2xl bg-slate-800/60 border border-slate-700/80 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center mx-auto mb-6 text-2xl">
                    <i className="fa-solid fa-gears" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Build Smarter</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Leverage modular AI automation and ethical data insights to streamline repetitive technical workflows.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ROADMAP SECTION */}
          <section id="roadmap" className="py-20 bg-slate-50 border-t border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-2xl mx-auto mb-16">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Future Vision</span>
                <h2 className="text-3xl font-extrabold text-slate-900 mt-1">Ecosystem Roadmap</h2>
                <p className="mt-2 text-slate-600 text-sm">Transparent view of our current release cycle and future platform milestones.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="p-8 bg-white rounded-2xl border-2 border-blue-500 shadow-md relative">
                  <span className="absolute top-4 right-4 bg-blue-500 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">Live Now</span>
                  <h3 className="text-xl font-bold text-slate-900 mb-4">Phase 1: Foundation</h3>
                  <ul className="space-y-3 text-sm text-slate-600">
                    <li className="flex items-center gap-2.5"><i className="fa-solid fa-circle-check text-blue-600" aria-hidden="true" /> AI Productivity Tools</li>
                    <li className="flex items-center gap-2.5"><i className="fa-solid fa-circle-check text-blue-600" aria-hidden="true" /> SEO Audit &amp; Keyword Suite</li>
                    <li className="flex items-center gap-2.5"><i className="fa-solid fa-circle-check text-blue-600" aria-hidden="true" /> Tech &amp; AI News Engine</li>
                    <li className="flex items-center gap-2.5"><i className="fa-solid fa-circle-check text-blue-600" aria-hidden="true" /> Jobs &amp; Talent Board</li>
                  </ul>
                </div>

                <div className="p-8 bg-white rounded-2xl border border-slate-200 shadow-sm relative">
                  <span className="absolute top-4 right-4 bg-purple-100 text-purple-700 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">In Development</span>
                  <h3 className="text-xl font-bold text-slate-900 mb-4">Phase 2: Expansion</h3>
                  <ul className="space-y-3 text-sm text-slate-600">
                    <li className="flex items-center gap-2.5"><i className="fa-solid fa-spinner text-purple-600 animate-spin" aria-hidden="true" /> Digital Products Marketplace</li>
                    <li className="flex items-center gap-2.5"><i className="fa-solid fa-clock text-slate-400" aria-hidden="true" /> Autonomous AI Workflow Agents</li>
                    <li className="flex items-center gap-2.5"><i className="fa-solid fa-clock text-slate-400" aria-hidden="true" /> Developer REST &amp; GraphQL APIs</li>
                  </ul>
                </div>

                <div className="p-8 bg-white rounded-2xl border border-slate-200 shadow-sm relative">
                  <span className="absolute top-4 right-4 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">Planned</span>
                  <h3 className="text-xl font-bold text-slate-900 mb-4">Phase 3: Scale</h3>
                  <ul className="space-y-3 text-sm text-slate-600">
                    <li className="flex items-center gap-2.5"><i className="fa-solid fa-clock text-slate-400" aria-hidden="true" /> Creator &amp; Developer Community</li>
                    <li className="flex items-center gap-2.5"><i className="fa-solid fa-clock text-slate-400" aria-hidden="true" /> Mobile Apps (iOS &amp; Android)</li>
                    <li className="flex items-center gap-2.5"><i className="fa-solid fa-clock text-slate-400" aria-hidden="true" /> Enterprise Custom Solutions</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* NEWSLETTER SECTION */}
          <section className="py-16 bg-blue-600 text-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl font-extrabold">Stay Updated with BazClick</h2>
              <p className="mt-3 text-blue-100 text-sm sm:text-base">
                Get weekly digests of top AI tools, SEO strategies, remote job postings, and tech news directly in your inbox.
              </p>

              <form className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-lg mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email address..."
                  required
                  aria-label="Email address for newsletter"
                  className="w-full px-4 py-3.5 rounded-xl bg-white text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-md"
                />
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition-all shadow-md shrink-0"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </section>
        </main>

        {/* FOOTER */}
        <footer className="bg-slate-900 text-slate-400 py-16 border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
              <div className="col-span-2">
                <a href="#" className="flex items-center gap-2 text-xl font-extrabold text-white">
                  <span className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-sm">
                    <i className="fa-solid fa-bolt" aria-hidden="true" />
                  </span>
                  <span>Baz<span className="text-blue-500">Click</span></span>
                </a>
                <p className="mt-4 text-xs text-slate-400 leading-relaxed max-w-sm">
                  The all-in-one AI platform for marketers, developers, freelancers, and growing businesses.
                </p>
                <div className="mt-6 flex items-center gap-4 text-slate-400 text-base">
                  <a href="#" aria-label="Twitter" className="hover:text-white transition-colors"><i className="fa-brands fa-twitter" aria-hidden="true" /></a>
                  <a href="#" aria-label="LinkedIn" className="hover:text-white transition-colors"><i className="fa-brands fa-linkedin" aria-hidden="true" /></a>
                  <a href="#" aria-label="GitHub" className="hover:text-white transition-colors"><i className="fa-brands fa-github" aria-hidden="true" /></a>
                  <a href="#" aria-label="Discord" className="hover:text-white transition-colors"><i className="fa-brands fa-discord" aria-hidden="true" /></a>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-white uppercase tracking-wider mb-4">Products</p>
                <ul className="space-y-2.5 text-xs">
                  <li><a href="#ai-tools" className="hover:text-white transition-colors">AI Writer</a></li>
                  <li><a href="#ai-tools" className="hover:text-white transition-colors">AI Generator</a></li>
                  <li><a href="#seo-suite" className="hover:text-white transition-colors">SEO Suite</a></li>
                  <li><a href="#data-tools" className="hover:text-white transition-colors">Data Tools</a></li>
                  <li><a href="#jobs" className="hover:text-white transition-colors">Remote Jobs</a></li>
                </ul>
              </div>

              <div>
                <p className="text-xs font-bold text-white uppercase tracking-wider mb-4">Resources</p>
                <ul className="space-y-2.5 text-xs">
                  <li><a href="#news" className="hover:text-white transition-colors">Global News</a></li>
                  <li><a href="#blog" class="hover:text-white transition-colors">Growth Blog</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                  <li><a href="#roadmap" className="hover:text-white transition-colors">Public Roadmap</a></li>
                </ul>
              </div>

              <div>
                <p className="text-xs font-bold text-white uppercase tracking-wider mb-4">Developers</p>
                <ul className="space-y-2.5 text-xs">
                  <li><a href="#" className="hover:text-white transition-colors">API Docs</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">GitHub Repo</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">System Status</a></li>
                </ul>
              </div>

              <div>
                <p className="text-xs font-bold text-white uppercase tracking-wider mb-4">Legal &amp; Support</p>
                <ul className="space-y-2.5 text-xs">
                  <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Compliance</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                </ul>
              </div>
            </div>

            {/* SEO FOOTER STRUCTURE */}
            <div className="border-t border-slate-800 pt-8 mt-8">
              <div className="text-[11px] text-slate-500 space-y-3">
                <h2 className="text-xs font-semibold text-slate-400">
                  AI Tools, SEO Software, Jobs, News &amp; Business Growth Platform
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                  <div><strong className="font-medium text-slate-400">AI Tools:</strong> Free AI generator, AI content writer, code assistant.</div>
                  <div><strong className="font-medium text-slate-400">SEO Analysis Platform:</strong> Keyword research, backlink audit, technical SEO.</div>
                  <div><strong className="font-medium text-slate-400">Data Research Tools:</strong> Responsible public web extraction &amp; CSV export.</div>
                  <div><strong className="font-medium text-slate-400">Latest Technology News:</strong> Daily AI, tech startup, and SaaS industry updates.</div>
                  <div><strong className="font-medium text-slate-400">Remote Jobs:</strong> Connect with global tech companies and post jobs.</div>
                  <div><strong className="font-medium text-slate-400">Digital Marketing Resources:</strong> Tutorials, Next.js guides, and GEO guides.</div>
                </div>
                <p className="pt-4 text-center text-slate-600">© 2026 BazClick. All rights reserved. Built for growth.</p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}