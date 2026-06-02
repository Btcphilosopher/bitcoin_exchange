/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { 
  Building, 
  Activity, 
  LayoutDashboard, 
  TrendingUp, 
  Wallet, 
  ShieldCheck, 
  Settings, 
  Clock, 
  Lock, 
  Globe, 
  ChevronRight,
  Menu,
  X,
  Zap,
  ChevronDown
} from 'lucide-react';
import { motion } from 'motion/react';

interface NavigationProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  btcPrice: number;
  priceDirection: 'up' | 'down' | 'flat';
  userEmail: string;
}

export default function Navigation({ 
  currentPage, 
  setCurrentPage, 
  btcPrice, 
  priceDirection,
  userEmail 
}: NavigationProps) {
  const [currentTime, setCurrentTime] = useState<string>('2026-06-02 08:31:20 UTC');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [systemOnline, setSystemOnline] = useState(true);

  // Maintain real-time clock synced to UTC or British Summer Time (London represents beautifully)
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const utcString = now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
      setCurrentTime(utcString);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Trading Terminal', icon: LayoutDashboard },
    { id: 'markets', label: 'Market Explorer', icon: TrendingUp },
    { id: 'wallet', label: 'Sovereign Wallet', icon: Wallet },
    { id: 'analytics', label: 'Portfolio Vault', icon: Activity },
    { id: 'security', label: 'Security Registry', icon: ShieldCheck },
    { id: 'settings', label: 'Key Setup & KYC', icon: Settings },
  ];

  return (
    <>
      {/* Dynamic Header Ticker Banner */}
      <header className="border-b border-white/5 bg-[#080A0F]/95 backdrop-blur-md sticky top-0 z-40 px-4 md:px-6 py-2.5 flex items-center justify-between text-xs transition-colors">
        <div className="flex items-center gap-6 overflow-x-auto no-scrollbar scroll-smooth">
          {/* Brand Logo */}
          <div 
            onClick={() => setCurrentPage('landing')} 
            className="flex items-center gap-2.5 cursor-pointer select-none shrink-0"
            id="brand-logo"
          >
            <div className="relative flex items-center justify-center w-7 h-7 bg-[#D4AF37] rounded-sm">
              <span className="text-[#05070A] font-display font-bold text-sm tracking-tighter">Æ</span>
              {/* Outer neon dot */}
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#00D1FF] animate-pulse"></span>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-semibold tracking-wider text-[#E0E2E5] select-none text-[11px] uppercase">
                ÆTHEL exchange
              </span>
              <span className="text-[9px] text-[#00D1FF]/80 tracking-widest leading-none font-mono uppercase">
                Sovereign Core
              </span>
            </div>
          </div>

          <div className="h-4 w-px bg-white/10 hidden md:block"></div>

          {/* Quick Price Feed */}
          <div className="flex items-center gap-4 text-[11px] font-mono shrink-0">
            <span className="text-gray-400 uppercase tracking-wider">BTC / USDT</span>
            <span className={`font-semibold flex items-center gap-1 transition-all duration-300 ${
              priceDirection === 'up' 
                ? 'text-[#00FF94]' 
                : priceDirection === 'down' 
                ? 'text-[#FF3B3B]' 
                : 'text-[#E0E2E5]'
            }`}>
              ${btcPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              {priceDirection === 'up' && '▲'}
              {priceDirection === 'down' && '▼'}
            </span>
            <span className={`text-[10px] px-1 rounded-sm py-0.2 ${
              priceDirection === 'up' 
                ? 'bg-[#00FF94]/10 text-[#00FF94]' 
                : 'bg-[#FF3B3B]/10 text-[#FF3B3B]'
            }`}>
              +3.42%
            </span>
          </div>

          <div className="h-4 w-px bg-white/10 hidden lg:block"></div>

          {/* Institutional Indicators */}
          <div className="hidden lg:flex items-center gap-5 font-mono text-[10px] text-gray-400 select-none">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00FF94] animate-pulse"></span>
              <span>LONDON VAULT ACTIVE (100% COLD)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#00D1FF]" />
              <span>UK DOMINANCE: 58.4%</span>
            </div>
          </div>
        </div>

        {/* Header Right */}
        <div className="flex items-center gap-4">
          {/* Time & Connectivity */}
          <div className="hidden md:flex items-center gap-3.5 text-gray-400 font-mono text-[10px] select-none text-right">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#D4AF37]/80" />
              <span className="text-[#E0E2E5] font-mono-numbers">{currentTime}</span>
            </div>
            <div className="flex items-center gap-1">
              <Lock className="w-3" />
              <span className="text-[#00FF94] uppercase tracking-widest text-[9px]">ENCRYPTED TLS v1.3</span>
            </div>
          </div>

          {/* User badge */}
          <div 
            onClick={() => setCurrentPage('settings')} 
            className="flex items-center gap-2 cursor-pointer bg-white/5 border border-white/10 hover:border-[#D4AF37]/30 px-3 py-1 rounded hover:bg-white/10 transition"
          >
            <div className="w-2 h-2 rounded-full bg-[#00D1FF]"></div>
            <span className="text-[10px] font-mono text-gray-300 md:block hidden tracking-wide">{userEmail}</span>
            <ChevronDown className="w-3 h-3 text-gray-400" />
          </div>

          {/* Mobile hamburger menu toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="md:hidden text-gray-300 hover:text-white p-1 bg-white/5 border border-white/5 rounded"
            id="mobile-nav-toggle"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Container Wrapper with Left Side Rail */}
      <div className="flex min-h-[calc(100vh-48px)] bg-[#05070A] relative">
        {/* Decorative Grid and Ambient Lights */}
        <div className="absolute inset-0 terminal-grid pointer-events-none opacity-40"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 terminal-cyan-glow-point pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 terminal-gold-glow-point pointer-events-none"></div>

        {/* Left Nav Bar (Standard on Desktop) */}
        <aside className="w-64 border-r border-white/5 bg-[#0E121A]/90 backdrop-blur-md hidden md:flex flex-col relative z-20 select-none shrink-0 justify-between p-4">
          <div className="space-y-6">
            <div className="text-[10px] tracking-widest uppercase text-gray-500 font-mono font-medium pl-2">
              Exchange Terminals
            </div>

            <nav className="space-y-1.5" id="desktop-sidebar-nav">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentPage(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded text-xs transition duration-200 group text-left ${
                      isActive 
                        ? 'bg-gradient-to-r from-white/5 to-transparent border-l-2 border-[#00D1FF] font-medium text-white' 
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 transition-colors ${
                        isActive ? 'text-[#00D1FF]' : 'text-gray-400 group-hover:text-white'
                      }`} />
                      <span className="font-sans uppercase tracking-wider text-[11px]">{item.label}</span>
                    </div>
                    {isActive && (
                      <motion.div 
                        layoutId="nav-glow" 
                        className="w-1.5 h-1.5 rounded-full bg-[#00D1FF] shadow-[0_0_8px_rgba(0,209,255,0.7)]"
                      />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Quick Audit Trail list in menu */}
            <div className="pt-4 border-t border-white/5 font-mono text-[9px] text-gray-500 space-y-1.5 px-2">
              <span className="block uppercase text-[8px] tracking-widest text-[#D4AF37]">Live Audit Log</span>
              <div className="truncate flex items-center gap-1">
                <span className="text-[#00FF94]">●</span> LOCK: Cold wallet synced
              </div>
              <div className="truncate flex items-center gap-1">
                <span className="text-gray-400">○</span> SECURE: JWT verified
              </div>
              <div className="truncate flex items-center gap-1">
                <span className="text-[#D4AF37]">⚡</span> FEED: London BST +1
              </div>
            </div>
          </div>

          {/* Quick Access Actions footer layout */}
          <div className="pt-4 border-t border-white/5 space-y-3 font-mono">
            <div className="bg-[#05070A] p-3 border border-white/5 rounded">
              <div className="flex items-center justify-between text-[10px] mb-1">
                <span className="text-gray-400 uppercase">Aethel Shield</span>
                <span className="text-[#00FF94] text-[9px] font-semibold uppercase">Locked</span>
              </div>
              <div className="w-full bg-white/5 h-1 rounded overflow-hidden">
                <div className="bg-[#00FF94] h-full w-[94%]" />
              </div>
              <span className="text-[8px] text-gray-500 mt-1 block tracking-wider leading-relaxed">
                94% security risk score (Excellent)
              </span>
            </div>
            
            <button 
              onClick={() => setCurrentPage('landing')}
              className="w-full p-2 border border-white/10 hover:border-white/30 text-center text-gray-300 hover:text-white text-[10px] rounded uppercase font-semibold tracking-wider transition"
            >
              Exited Dashboard View
            </button>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="fixed inset-y-12 left-0 w-72 bg-[#0E121A] border-r border-white/10 z-50 p-5 flex flex-col justify-between md:hidden shadow-2xl"
            id="mobile-drawer"
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400">Navigation</span>
                <button 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="text-gray-400 hover:text-white p-1 border border-white/10 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2" id="mobile-drawer-nav">
                <button
                  onClick={() => {
                    setCurrentPage('landing');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-xs uppercase tracking-wider ${
                    currentPage === 'landing' ? 'bg-white/10 text-white border-l-2 border-amber-500' : 'text-gray-400'
                  }`}
                >
                  <Building className="w-4 h-4 text-amber-500" />
                  <span>Landing Portal</span>
                </button>

                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentPage(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-xs uppercase tracking-wider text-left ${
                        currentPage === item.id 
                          ? 'bg-gradient-to-r from-white/5 to-transparent border-l-2 border-[#00f0ff] font-semibold text-white' 
                          : 'text-gray-400'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-[#00f0ff]" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 space-y-3 font-mono">
              <div className="text-[10px] text-gray-400">
                <div className="text-gray-500 uppercase text-[9px] mb-1">Authenticated Account</div>
                <div className="truncate text-white text-[11px] font-semibold">{userEmail}</div>
              </div>
              <div className="text-[9px] text-emerald-500 flex items-center gap-1.5 uppercase font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Sovereign Escrow Link Active
              </div>
              <button 
                onClick={() => {
                  setCurrentPage('landing');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-center text-gray-300 text-[10px] rounded uppercase tracking-wider font-semibold"
              >
                Go to Landing Front
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </>
  );
}
