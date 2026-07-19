import React from 'react';
import { Link } from 'react-router-dom';
import { Wallet, Shield, PieChart, Sparkles, ArrowRight, TrendingUp, CheckCircle } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-[#08090d] text-white overflow-hidden relative">
      
      {/* Dynamic background glow spots */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent-cyan/8 blur-[120px] pointer-events-none" />
      
      {/* Top Header Navigation */}
      <header className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary-500 to-accent-cyan shadow-glow-primary">
            <Wallet className="h-5 w-5 text-white" />
          </div>
          <span className="font-sans text-lg font-bold tracking-tight text-white">
            Smart Expense Tracker
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-semibold text-gray-400 hover:text-white transition">
            Sign In
          </Link>
          <Link to="/signup" className="btn-primary rounded-xl px-4 py-2 text-sm font-semibold text-white">
            Get Started
          </Link>
        </div>
      </header>

      {/* Main Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-20 relative z-10 flex flex-col items-center text-center">
        
        {/* Animated badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-primary-500/20 bg-primary-500/5 px-3.5 py-1 text-xs font-semibold text-primary-300 mb-8 animate-pulse-glow">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Track every rupee. Manage money smarter.</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl leading-[1.1] mb-6">
          Take control of your <br />
          <span className="text-gradient">financial future</span>
        </h1>

        {/* Hero Subtitle */}
        <p className="text-gray-400 text-lg sm:text-xl max-w-2xl font-light mb-10 leading-relaxed">
          Smart Expense Tracker helps you log transactions, categorize spending, set monthly budgets, and analyze your finances with premium charts.
        </p>

        {/* Hero Call to Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-20">
          <Link to="/signup" className="btn-primary rounded-xl px-8 py-4 font-semibold text-white flex items-center justify-center gap-2 text-base">
            Start Tracking Free
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link to="/login" className="btn-secondary rounded-xl px-8 py-4 font-semibold text-white flex items-center justify-center gap-2 text-base">
            Access Dashboard
          </Link>
        </div>

        {/* Interactive UI Mockup */}
        <div className="w-full max-w-5xl rounded-2xl border border-white/10 bg-[#0e0f14]/50 p-3 shadow-glass-lg backdrop-blur-xl relative animate-slide-up">
          <div className="absolute -top-12 -left-12 w-24 h-24 bg-primary-500/20 rounded-full blur-xl pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-accent-cyan/20 rounded-full blur-xl pointer-events-none" />
          
          <div className="rounded-xl border border-white/5 bg-[#08090d]/90 overflow-hidden shadow-inner aspect-[16/9] flex flex-col p-6 text-left">
            {/* Mock Dashboard Shell */}
            <div className="flex justify-between items-center pb-4 border-b border-white/5 mb-6">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/60" />
                <div className="w-3 h-3 rounded-full bg-amber-500/60" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
              </div>
              <div className="text-[11px] text-gray-500 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                demo.smartexpense.app
              </div>
              <div className="w-6" />
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="rounded-xl border border-white/5 bg-white/5 p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Balance</p>
                <h3 className="text-xl sm:text-2xl font-bold mt-1 text-white">₹45,250.00</h3>
                <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" /> +12.5% this month
                </span>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/5 p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Monthly Income</p>
                <h3 className="text-xl sm:text-2xl font-bold mt-1 text-emerald-400">₹62,000.00</h3>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/5 p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Monthly Expense</p>
                <h3 className="text-xl sm:text-2xl font-bold mt-1 text-rose-400">₹16,750.00</h3>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 flex-1">
              <div className="rounded-xl border border-white/5 bg-white/5 p-4 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-gray-400">Recent Transactions</h4>
                  <div className="mt-3 space-y-2.5">
                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <p className="font-semibold text-white">Salary Credit</p>
                        <p className="text-[10px] text-gray-500">Corporate Payout</p>
                      </div>
                      <span className="text-emerald-400 font-semibold">+₹62,000.00</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <p className="font-semibold text-white">Organic Groceries</p>
                        <p className="text-[10px] text-gray-500">Supermarket</p>
                      </div>
                      <span className="text-rose-400 font-semibold">-₹4,250.00</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/5 p-4 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-gray-400">Budget Warning Alerts</h4>
                  <div className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-400">
                    <span className="font-bold">Warning:</span> You have spent 85% of your food category limit.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-6 py-24 relative z-10 border-t border-white/5">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Engineered to optimize your money</h2>
          <p className="text-gray-400 max-w-xl mx-auto font-light">
            Simple enough to log in seconds, powerful enough to track complex budgets.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="glass-card rounded-2xl p-6">
            <div className="h-12 w-12 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-400 mb-6">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Secure & Private</h3>
            <p className="text-sm text-gray-400 leading-relaxed font-light">
              Your financial records are fully encrypted and protected. Access is guarded by industry-standard JWT authentication.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <div className="h-12 w-12 rounded-xl bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center text-accent-cyan mb-6">
              <PieChart className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Beautiful Analytics</h3>
            <p className="text-sm text-gray-400 leading-relaxed font-light">
              Visualize where your rupees flow with responsive, interactive category split pie charts and monthly comparison bar charts.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <div className="h-12 w-12 rounded-xl bg-accent-emerald/10 border border-accent-emerald/20 flex items-center justify-center text-accent-emerald mb-6">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Budget Warnings</h3>
            <p className="text-sm text-gray-400 leading-relaxed font-light">
              Establish monthly limits. Our real-time warning indicators immediately trigger to notify you if you are approaching limits.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-gray-500 text-xs">
        <p>© 2026 Smart Expense Tracker. All rights reserved.</p>
        <p>Built with React, Node.js, Tailwind CSS & Chart.js</p>
      </footer>
    </div>
  );
};

export default Landing;
