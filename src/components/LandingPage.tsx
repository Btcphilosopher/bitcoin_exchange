/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { 
  Shield, 
  ArrowRight, 
  Lock, 
  Layers, 
  Building2, 
  Cpu, 
  Activity, 
  TrendingUp, 
  Globe, 
  UserPlus, 
  FileText
} from 'lucide-react';
import { motion } from 'motion/react';

interface LandingPageProps {
  btcPrice: number;
  prevBtcPrice: number;
  onEnterApp: () => void;
  onOpenSettings: () => void;
}

export default function LandingPage({ btcPrice, prevBtcPrice, onEnterApp, onOpenSettings }: LandingPageProps) {
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [volatility, setVolatility] = useState(14.8);

  // Micro-fluctuations for volatility visual feedback
  useEffect(() => {
    const timer = setInterval(() => {
      setVolatility(prev => {
        const offset = (Math.random() - 0.5) * 0.4;
        return Number(Math.max(10, Math.min(25, prev + offset)).toFixed(2));
      });
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full flex-grow relative flex flex-col justify-between py-12 px-4 md:px-12 lg:px-24 text-[#e2e8f0] overflow-hidden">
      {/* Absolute Tech Grid Background Pattern */}
      <div className="absolute inset-0 terminal-grid pointer-events-none opacity-20"></div>
      
      {/* Main Column */}
      <div className="max-w-6xl mx-auto w-full z-10 space-y-16">
        
        {/* HERO SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center pt-8">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-4">
              {/* Sovereign Tag */}
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-[#D4AF37]/20 rounded-full text-[#D4AF37] font-mono text-[10px] tracking-widest uppercase">
                <span className="w-1.5 h-1.5 bg-[#00D1FF] rounded-full animate-ping"></span>
                Sovereign Digital Asset Custody
              </div>
              
              <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl tracking-tight text-white leading-[1.1]">
                Trade Bitcoin with <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-emerald-200 to-cyan-400">
                  institutional precision
                </span>.
              </h1>
              
              <p className="text-gray-400 font-sans max-w-lg text-sm md:text-base leading-relaxed">
                Rebuilding Sovereign British and Global Bitcoin trade routes. A fusion of City of London risk discipline, modern cryptographic shielding, and elite ultra-low latency execution modules.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button
                onClick={onEnterApp}
                className="px-8 py-3.5 bg-[#D4AF37] hover:bg-amber-400 text-[#05070A] font-semibold text-xs tracking-wider uppercase rounded-sm transition duration-300 transform shadow-[0_4px_20px_rgba(212,175,55,0.15)] flex items-center justify-center gap-2 group cursor-pointer"
                id="btn-start-trading"
              >
                <span>Enter Trading Terminal</span>
                <ArrowRight className="w-4 h-4 transition duration-300 group-hover:translate-x-1" />
              </button>
              
              <button
                onClick={onOpenSettings}
                className="px-6 py-3.5 border border-white/5 hover:border-[#D4AF37]/30 bg-[#0E121A]/50 hover:bg-white/10 text-[#E0E2E5] font-semibold text-xs tracking-wider uppercase rounded-sm transition duration-300 flex items-center justify-center gap-2 cursor-pointer"
                id="btn-create-account"
              >
                <UserPlus className="w-4 h-4 text-[#00D1FF]" />
                <span>Verify Credential / KYC</span>
              </button>
            </div>

            {/* Live system state block */}
            <div className="border-t border-white/5 pt-6 grid grid-cols-3 gap-6 font-mono text-[11px] text-gray-500">
              <div>
                <span className="block text-gray-400 uppercase text-[9px] tracking-widest mb-1 font-sans">Cold Storage</span>
                <span className="text-[#00FF94] font-semibold text-[13px]">99.85% Secured</span>
              </div>
              <div>
                <span className="block text-gray-400 uppercase text-[9px] tracking-widest mb-1 font-sans">Audit Trail</span>
                <span className="text-white font-medium">Real-time Public Ledger</span>
              </div>
              <div>
                <span className="block text-gray-400 uppercase text-[9px] tracking-widest mb-1 font-sans">Jurisdiction</span>
                <span className="text-[#D4AF37] font-semibold uppercase tracking-wider">UK FCA Compliant</span>
              </div>
            </div>
          </div>

          {/* Hero Right Visuals: Interactive Bloomberg-style terminal panel */}
          <div className="lg:col-span-5 relative">
            <div className="absolute inset-x-0 -top-10 -bottom-10 bg-gradient-to-r from-[#00D1FF]/5 to-transparent blur-3xl rounded-full"></div>
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="terminal-card rounded border border-white/10 p-6 space-y-6 relative overflow-hidden"
              id="hero-ticker-box"
            >
              {/* Scanline lines in mockup */}
              <div className="absolute inset-0 terminal-scanlines pointer-events-none opacity-[0.03]"></div>
              
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="font-mono text-[10px] tracking-wider text-gray-400">CORE BTC/USDT TICKER FEED</span>
                </div>
                <span className="font-mono text-[9px] text-amber-500 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.2 rounded uppercase">SDR Active</span>
              </div>

              {/* Massive Sovereign Ticker Price Display */}
              <div className="space-y-1">
                <div className="text-[10px] uppercase font-mono tracking-widest text-[#00D1FF]/70 text-left">
                  Sovereign Price Settlement
                </div>
                <div className="flex items-baseline gap-2 overflow-hidden">
                  <motion.span 
                    key={btcPrice}
                    initial={{ opacity: 0.85, y: -2 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`font-mono text-4xl md:text-5xl font-bold tracking-tight select-none font-mono-numbers leading-none ${
                      btcPrice > prevBtcPrice 
                        ? 'text-[#00FF94]' 
                        : btcPrice < prevBtcPrice 
                        ? 'text-[#FF3B3B]' 
                        : 'text-white'
                    }`}
                  >
                    ${btcPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </motion.span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400 font-mono pt-1">
                  <span className="text-[#00FF94] font-semibold flex items-center">▲ +$2,142.10 (3.42%)</span>
                  <span>24h Change</span>
                </div>
              </div>

              {/* Live Miniature Chart Mockup inside Ticker Card */}
              <div className="h-20 flex items-end gap-[3px] pt-4" id="mini-chart-home">
                {Array.from({ length: 24 }).map((_, idx) => {
                  const height = 40 + Math.sin(idx * 0.4) * 20 + (idx * 1.2);
                  const isUp = idx === 0 || height >= (35 + Math.sin((idx - 1) * 0.4) * 20 + ((idx - 1) * 1.2));
                  return (
                    <div key={idx} className="flex-1 flex flex-col justify-end h-full">
                      <div 
                        style={{ height: `${height}%` }}
                        className={`w-full rounded-xs transition-all duration-500 ${
                          isUp 
                            ? 'bg-[#00FF94]/45 hover:bg-[#00FF94]' 
                            : 'bg-[#FF3B3B]/45 hover:bg-[#FF3B3B]'
                        }`}
                      ></div>
                    </div>
                  );
                })}
              </div>

              {/* Order depth summary visual */}
              <div className="pt-4 border-t border-white/5 space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono text-gray-500">
                  <span>LIQUIDITY CLUSTERS</span>
                  <span className="text-[#00D1FF] uppercase">Aethel Aggregator</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-[11px] font-mono">
                  <div className="bg-[#00FF94]/5 p-2 rounded border border-[#00FF94]/10 text-left">
                    <span className="text-gray-400 block text-[9px] uppercase">Institutional Bids</span>
                    <span className="text-[#00FF94] font-semibold font-mono-numbers">145,204.10 USDT</span>
                  </div>
                  <div className="bg-[#FF3B3B]/5 p-2 rounded border border-[#FF3B3B]/10 text-left">
                    <span className="text-gray-400 block text-[9px] uppercase">Institutional Asks</span>
                    <span className="text-[#FF3B3B] font-semibold font-mono-numbers">182,410.90 USDT</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* MARKET SNAPSHOT PANEL */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#D4AF37]">Live Sovereign Quotes</span>
            <span className="text-xs font-mono text-gray-500">Updates every 3s</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="home-market-snapshot">
            {/* Card 1: BTC / USDT */}
            <div className="terminal-card rounded p-4 flex flex-col justify-between h-28 border border-white/5 hover:border-white/10 transition">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase text-gray-400">BTC / USDT</span>
                <span className="text-[#00FF94] text-[10px] font-mono">+3.42%</span>
              </div>
              <div className="text-lg font-mono font-semibold text-white font-mono-numbers">
                ${btcPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] text-gray-500 font-mono uppercase tracking-wider flex justify-between">
                <span>Spread: 0.01%</span>
                <span className="text-[#D4AF37]">London Spot</span>
              </div>
            </div>

            {/* Card 2: USDT / BTC */}
            <div className="terminal-card rounded p-4 flex flex-col justify-between h-28 border border-white/5 hover:border-white/10 transition">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase text-gray-400">USDT / BTC</span>
                <span className="text-[#FF3B3B] text-[10px] font-mono">-3.30%</span>
              </div>
              <div className="text-lg font-mono font-semibold text-white font-mono-numbers">
                {(1 / btcPrice).toFixed(8)}
              </div>
              <div className="text-[10px] text-gray-500 font-mono uppercase tracking-wider flex justify-between">
                <span>Direct Sat/USDT</span>
                <span className="text-[#00D1FF]">Sovereign Direct</span>
              </div>
            </div>

            {/* Card 3: Market Volatility INDEX */}
            <div className="terminal-card rounded p-4 flex flex-col justify-between h-28 border border-white/5 hover:border-white/10 transition">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase text-gray-400">Vol Index (ÆVI)</span>
                <span className="text-cyan-400 text-[10px] font-mono">Moderate</span>
              </div>
              <div className="text-lg font-mono font-semibold text-white font-mono-numbers">
                {volatility}%
              </div>
              <div className="text-[10px] text-gray-500 font-mono uppercase tracking-wider flex justify-between">
                <span>24h Range: 11-18%</span>
                <span className="text-teal-400">UK Benchmarked</span>
              </div>
            </div>

            {/* Card 4: 24h Global Volume */}
            <div className="terminal-card rounded p-4 flex flex-col justify-between h-28 border border-white/5 hover:border-white/10 transition">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase text-gray-400">24H SETTLEMENT VOL</span>
                <span className="text-emerald-500 text-[10px] font-mono">Liquid</span>
              </div>
              <div className="text-lg font-mono font-semibold text-white font-mono-numbers">
                $38.42B
              </div>
              <div className="text-[10px] text-gray-500 font-mono uppercase tracking-wider flex justify-between">
                <span>Bilateral Swaps</span>
                <span className="text-emerald-500">Node Sovereign</span>
              </div>
            </div>
          </div>
        </div>

        {/* TRUST & CRYPTOGRAPHIC COMPLIANCE DETAILS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="terminal-card rounded p-5 space-y-3 col-span-1 border border-white/5 hover:border-white/10 transition text-left">
            <div className="w-10 h-10 bg-amber-500/15 border border-amber-500/20 rounded flex items-center justify-center text-amber-400">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-white">Cold storage (99.85%)</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Our core custodian system stores digital assets across four vaults underneath the United Kingdom. Protected inside physical concrete-reinforced nuclear bunkers with multi-signature keys held on specialized HSM physical chips. No hot connection exposure.
            </p>
          </div>

          <div className="terminal-card rounded p-5 space-y-3 col-span-1 border border-white/5 hover:border-white/10 transition text-left">
            <div className="w-10 h-10 bg-cyan-500/15 border border-cyan-500/20 rounded flex items-center justify-center text-cyan-400">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-white">UK Regulatory Escrow</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              We align with strict British statutory financial compliance standards. Customer fiat balances are securely partitioned from exchange operational capitals within tier-1 London institutions under statutory trust arrangements.
            </p>
          </div>

          <div className="terminal-card rounded p-5 space-y-3 col-span-1 border border-white/5 hover:border-white/10 transition text-left">
            <div className="w-10 h-10 bg-[#00D1FF]/15 border border-[#00D1FF]/20 rounded flex items-center justify-center text-[#00D1FF]">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-white">Aethel Block Trading engine</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Engineered with extreme parallelism compiling directly to native kernel routines, delivering block order executions in average times below 140 microseconds. Connected to six liquidity pools for instant deep execution.
            </p>
          </div>
        </div>

        {/* Regulatory badge footer layout */}
        <div className="flex flex-wrap items-center justify-between border-t border-white/5 pt-8 gap-6 text-[10px] font-mono text-gray-500 select-none pb-8">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition">
              <Building2 className="w-4 h-4 text-[#D4AF37]" />
              <span>CITY OF LONDON FINANCIAL BADGE</span>
            </div>
            <div className="flex items-center gap-1.5 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition">
              <SecurityIcon />
              <span>FCA CRYPTOREGISTER v22</span>
            </div>
            <div className="flex items-center gap-1.5 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition">
              <Layers className="w-4 h-4 text-[#00D1FF]" />
              <span>ISOMORPHIC PROTOCOL V3</span>
            </div>
          </div>
          <div>
            <span>SOVEREIGN DIGITAL INFRASTRUCTURE PARTNERSHIP</span>
          </div>
        </div>

      </div>
    </div>
  );
}

// Simple security icon
function SecurityIcon() {
  return (
    <svg className="w-4 h-4 text-[#00D1FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}
