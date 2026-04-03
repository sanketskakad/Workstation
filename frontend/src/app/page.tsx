"use client";

import Link from "next/link";
import {
  ArrowRight,
  Zap,
  Shield,
  BarChart3,
  Globe,
  Command,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#ffffff] dark:bg-[#020617] text-slate-900 dark:text-slate-100 selection:bg-brand-500/30 selection:text-brand-900 overflow-hidden">
      {/* Abstract Background Element */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-brand-50/50 to-transparent dark:from-brand-900/10 pointer-events-none -z-10" />

      {/* Navigation */}
      <nav className="mx-auto max-w-7xl px-6 py-8 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 shadow-glow">
            <Command className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Workstation
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-500 dark:text-slate-400">
          <a href="#features" className="hover:text-brand-600 transition">
            Features
          </a>
          <a href="#" className="hover:text-brand-600 transition">
            Solutions
          </a>
          <a href="#" className="hover:text-brand-600 transition">
            Pricing
          </a>
        </div>
        <div>
          <Link
            href="/register"
            className="inline-flex h-11 items-center justify-center rounded-full bg-slate-900 dark:bg-white px-6 text-sm font-semibold text-white dark:text-slate-900 transition hover:scale-105 active:scale-95"
          >
            Register
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative mx-auto max-w-7xl px-6 pt-16 pb-24 text-center lg:pt-32">
        <div className="inline-flex items-center gap-2 rounded-full border border-brand-100 dark:border-brand-900/30 bg-brand-50/50 dark:bg-brand-900/10 px-3 py-1 text-xs font-bold text-brand-700 dark:text-brand-300 backdrop-blur-sm">
          <span className="flex h-1.5 w-1.5 rounded-full bg-brand-500 animate-workstation" />
          Production-Ready Infrastructure for Global Teams
        </div>

        <h1 className="mt-10 text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-7xl lg:text-8xl">
          The command center <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-500 dark:from-brand-400 dark:to-indigo-300">
            for elite engineering.
          </span>
        </h1>

        <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-slate-600 dark:text-slate-400 sm:text-xl font-medium">
          Workstation orchestrates your entire development lifecycle with
          high-density Kanban boards, real-time telemetry, and enterprise-grade
          security.
        </p>

        <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/register"
            className="group relative inline-flex h-14 items-center justify-center gap-2 overflow-hidden rounded-full bg-brand-600 px-10 text-base font-bold text-white shadow-premium transition hover:bg-brand-700 active:scale-95"
          >
            Login
            <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
          </Link>
          <div className="text-sm font-bold text-slate-400 flex items-center gap-2">
            <Shield className="h-4 w-4" /> No Credit Card Required
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="border-y border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-950/30 py-12">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-center text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 mb-8">
            Trusted by operational units at
          </p>
          <div className="flex flex-wrap items-center justify-center gap-12 opacity-40 grayscale">
            <span className="text-xl font-black italic tracking-tighter">
              VOLT_CORE
            </span>
            <span className="text-xl font-black italic tracking-tighter">
              PHANTOM_OS
            </span>
            <span className="text-xl font-black italic tracking-tighter">
              NEXUS_LABS
            </span>
            <span className="text-xl font-black italic tracking-tighter">
              AETHER_NET
            </span>
            <span className="text-xl font-black italic tracking-tighter">
              VERTEX_AI
            </span>
          </div>
        </div>
      </section>

      {/* Feature Showcase */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-24 sm:py-32">
        <div className="mb-20 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
            Engineered for Velocity
          </h2>
          <p className="mt-4 text-slate-500 dark:text-slate-400">
            Everything you need to manage complex project lifecycles at scale.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
          <div className="group p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-brand-500/50 transition duration-500 shadow-sm hover:shadow-premium">
            <div className="h-12 w-12 rounded-2xl bg-brand-500/10 flex items-center justify-center text-brand-600 dark:text-brand-400 mb-6 group-hover:scale-110 transition">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Instant Telemetry</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              Every update is streamed via high-speed WebSockets. Real-time
              board synchronization ensures your team never misses a beat.
            </p>
          </div>

          <div className="group p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-emerald-500/50 transition duration-500 shadow-sm hover:shadow-premium">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition">
              <BarChart3 className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Deep Intelligence</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              Drill down into team velocity, cycle times, and risk metrics with
              our advanced analytics engine and AI-driven insights.
            </p>
          </div>

          <div className="group p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-indigo-500/50 transition duration-500 shadow-sm hover:shadow-premium">
            <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 transition">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Hardened Security</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              RBAC (Role Based Access Control), audit logging, and isolated
              workspaces. Built for security-first organizations.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="mx-auto max-w-7xl px-6 py-24 sm:py-32 bg-slate-50 dark:bg-slate-900/20 rounded-[3rem] border border-slate-100 dark:border-slate-800 mb-24">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-4 text-slate-500 dark:text-slate-400">
            Scale your team without the complexity.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-2">
              Individual
            </h3>
            <p className="text-4xl font-black mb-6">
              $0 <span className="text-sm font-medium text-slate-500">/mo</span>
            </p>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="text-sm flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-brand-500" /> 1
                Workstation
              </li>
              <li className="text-sm flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-brand-500" /> Basic Kanban
              </li>
              <li className="text-sm flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-brand-500" /> Shared
                Community
              </li>
            </ul>
            <Button variant="outline" className="w-full">
              Current Plan
            </Button>
          </div>

          <div className="p-8 rounded-[2rem] border-2 border-brand-500 bg-white dark:bg-slate-900 flex flex-col shadow-premium relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-brand-500 text-white text-[10px] font-black px-4 py-1 rounded-bl-xl uppercase tracking-tighter">
              Most Popular
            </div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-brand-600 mb-2">
              Professional
            </h3>
            <p className="text-4xl font-black mb-6">
              $19{" "}
              <span className="text-sm font-medium text-slate-500">/mo</span>
            </p>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="text-sm flex items-center gap-2 font-bold">
                <CheckCircle2 className="h-4 w-4 text-brand-500" /> Unlimited
                Projects
              </li>
              <li className="text-sm flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-brand-500" /> Advanced
                Analytics
              </li>
              <li className="text-sm flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-brand-500" /> AI Task
                Suggestions
              </li>
              <li className="text-sm flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-brand-500" /> Priority
                Support
              </li>
            </ul>
            <Button variant="primary" className="w-full shadow-glow">
              Upgrade Now
            </Button>
          </div>

          <div className="p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-2">
              Enterprise
            </h3>
            <p className="text-4xl font-black mb-6">Custom</p>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="text-sm flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-brand-500" /> Custom
                Deployment
              </li>
              <li className="text-sm flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-brand-500" /> SLA &
                Security Audit
              </li>
              <li className="text-sm flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-brand-500" /> Dedicated
                Manager
              </li>
            </ul>
            <Button variant="outline" className="w-full">
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mx-auto max-w-7xl px-6 py-12 border-t border-slate-100 dark:border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-6">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          © 2026 Workstation Technologies Inc.
        </p>
        <div className="flex items-center gap-8 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          <Link href="#" className="hover:text-brand-600 transition">
            Compliance
          </Link>
          <Link href="#" className="hover:text-brand-600 transition">
            Privacy Protocol
          </Link>
          <Link href="#" className="hover:text-brand-600 transition">
            Global Status
          </Link>
        </div>
      </footer>
    </main>
  );
}
