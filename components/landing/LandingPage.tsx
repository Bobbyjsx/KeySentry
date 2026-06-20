"use client"

import Link from "next/link"
import { Shield, ArrowRight, Lock, Database, Bell, Activity } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-canvas text-white font-sans flex flex-col relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute -left-48 top-1/4 h-[500px] w-[500px] rounded-full bg-accent-sunset/5 blur-[120px] pointer-events-none" />
      <div className="absolute -right-48 top-1/3 h-[500px] w-[500px] rounded-full bg-accent-twilight/5 blur-[120px] pointer-events-none" />

      {/* Header / Nav Bar */}
      <header className="sticky top-0 z-40 bg-canvas/80 backdrop-blur-md border-b border-hairline py-4 px-6 md:px-8 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-pill border border-hairline bg-canvas-soft">
            <Shield className="h-4 w-4 text-white" />
          </div>
          <span className="text-caption-mono font-mono uppercase text-white tracking-caption-mono">
            KEYSENTRY // SYSTEM
          </span>
        </div>

        <nav className="flex items-center space-x-4">
          <Link
            href="/auth/login"
            className="text-caption-mono-sm font-mono uppercase text-gray-400 hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/auth/signup"
            className="rounded-pill border border-white bg-white px-4 py-1.5 font-mono text-xs uppercase text-canvas hover:bg-canvas hover:text-white transition-colors"
          >
            Sign Up
          </Link>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 md:px-8 py-16 md:py-24 space-y-24">
        {/* Hero Section */}
        <section className="text-center space-y-6 max-w-4xl mx-auto py-8">
          <span className="text-caption-mono font-mono uppercase text-accent-sunset tracking-caption-mono block">
            01 / CREDENTIAL MONITORING
          </span>
          <h1 className="text-display-lg font-normal text-white tracking-display-lg leading-tight lowercase">
            exposed secrets are public vulnerabilities.
          </h1>
          <p className="text-body-lg text-gray-400 max-w-2xl mx-auto">
            KeySentry is an engineered credential scanner. It watches your source code in real-time, matching patterns against a known cryptographic signature registry to intercept leaks before they are indexed by hostile actors.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <Link
              href="/auth/signup"
              className="flex items-center space-x-2 rounded-pill border border-white bg-white px-6 py-3 font-mono text-xs uppercase text-canvas hover:bg-canvas hover:text-white transition-colors w-full sm:w-auto justify-center"
            >
              <span>Begin Setup</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/auth/login"
              className="rounded-pill border border-hairline bg-canvas px-6 py-3 font-mono text-xs uppercase text-white hover:bg-canvas-soft transition-colors w-full sm:w-auto text-center"
            >
              Access Portal
            </Link>
          </div>
        </section>

        {/* Scan Details Mockup Preview */}
        <section className="max-w-5xl mx-auto">
          <div className="relative rounded-sm border border-hairline overflow-hidden bg-canvas-card group">
            {/* Ambient background glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-accent-sunset/5 via-transparent to-accent-twilight/5 opacity-50 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <img
              src="/details-screenshot.jpg"
              alt="KeySentry Scan Session Details dashboard screenshot"
              className="w-full h-auto object-cover relative z-10 transition-transform duration-500 group-hover:scale-[1.005]"
            />
          </div>
        </section>

        {/* Telemetry/Metrics Grid */}
        <section className="space-y-12">
          <div className="text-center space-y-2">
            <span className="text-caption-mono font-mono uppercase text-accent-dusk tracking-caption-mono block">
              02 / ENGINE PERFORMANCE
            </span>
            <h2 className="text-display-md font-normal text-white tracking-display-md lowercase">
              scanning speed at scale.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-canvas-card border border-hairline p-6 rounded-sm">
              <span className="text-caption-mono-sm font-mono uppercase text-gray-500 block">TARGET SOURCES</span>
              <div className="mt-4 text-display-sm font-normal text-white tracking-display-sm">01</div>
            </div>
            <div className="bg-canvas-card border border-hairline p-6 rounded-sm">
              <span className="text-caption-mono-sm font-mono uppercase text-gray-500 block">MONITORED REPOS</span>
              <div className="mt-4 text-display-sm font-normal text-white tracking-display-sm">24</div>
            </div>
            <div className="bg-canvas-card border border-hairline p-6 rounded-sm">
              <span className="text-caption-mono-sm font-mono uppercase text-gray-500 block">FILES ANALYZED</span>
              <div className="mt-4 text-display-sm font-normal text-white tracking-display-sm">18,492</div>
            </div>
            <div className="bg-canvas-card border border-hairline p-6 rounded-sm">
              <span className="text-caption-mono-sm font-mono uppercase text-gray-500 block">TIME TO DISCOVERY</span>
              <div className="mt-4 text-display-sm font-normal text-white tracking-display-sm">0.8s</div>
            </div>
            <div className="bg-canvas-card border border-hairline p-6 rounded-sm">
              <span className="text-caption-mono-sm font-mono uppercase text-gray-500 block">KEYS EXPOSED</span>
              <div className="mt-4 text-display-sm font-normal text-accent-sunset tracking-display-sm">00</div>
            </div>
          </div>
        </section>

        {/* Features / Capabilities Section */}
        <section className="space-y-12">
          <div className="text-center space-y-2">
            <span className="text-caption-mono font-mono uppercase text-accent-breeze tracking-caption-mono block">
              03 / CORE CAPABILITIES
            </span>
            <h2 className="text-display-md font-normal text-white tracking-display-md lowercase">
              continuous protection. instant alerts.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Feature 1 */}
            <div className="bg-canvas-card border border-hairline p-8 rounded-sm relative overflow-hidden group hover:border-white/30 transition-colors">
              <div className="absolute -right-12 -top-12 h-24 w-24 rounded-full bg-accent-sunset/10 blur-xl pointer-events-none" />
              <div className="flex h-10 w-10 items-center justify-center rounded-pill border border-hairline bg-canvas-soft mb-6 text-accent-sunset">
                <Lock className="h-5 w-5" />
              </div>
              <span className="text-caption-mono-sm font-mono uppercase text-accent-sunset mb-2 block">SECURE INGESTION</span>
              <h3 className="text-display-xs font-normal text-white mb-2 lowercase">read-only token integrations</h3>
              <p className="text-body-sm text-gray-400">
                Authenticate with classic (ghp_) or fine-grained (github_pat_) tokens. The KeySentry engine runs real-time scope checks on your access credentials, validating scopes locally and maintaining fully encrypted token states.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-canvas-card border border-hairline p-8 rounded-sm relative overflow-hidden group hover:border-white/30 transition-colors">
              <div className="absolute -right-12 -top-12 h-24 w-24 rounded-full bg-accent-twilight/10 blur-xl pointer-events-none" />
              <div className="flex h-10 w-10 items-center justify-center rounded-pill border border-hairline bg-canvas-soft mb-6 text-accent-twilight">
                <Database className="h-5 w-5" />
              </div>
              <span className="text-caption-mono-sm font-mono uppercase text-accent-twilight mb-2 block">REGISTRY INDEX</span>
              <h3 className="text-display-xs font-normal text-white mb-2 lowercase">exposed key signatures database</h3>
              <p className="text-body-sm text-gray-400">
                Scan source repositories using an extensible pattern library. Identify credentials belonging to providers such as AWS, Stripe, GitHub, and Slack, mapped to specific risk levels ranging from low to critical.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-canvas-card border border-hairline p-8 rounded-sm relative overflow-hidden group hover:border-white/30 transition-colors">
              <div className="absolute -right-12 -top-12 h-24 w-24 rounded-full bg-accent-breeze/10 blur-xl pointer-events-none" />
              <div className="flex h-10 w-10 items-center justify-center rounded-pill border border-hairline bg-canvas-soft mb-6 text-accent-breeze">
                <Bell className="h-5 w-5" />
              </div>
              <span className="text-caption-mono-sm font-mono uppercase text-accent-breeze mb-2 block">ALERT ROUTING</span>
              <h3 className="text-display-xs font-normal text-white mb-2 lowercase">slack and email notifications</h3>
              <p className="text-body-sm text-gray-400">
                Route discovery events instantly to custom notification targets. Receive critical alerts via direct email or configure incoming Slack webhooks to push compromise logs to security channels.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-canvas-card border border-hairline p-8 rounded-sm relative overflow-hidden group hover:border-white/30 transition-colors">
              <div className="absolute -right-12 -top-12 h-24 w-24 rounded-full bg-accent-dusk/10 blur-xl pointer-events-none" />
              <div className="flex h-10 w-10 items-center justify-center rounded-pill border border-hairline bg-canvas-soft mb-6 text-accent-dusk">
                <Activity className="h-5 w-5" />
              </div>
              <span className="text-caption-mono-sm font-mono uppercase text-accent-dusk mb-2 block">SCAN REPLAYS</span>
              <h3 className="text-display-xs font-normal text-white mb-2 lowercase">instant historical verification</h3>
              <p className="text-body-sm text-gray-400">
                Re-evaluate scan histories with a single action. Replay previous scans on modified codebases to immediately verify credential revocation and check active remediation states.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-hairline bg-canvas text-gray-500 py-12 px-6 md:px-8 text-center text-body-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} KeySentry. Cosmic-Scientific Credential Security.</p>
          <span className="text-caption-mono-sm font-mono uppercase text-gray-600 tracking-caption-mono-sm">
            UNMARKETED ENGINE
          </span>
        </div>
      </footer>
    </div>
  )
}
