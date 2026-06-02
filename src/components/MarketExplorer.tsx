/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  TrendingUp, 
  Search, 
  ArrowUpDown, 
  Coins, 
  ArrowUpRight, 
  ArrowDownRight, 
  ChevronRight,
  Sparkles,
  Award
} from 'lucide-react';
import { CoinData } from '../types';

interface MarketExplorerProps {
  coins: CoinData[];
  btcPrice: number;
  onEnterTrade: () => void;
}

type SortField = 'name' | 'price' | 'change24h' | 'volume24h' | 'liquidityScore';
type SortOrder = 'ascending' | 'descending';

export default function MarketExplorer({ coins, btcPrice, onEnterTrade }: MarketExplorerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'STABLE' | 'METAL'>('ALL');
  const [sortField, setSortField] = useState<SortField>('liquidityScore');
  const [sortOrder, setSortOrder] = useState<SortOrder>('descending');

  // Dynamic price updates for listed BTC symbol
  const updatedCoins = coins.map(coin => {
    if (coin.symbol === 'BTC') {
      return { ...coin, price: btcPrice };
    }
    return coin;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'ascending' ? 'descending' : 'ascending');
    } else {
      setSortField(field);
      setSortOrder('descending');
    }
  };

  const getFilteredAndSortedCoins = () => {
    // Filter
    let items = updatedCoins.filter(c => {
      const matchSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.symbol.toLowerCase().includes(searchQuery.toLowerCase());
      
      let matchCat = true;
      if (categoryFilter === 'STABLE') {
        matchCat = c.symbol === 'USDT' || c.symbol === 'USDC' || c.symbol === 'GBPT';
      } else if (categoryFilter === 'METAL') {
        matchCat = c.symbol === 'PAXG';
      }

      return matchSearch && matchCat;
    });

    // Sort
    items.sort((a, b) => {
      let valA:any = a[sortField];
      let valB:any = b[sortField];
      
      if (typeof valA === 'string') {
        return sortOrder === 'ascending' 
          ? valA.localeCompare(valB) 
          : valB.localeCompare(valA);
      } else {
        return sortOrder === 'ascending' 
          ? valA - valB 
          : valB - valA;
      }
    });

    return items;
  };

  // Draw miniature custom SVGs for coin sparklines
  const renderSparkline = (points: number[], isPositive: boolean) => {
    const width = 110;
    const height = 30;
    const max = Math.max(...points);
    const min = Math.min(...points);
    const range = max - min || 1;
    
    const svgPoints = points.map((p, i) => {
      const x = (i / (points.length - 1)) * width;
      const y = height - ((p - min) / range) * (height * 0.7) - (height * 0.15);
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg width={width} height={height} className="overflow-visible">
        <polyline
          fill="none"
          stroke={isPositive ? '#00FF94' : '#FF3B3B'}
          strokeWidth="1.5"
          points={svgPoints}
          className="opacity-95"
          style={{ filter: isPositive ? 'drop-shadow(0 0 2px rgba(0,255,148,0.3))' : 'drop-shadow(0 0 2px rgba(255,59,59,0.3))' }}
        />
      </svg>
    );
  };

  const currentFilteredCoins = getFilteredAndSortedCoins();

  return (
    <div className="flex-grow flex flex-col p-4 md:p-6 space-y-6 max-w-7xl mx-auto w-full z-10">
      
      {/* 1. TOP INDEX STATS: BTC DOMINANCE HIGHLIGHTS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5" id="market-dominance-row">
        
        {/* Dominance card */}
        <div className="terminal-card rounded p-5 space-y-4 relative overflow-hidden text-left">
          <div className="absolute top-2 right-2 font-mono text-[9px] text-[#00D1FF] uppercase tracking-widest bg-[#00D1FF]/10 border border-[#00D1FF]/20 px-1.5 py-0.2 rounded">
            Sovereign Ledger
          </div>
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-mono text-gray-500 tracking-wider block">Bitcoin Dominance Level</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-display font-bold text-white">58.42%</span>
              <span className="text-xs text-[#00FF94] font-mono font-semibold flex items-center">▲ +0.14% Today</span>
            </div>
          </div>
          <div className="space-y-1.5 font-mono">
            <div className="flex justify-between text-[10px] text-gray-400">
              <span>Sovereign Target Reserve Ratio:</span>
              <span className="text-[#D4AF37]">55.0% - 60.0%</span>
            </div>
            {/* Visual ratio graph bar */}
            <div className="w-full bg-white/5 h-1.5 rounded overflow-hidden">
              <div className="bg-[#D4AF37] h-full w-[58.4%]" />
            </div>
          </div>
        </div>

        {/* Global liquidity cap index */}
        <div className="terminal-card rounded p-5 space-y-4 relative overflow-hidden text-left">
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-mono text-gray-500 tracking-wider block">Agreed Treasury Vault Value</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-display font-bold text-white">$2.38T</span>
              <span className="text-xs text-amber-400 font-mono font-semibold flex items-center">★ Gold Anchored</span>
            </div>
          </div>
          <div className="font-mono text-[10px] text-gray-400 space-y-1">
            <div className="flex justify-between">
              <span>FCA Liquid Registered Pool:</span>
              <span className="text-white font-mono-numbers">$125.4B</span>
            </div>
            <div className="flex justify-between">
              <span>Bilateral Collateral Ratio:</span>
              <span className="text-emerald-500 font-semibold font-mono-numbers">145%</span>
            </div>
          </div>
        </div>

        {/* Sterling peg status index */}
        <div className="terminal-card rounded p-5 space-y-4 relative overflow-hidden text-left">
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-mono text-gray-500 tracking-wider block">Digital Sterling Peg (GBPT)</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-display font-bold text-[#00D1FF] font-mono-numbers">£1.0004</span>
              <span className="text-xs text-[#00FF94] font-mono font-semibold flex items-center">● Peg Synchronized</span>
            </div>
          </div>
          <div className="font-mono text-[10px] text-gray-400 space-y-1">
            <div className="flex justify-between">
              <span>Bank of England Custodian Deposit:</span>
              <span className="text-white font-mono-numbers">£1.84B Verified</span>
            </div>
            <div className="flex justify-between">
              <span>Yield Earn Rating:</span>
              <span className="text-[#00D1FF] font-semibold font-mono-numbers">3.45% APY</span>
            </div>
          </div>
        </div>

      </div>

      {/* 2. MAIN COIN DIRECTORY TABLE PANEL */}
      <div className="terminal-card rounded p-5 space-y-6">
        
        {/* Search controls & filtering widgets */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-display font-semibold text-sm text-white tracking-wider mr-2 uppercase">Core Markets</span>
            
            {/* Simple Category switches */}
            <div className="flex items-center gap-1 bg-white/5 border border-white/10 p-0.5 rounded">
              <button
                onClick={() => setCategoryFilter('ALL')}
                className={`px-3 py-1.5 rounded-sm text-[10px] font-mono uppercase tracking-wider transition ${
                  categoryFilter === 'ALL' 
                    ? 'bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] font-bold' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                All Digital Assets
              </button>
              
              <button
                onClick={() => setCategoryFilter('STABLE')}
                className={`px-3 py-1.5 rounded-sm text-[10px] font-mono uppercase tracking-wider transition ${
                  categoryFilter === 'STABLE' 
                    ? 'bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] font-bold' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Stablecoins
              </button>

              <button
                onClick={() => setCategoryFilter('METAL')}
                className={`px-3 py-1.5 rounded-sm text-[10px] font-mono uppercase tracking-wider transition ${
                  categoryFilter === 'METAL' 
                    ? 'bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] font-bold' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Gold backed
              </button>
            </div>
          </div>

          {/* Text Input Search Bar */}
          <div className="relative max-w-sm w-full">
            <span className="absolute left-3 top-2.5 text-gray-500">
              <Search className="w-3.5 h-3.5" />
            </span>
            <input
              type="text"
              placeholder="Search assets (e.g. BTC, GBPT)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0E121A] border border-white/10 rounded px-9 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#00D1FF] placeholder-gray-500 text-left"
              id="market-search"
            />
          </div>
        </div>

        {/* Markets core tabular dataset representation */}
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs text-gray-200">
            <thead>
              <tr className="border-b border-white/5 text-gray-500 uppercase text-[9px] tracking-widest font-mono select-none">
                <th className="pb-3 pl-2">Asset Identifier</th>
                <th 
                  onClick={() => handleSort('price')}
                  className="pb-3 cursor-pointer hover:text-white transition inline-flex items-center gap-1"
                >
                  Current Quotation <ArrowUpDown className="w-3 h-3 text-[#D4AF37]" />
                </th>
                <th className="pb-3 text-right">24H Dynamics</th>
                <th 
                  onClick={() => handleSort('volume24h')}
                  className="pb-3 text-right cursor-pointer hover:text-white transition inline-flex items-center gap-1"
                >
                  24H Market Volume <ArrowUpDown className="w-3 h-3 text-[#D4AF37]" />
                </th>
                <th className="pb-3 text-center">Security Trend</th>
                <th 
                  onClick={() => handleSort('liquidityScore')}
                  className="pb-3 text-right cursor-pointer hover:text-white transition inline-flex items-center gap-1"
                >
                  Liquidity Audit <ArrowUpDown className="w-3 h-3 text-[#D4AF37]" />
                </th>
                <th className="pb-3 text-right pr-2">Execution Routing</th>
              </tr>
            </thead>
            <tbody>
              {currentFilteredCoins.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    No matching sovereign assets found in registry.
                  </td>
                </tr>
              ) : (
                currentFilteredCoins.map((coin, index) => {
                  const isUp = coin.change24h >= 0;
                  return (
                    <tr 
                      key={coin.id} 
                      className="border-b border-white/5 hover:bg-white/5 transition duration-150"
                    >
                      {/* Name/Symbol combo */}
                      <td className="py-4 pl-2 text-left">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-sm bg-[#0E121A] border border-white/10 flex items-center justify-center font-display font-medium text-xs text-[#D4AF37]">
                            {coin.symbol}
                          </div>
                          <div>
                            <span className="font-semibold block text-white text-xs">{coin.name}</span>
                            <span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider">{coin.symbol} / USDT</span>
                          </div>
                        </div>
                      </td>

                      {/* Formatting Price */}
                      <td className="py-4 font-mono font-medium text-xs text-left">
                        <div className="space-y-0.5">
                          <span className="block font-mono-numbers text-white">${coin.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</span>
                          <span className="text-[9px] text-gray-500 font-mono block">{(coin.price * 0.79).toLocaleString(undefined, { maximumFractionDigits: 2 })} GBP Reference</span>
                        </div>
                      </td>

                      {/* Dynamics (24h Change) */}
                      <td className="py-4 text-right">
                        <span className={`inline-flex items-center gap-1 font-mono text-xs font-semibold ${
                          isUp ? 'text-[#00FF94]' : 'text-[#FF3B3B]'
                        }`}>
                          {isUp ? '+' : ''}{coin.change24h}%
                          {isUp ? <ArrowUpRight className="w-3.5 h-3.5 scale-90" /> : <ArrowDownRight className="w-3.5 h-3.5 scale-90" />}
                        </span>
                      </td>

                      {/* volume */}
                      <td className="py-4 text-right font-mono font-mono-numbers">
                        <span className="text-gray-300 text-xs block">${(coin.volume24h / 1e9).toFixed(2)}B</span>
                        <span className="text-[9px] text-gray-500 block uppercase">Real settlement volume</span>
                      </td>

                      {/* Sparkline Custom Component */}
                      <td className="py-4 text-center">
                        <div className="inline-block">
                          {renderSparkline(coin.sparkline, isUp)}
                        </div>
                      </td>

                       {/* Liquidity score */}
                      <td className="py-4 text-right font-mono">
                        <div className="space-y-1">
                          <div className="flex items-center justify-end gap-1.5">
                            <span className="text-xs font-semibold text-white font-mono-numbers">{coin.liquidityScore}</span>
                            <span className="text-[9px] text-gray-500">/ 100</span>
                          </div>
                          <div className="w-20 bg-white/5 h-1 rounded overflow-hidden ml-auto">
                            <div 
                              style={{ width: `${coin.liquidityScore}%` }}
                              className={`h-full ${
                                coin.liquidityScore > 90 
                                  ? 'bg-[#00FF94]' 
                                  : coin.liquidityScore > 80 
                                  ? 'bg-[#00D1FF]' 
                                  : 'bg-[#D4AF37]'
                              }`} 
                            />
                          </div>
                        </div>
                      </td>

                      {/* Enter routing trade buttons */}
                      <td className="py-4 text-right pr-2">
                        <button
                          onClick={onEnterTrade}
                          className="bg-[#0E121A] border border-white/10 hover:border-[#00D1FF]/30 text-gray-300 hover:text-white px-3 py-1.5 rounded text-[10px] uppercase font-bold tracking-wider transition hover:bg-white/10 flex items-center gap-1.5 ml-auto cursor-pointer"
                        >
                          <span>Terminal</span>
                          <ChevronRight className="w-3.5 h-3.5 text-[#00D1FF]" />
                        </button>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
