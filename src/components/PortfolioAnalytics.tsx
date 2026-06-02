/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  TrendingUp, 
  ArrowUpRight, 
  Layers, 
  Activity, 
  ShieldCheck, 
  Calendar, 
  Gauge,
  Percent,
  TrendingDown
} from 'lucide-react';
import { PORTFOLIO_HISTORY } from '../mockData';

interface PortfolioAnalyticsProps {
  walletUsdt: number;
  walletBtc: number;
  btcPrice: number;
}

export default function PortfolioAnalytics({ walletUsdt, walletBtc, btcPrice }: PortfolioAnalyticsProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7D' | '30D' | 'ALL'>('7D');
  const [hoveredDataIndex, setHoveredDataIndex] = useState<number | null>(null);

  // Dynamic portfolio value calculation
  const currentBtcWorth = walletBtc * btcPrice;
  const totalWorth = currentBtcWorth + walletUsdt;

  // Let's adapt historical stats to match live parameters dynamically!
  const adaptedHistory = PORTFOLIO_HISTORY.map((snap, idx) => {
    // scale history points appropriately so they smooth out with current total balance
    const ratio = snap.totalUsdt / 860555;
    const finalVal = totalWorth * ratio;
    return {
      ...snap,
      calculatedTotal: finalVal
    };
  });

  // Calculate high accuracy line chart coordinates
  const renderGrowthAreaChart = () => {
    const width = 800;
    const height = 240;
    const innerHeight = height - 40;
    const innerWidth = width - 80;
    const xOffset = 30;
    const yOffset = 15;

    const values = adaptedHistory.map(h => h.calculatedTotal);
    const maxVal = Math.max(...values) * 1.05;
    const minVal = Math.min(...values) * 0.95;
    const valRange = maxVal - minVal || 1000;

    const points = adaptedHistory.map((snap, idx) => {
      const x = xOffset + (idx / (adaptedHistory.length - 1)) * innerWidth;
      const y = yOffset + innerHeight - ((snap.calculatedTotal - minVal) / valRange) * innerHeight;
      return { x, y, snap };
    });

    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    
    // Smooth gradient fill representation
    const areaPath = `
      ${linePath} 
      L ${points[points.length - 1].x} ${yOffset + innerHeight} 
      L ${points[0].x} ${yOffset + innerHeight} 
      Z
    `;

    return (
      <svg 
        viewBox={`0 0 ${width} ${height}`} 
        className="w-full h-full select-none text-left"
        onMouseLeave={() => setHoveredDataIndex(null)}
      >
        <defs>
          <linearGradient id="areaGlowGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Charts Grids */}
        {[0.2, 0.4, 0.6, 0.8, 1.0].map((ratio, idx) => {
          const y = yOffset + (1 - ratio) * innerHeight;
          const labelVal = minVal + ratio * valRange;
          return (
            <g key={idx} className="opacity-30">
              <line 
                x1={xOffset} 
                y1={y} 
                x2={width - 50} 
                y2={y} 
                stroke="rgba(255,255,255,0.06)" 
                strokeDasharray="4 6"
              />
              <text 
                x={width - 45} 
                y={y + 3} 
                className="font-mono text-[8px] fill-gray-500 font-mono-numbers"
              >
                ${(labelVal / 1000).toFixed(1)}k
              </text>
            </g>
          );
        })}

        {/* Time Labels on bottom */}
        {points.map((p, idx) => (
          <text 
            key={idx} 
            x={p.x} 
            y={height - 8} 
            className="font-mono text-[8px] fill-gray-500 text-center"
            style={{ textAnchor: 'middle' }}
          >
            {p.snap.timestamp}
          </text>
        ))}

        {/* Colored Gradient Area Backdrop */}
        <path d={areaPath} fill="url(#areaGlowGradient)" />

        {/* Line Curve vector */}
        <path 
          d={linePath} 
          fill="none" 
          stroke="#D4AF37" 
          strokeWidth="2" 
          className="opacity-95"
          style={{ filter: 'drop-shadow(0 0 3px rgba(212,175,55,0.4))' }}
        />

        {/* Interactive hover circles and guidelines */}
        {points.map((p, idx) => {
          const isHovered = hoveredDataIndex === idx;
          return (
            <g 
              key={idx}
              onMouseEnter={() => setHoveredDataIndex(idx)}
              className="cursor-pointer"
            >
              {isHovered && (
                <line 
                  x1={p.x} 
                  y1={yOffset} 
                  x2={p.x} 
                  y2={yOffset + innerHeight} 
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth="1"
                />
              )}
              
              <circle
                cx={p.x}
                cy={p.y}
                r={isHovered ? 5 : 3}
                fill={isHovered ? '#00D1FF' : '#D4AF37'}
                stroke="black"
                strokeWidth="1.5"
                className="transition-colors"
              />
            </g>
          );
        })}
      </svg>
    );
  };

  // Asset Weight allocation ratios
  const btcWeightPerc = (currentBtcWorth / totalWorth) * 100 || 65;
  const usdtWeightPerc = 100 - btcWeightPerc;

  return (
    <div className="flex-grow flex flex-col p-4 md:p-6 space-y-6 max-w-7xl mx-auto w-full z-10">
      
      {/* 1. TOP HIGHLIGHT STATS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-[#0E121A]/80 border border-white/5 p-4 rounded-sm text-left font-mono" id="analytics-overview-strip">
        <div className="space-y-1">
          <div className="text-[10px] uppercase text-gray-500">Vault Assets Under Management</div>
          <div className="text-xl font-display font-bold text-white font-mono-numbers">
            ${totalWorth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <div className="space-y-1 border-l border-white/5 pl-4">
          <div className="text-[10px] uppercase text-gray-500">Net Return (All Time)</div>
          <div className="text-xl font-display font-bold text-[#00FF94] font-mono-numbers flex items-center gap-1">
            +18.42% <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
        <div className="space-y-1 border-l border-white/5 pl-4">
          <div className="text-[10px] uppercase text-gray-500">Unrealized PNL (24h)</div>
          <div className="text-xl font-display font-bold text-[#00FF94] font-mono-numbers">
            +${(totalWorth * 0.034).toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </div>
        </div>
        <div className="space-y-1 border-l border-white/5 pl-4">
          <div className="text-[10px] uppercase text-gray-500">Sovereign Sharpe Ratio</div>
          <div className="text-xl font-display font-semibold text-[#00D1FF] font-mono-numbers">
            2.84 <span className="text-[10px] text-gray-400 font-sans">(Superior)</span>
          </div>
        </div>
      </div>

      {/* 2. PLOTTED GROWTH GRAPH MATRIX AND RISK (Grid columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* Plotted graph (8 columns) */}
        <div className="lg:col-span-8 terminal-card rounded p-5 space-y-4">
          
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#D4AF37]" />
              <span className="font-display font-semibold text-xs uppercase tracking-wider text-white">Consolidated Capital curve</span>
            </div>

            {/* Micro details panel */}
            <div className="flex items-center gap-2 text-[10px] font-mono select-none">
              <button 
                onClick={() => setSelectedTimeframe('7D')}
                className={`px-2 py-1 rounded-sm ${selectedTimeframe === '7D' ? 'bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] font-bold' : 'text-gray-500'}`}
              >
                7 Day
              </button>
              <button 
                onClick={() => setSelectedTimeframe('30D')}
                className={`px-2 py-1 rounded-sm ${selectedTimeframe === '30D' ? 'bg-[#00D1FF]/15 border border-[#00D1FF]/30 text-[#00D1FF] font-bold' : 'text-gray-500'}`}
              >
                30 Day
              </button>
            </div>
          </div>

          {/* Precision Interactive Chart Info Bar */}
          <div className="h-6 bg-white/5 border border-white/5 font-mono text-[9px] text-gray-300 rounded px-2.5 flex items-center gap-3">
            <span className="text-[#00D1FF] uppercase tracking-wider font-sans font-bold">GRID ADVISER:</span>
            {hoveredDataIndex !== null ? (
              <>
                <span>Worth: <strong className="text-white font-mono-numbers">${adaptedHistory[hoveredDataIndex].calculatedTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })} USDT</strong></span>
                <span>Audit point: <strong className="text-amber-400">{adaptedHistory[hoveredDataIndex].timestamp}</strong></span>
                <span>Active Vault Reserves: <strong className="text-[#00FF94]">{adaptedHistory[hoveredDataIndex].btcValue.toFixed(2)} BTC</strong></span>
              </>
            ) : (
              <span className="text-gray-500 italic font-sans text-[10px]">Move cursor across vector points for detailed daily treasury snapshots</span>
            )}
          </div>

          {/* Area Line Component render */}
          <div className="bg-[#04060b] rounded border border-white/5 p-3">
            {renderGrowthAreaChart()}
          </div>

        </div>

        {/* Allocation Weights and Indices (4 columns) */}
        <div className="lg:col-span-4 terminal-card rounded p-5 flex flex-col justify-between text-left">
          
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="font-display font-semibold text-xs uppercase tracking-wider text-white">Reserve Distribution</span>
              <span className="text-[9px] font-mono text-[#D4AF37] uppercase">Weightings</span>
            </div>

            {/* Numerical breakdown weights stacks */}
            <div className="space-y-4">
              
              {/* BTC stack */}
              <div className="space-y-1.5 font-mono">
                <div className="flex justify-between text-[11px]">
                  <span className="text-white font-sans font-semibold">1. Bitcoin Sovereign</span>
                  <span className="text-white font-semibold font-mono-numbers">{btcWeightPerc.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-xs overflow-hidden">
                  <div className="bg-[#D4AF37] h-full" style={{ width: `${btcWeightPerc}%` }} />
                </div>
                <span className="text-[9px] text-gray-500 block">
                  Cold stored allocation: {walletBtc.toFixed(4)} BTC
                </span>
              </div>

              {/* USDT stable allocation */}
              <div className="space-y-1.5 font-mono">
                <div className="flex justify-between text-[11px]">
                  <span className="text-white font-sans font-semibold">2. Stablecoins (USDT/GBP)</span>
                  <span className="text-white font-semibold font-mono-numbers">{usdtWeightPerc.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-xs overflow-hidden">
                  <div className="bg-[#00D1FF] h-full" style={{ width: `${usdtWeightPerc}%` }} />
                </div>
                <span className="text-[9px] text-gray-500 block">
                  Liquid escrow pool: ${walletUsdt.toLocaleString()} USDT
                </span>
              </div>

              {/* PAXG allocation simulator */}
              <div className="space-y-1.5 font-mono opacity-40">
                <div className="flex justify-between text-[11px]">
                  <span className="text-gray-400 font-sans">3. Physical Gold Vault (PAXG)</span>
                  <span className="text-gray-400 font-mono-numbers">0.0%</span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-xs overflow-hidden">
                  <div className="bg-[#00FF94] h-full w-0" />
                </div>
                <span className="text-[9px] text-gray-500 block">
                  No bullion backed certificates allocated to portfolio.
                </span>
              </div>

            </div>

            {/* Custody risk scoring ledger */}
            <div className="p-3 bg-white/5 border border-white/5 rounded font-mono text-[10px] space-y-2">
              <span className="block font-bold text-gray-400 uppercase text-[8px] tracking-widest text-[#00D1FF]">Hedge Matrix Advisers</span>
              <div className="flex items-center justify-between">
                <span>Volatility Rating:</span>
                <span className="text-amber-400 uppercase tracking-widest font-semibold text-[9px]">Moderate High</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Value At Risk (VAR 95%):</span>
                <span className="text-[#00FF94] font-semibold font-mono-numbers">$14,204 USDT</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Diversification Rating:</span>
                <span className="text-[#00D1FF] font-semibold uppercase text-[9px] tracking-wider">A- Grade</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 flex items-center gap-1.5 select-none font-mono text-[9px] text-gray-500 mt-4 uppercase">
            <Gauge className="w-3.5 h-3.5 text-[#00FF94]" />
            <span>Custodian allocation compliant to ISO-20022 limits</span>
          </div>

        </div>

      </div>

    </div>
  );
}
