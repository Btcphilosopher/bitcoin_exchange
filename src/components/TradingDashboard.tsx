/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Minus, 
  TrendingUp, 
  Zap, 
  Activity, 
  ShieldAlert, 
  ArrowRightLeft, 
  Percent, 
  Maximize2,
  Lock,
  Globe
} from 'lucide-react';
import { motion } from 'motion/react';
import { Candle, Order, OrderType, OrderSide, Transaction } from '../types';
import { generateMockCandles, generateOrderBook } from '../mockData';

interface TradingDashboardProps {
  btcPrice: number;
  orders: Order[];
  onPlaceOrder: (order: Omit<Order, 'id' | 'timestamp' | 'status' | 'filledAmount'>) => void;
  onCancelOrder: (id: string) => void;
  walletUsdt: number;
  walletBtc: number;
}

const TIMEFRAMES = ['1m', '5m', '1h', '1d', '1w'];

export default function TradingDashboard({
  btcPrice,
  orders,
  onPlaceOrder,
  onCancelOrder,
  walletUsdt,
  walletBtc
}: TradingDashboardProps) {
  // Chart states
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('1h');
  const [showMA, setShowMA] = useState<boolean>(true);
  const [showRSI, setShowRSI] = useState<boolean>(true);
  const [hoveredCandle, setHoveredCandle] = useState<Candle | null>(null);
  const [candles, setCandles] = useState<Candle[]>([]);

  // Form states
  const [orderSide, setOrderSide] = useState<OrderSide>('BUY');
  const [orderType, setOrderType] = useState<OrderType>('LIMIT');
  const [priceInput, setPriceInput] = useState<string>('');
  const [amountInput, setAmountInput] = useState<string>('0.05');
  const [stopPriceInput, setStopPriceInput] = useState<string>('');
  
  // Simulated success message
  const [orderSuccessMsg, setOrderSuccessMsg] = useState<string | null>(null);

  // Load candles based on timeframe & update last candle price to match live price feed
  useEffect(() => {
    const historical = generateMockCandles(selectedTimeframe, btcPrice);
    setCandles(historical);
  }, [selectedTimeframe]);

  // Sync historical chart's last item to live btcPrice ticks!
  useEffect(() => {
    if (candles.length > 0) {
      setCandles(prev => {
        const copy = [...prev];
        const lastIndex = copy.length - 1;
        const lastCandle = copy[lastIndex];
        
        // Minor dynamic spread
        const open = lastCandle.open;
        const close = btcPrice;
        const high = Math.max(lastCandle.high, btcPrice);
        const low = Math.min(lastCandle.low, btcPrice);

        copy[lastIndex] = {
          ...lastCandle,
          close,
          high,
          low
        };
        return copy;
      });
    }
  }, [btcPrice]);

  // Sync default price on toggle of type
  useEffect(() => {
    if (orderType === 'LIMIT' || orderType === 'STOP_LOSS') {
      setPriceInput(btcPrice.toFixed(2));
      setStopPriceInput((btcPrice * 0.99).toFixed(2));
    } else {
      setPriceInput('MARKET PRICE');
    }
  }, [orderType, btcPrice]);

  // Generate order depth book
  const orderBook = generateOrderBook(btcPrice);

  const calculatedTotal = () => {
    if (orderType === 'MARKET') {
      const amt = parseFloat(amountInput) || 0;
      return (amt * btcPrice).toFixed(2);
    }
    const price = parseFloat(priceInput) || 0;
    const amt = parseFloat(amountInput) || 0;
    return (price * amt).toFixed(2);
  };

  const handlePercentageChange = (percent: number) => {
    if (orderSide === 'BUY') {
      const deployable = walletUsdt * percent;
      const price = orderType === 'MARKET' ? btcPrice : (parseFloat(priceInput) || btcPrice);
      if (price > 0) {
        setAmountInput((deployable / price).toFixed(4));
      }
    } else {
      setAmountInput((walletBtc * percent).toFixed(4));
    }
  };

  const handleExecute = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amountInput);
    if (isNaN(amt) || amt <= 0) return;

    let prc = btcPrice;
    if (orderType !== 'MARKET') {
      prc = parseFloat(priceInput);
      if (isNaN(prc) || prc <= 0) return;
    }

    const tPrice = orderType === 'STOP_LOSS' ? parseFloat(stopPriceInput) : undefined;

    // Place actual order up back
    onPlaceOrder({
      symbol: 'BTC/USDT',
      type: orderType,
      side: orderSide,
      amount: amt,
      price: prc,
      triggerPrice: tPrice
    });

    setOrderSuccessMsg(`Placed ${orderSide} ${orderType} order for ${amt} BTC successfully.`);
    setTimeout(() => setOrderSuccessMsg(null), 3000);
  };

  const handlePriceClick = (selectedPrice: number) => {
    if (orderType !== 'MARKET') {
      setPriceInput(selectedPrice.toFixed(2));
    }
  };

  // Find max and min price in historical candles to fit SVG scaling beautifully
  const getChartExtremes = () => {
    if (candles.length === 0) return { maxPrice: 70000, minPrice: 65000 };
    let max = -Infinity;
    let min = Infinity;
    candles.forEach(c => {
      if (c.high > max) max = c.high;
      if (c.low < min) min = c.low;
    });

    // Add 1% padding top and bottom
    const pad = (max - min) * 0.05 || 100;
    return { maxPrice: max + pad, minPrice: Math.max(0, min - pad) };
  };

  const { maxPrice, minPrice } = getChartExtremes();

  // Draw candlesticks with clean React rendering
  const renderChartCanvas = () => {
    const width = 800;
    const height = 300;
    const innerHeight = height - 40;
    const innerWidth = width - 80;
    const xOffset = 20;
    const yOffset = 10;

    const scaleY = (val: number) => {
      const percentage = (val - minPrice) / (maxPrice - minPrice);
      return innerHeight - (percentage * innerHeight) + yOffset;
    };

    const candleCount = candles.length;
    const candleWidth = innerWidth / Math.max(candleCount, 1);
    
    // Draw MA lines if toggled
    const maPoints: {x: number, y: number}[] = [];
    if (showMA && candles.length >= 7) {
      for (let i = 6; i < candles.length; i++) {
        // Calculate 7-period SMA
        let sum = 0;
        for (let j = 0; j < 7; j++) {
          sum += candles[i - j].close;
        }
        const avg = sum / 7;
        const x = xOffset + (i * candleWidth) + (candleWidth / 2);
        const y = scaleY(avg);
        maPoints.push({ x, y });
      }
    }

    return (
      <svg 
        viewBox={`0 0 ${width} ${height}`} 
        className="w-full h-full select-none"
        onMouseLeave={() => setHoveredCandle(null)}
      >
        {/* Draw precise trading terminal grid lines */}
        {[0.1, 0.3, 0.5, 0.7, 0.9].map((ratio, idx) => {
          const y = yOffset + ratio * innerHeight;
          const priceVal = maxPrice - ratio * (maxPrice - minPrice);
          return (
            <g key={idx} className="opacity-30">
              <line 
                x1={xOffset} 
                y1={y} 
                x2={width - 60} 
                y2={y} 
                stroke="rgba(255,255,255,0.08)" 
                strokeWidth="1" 
                strokeDasharray="4 8"
              />
              <text 
                x={width - 55} 
                y={y + 4} 
                className="font-mono text-[9px] fill-gray-500 text-right"
              >
                ${priceVal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </text>
            </g>
          );
        })}

        {/* Dynamic moving averages line */}
        {showMA && maPoints.length > 1 && (
          <path
            d={maPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')}
            fill="none"
            stroke="#D4AF37" // Sovereign Gold
            strokeWidth="1.5"
            className="opacity-90 blur-[0.5px]"
          />
        )}

        {/* Generate each individual candle */}
        {candles.map((candle, idx) => {
          const x = xOffset + (idx * candleWidth);
          const center = x + (candleWidth / 2);
          const isGreen = candle.close >= candle.open;
          const highY = scaleY(candle.high);
          const lowY = scaleY(candle.low);
          const openY = scaleY(candle.open);
          const closeY = scaleY(candle.close);
          const rectY = Math.min(openY, closeY);
          const rectHeight = Math.max(1, Math.abs(openY - closeY));
          
          return (
            <g 
              key={idx} 
              className="cursor-crosshair"
              onMouseEnter={() => setHoveredCandle(candle)}
            >
              {/* Wick */}
              <line
                x1={center}
                y1={highY}
                x2={center}
                y2={lowY}
                stroke={isGreen ? '#00FF94' : '#FF3B3B'}
                strokeWidth="1.2"
              />
              {/* Candle Body */}
              <rect
                x={x + 1.5}
                y={rectY}
                width={Math.max(1, candleWidth - 3)}
                height={rectHeight}
                fill={isGreen ? '#00FF94' : '#FF3B3B'}
                stroke={isGreen ? '#00FF94' : '#FF3B3B'}
                strokeWidth="0.5"
                opacity={hoveredCandle === candle ? 1 : 0.8}
                className="transition-colors"
                style={{ filter: isGreen ? 'drop-shadow(0 0 1px rgba(0, 255, 148, 0.4))' : 'drop-shadow(0 0 1px rgba(255, 59, 59, 0.4))' }}
              />
              {/* Invisible interactive background rectangle */}
              <rect
                x={x}
                y={yOffset}
                width={candleWidth}
                height={innerHeight}
                fill="transparent"
              />
            </g>
          );
        })}
      </svg>
    );
  };

  // Draw RSI sub-chart
  const renderRSI = () => {
    const width = 800;
    const height = 80;
    const innerHeight = height - 20;
    const innerWidth = width - 80;
    const xOffset = 20;
    const yOffset = 10;

    const candleCount = candles.length;
    const candleWidth = innerWidth / Math.max(candleCount, 1);

    // Create a mock wavy RSI path based on candle index
    const rsiPoints: string[] = [];
    for (let i = 0; i < candles.length; i++) {
      const idxFactor = Math.sin(i * 0.4) * 20 + Math.cos(i * 0.1) * 10 + 50; 
      const percentage = (idxFactor - 10) / 80; // normalized
      const x = xOffset + (i * candleWidth) + (candleWidth / 2);
      const y = yOffset + innerHeight - (percentage * innerHeight);
      rsiPoints.push(`${i === 0 ? 'M' : 'L'} ${x} ${y}`);
    }

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full text-left">
        {/* Bounds of RSI 30 / 70 */}
        <line 
          x1={xOffset} 
          y1={yOffset + innerHeight * 0.3} 
          x2={width - 60} 
          y2={yOffset + innerHeight * 0.3} 
          stroke="rgba(255,59,59,0.3)" 
          strokeWidth="1" 
          strokeDasharray="2 4"
        />
        <line 
          x1={xOffset} 
          y1={yOffset + innerHeight * 0.7} 
          x2={width - 60} 
          y2={yOffset + innerHeight * 0.7} 
          stroke="rgba(0,255,148,0.3)" 
          strokeWidth="1" 
          strokeDasharray="2 4"
        />
        
        {/* RSI Label offsets */}
        <text x={width - 55} y={yOffset + innerHeight * 0.3 + 3} className="font-mono text-[8px] fill-gray-500">70.0</text>
        <text x={width - 55} y={yOffset + innerHeight * 0.7 + 3} className="font-mono text-[8px] fill-gray-500">30.0</text>

        <path
          d={rsiPoints.join(' ')}
          fill="none"
          stroke="#00D1FF"
          strokeWidth="1.2"
          className="opacity-70"
        />
      </svg>
    );
  };

  return (
    <div className="flex-grow flex flex-col p-4 md:p-6 space-y-6 select-none max-w-7xl mx-auto w-full z-10">
      
      {/* 1. Header Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-[#0E121A]/90 border border-white/5 p-4 rounded-sm" id="trading-metrics-strip">
        <div className="space-y-1">
          <div className="text-[10px] uppercase font-mono text-gray-500">Sovereign Index Rate</div>
          <div className="text-base font-mono font-semibold text-white font-mono-numbers">
            ${btcPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <div className="space-y-1 border-l border-white/5 pl-4">
          <div className="text-[10px] uppercase font-mono text-gray-500">24h Vol (Est)</div>
          <div className="text-base font-mono font-semibold text-[#00D1FF] font-mono-numbers">
            562.42 BTC <span className="text-xs text-gray-400">($38.4B)</span>
          </div>
        </div>
        <div className="space-y-1 border-l border-white/5 pl-4">
          <div className="text-[10px] uppercase font-mono text-gray-500">24h High (USD)</div>
          <div className="text-base font-mono font-semibold text-gray-200 font-mono-numbers">
            ${(btcPrice * 1.025).toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </div>
        </div>
        <div className="space-y-1 border-l border-white/5 pl-4">
          <div className="text-[10px] uppercase font-mono text-gray-500">24h Low (USD)</div>
          <div className="text-base font-mono font-semibold text-gray-200 font-mono-numbers">
            ${(btcPrice * 0.965).toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* 2. Main Terminal Body Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* CENTER MAIN: Candlestick Chart Area (8 Columns) */}
        <div className="lg:col-span-8 space-y-4">
          
          <div className="terminal-card rounded p-5 space-y-4">
            {/* Chart Control Bar */}
            <div className="flex flex-wrap items-center justify-between border-b border-white/5 pb-3 gap-3">
              <div className="flex items-center gap-3">
                <span className="font-display font-semibold text-sm text-white tracking-wider">BTC / USDT CHART</span>
                
                {/* Timeframe Selectors */}
                <div className="flex items-center gap-1 bg-white/5 border border-white/10 p-0.5 rounded">
                  {TIMEFRAMES.map(tf => (
                    <button
                      key={tf}
                      onClick={() => setSelectedTimeframe(tf)}
                      className={`px-2 py-1 rounded-sm text-[10px] font-mono transition-colors ${
                        selectedTimeframe === tf 
                          ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400 font-bold' 
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>

              {/* Indicator Controls */}
              <div className="flex items-center gap-4 text-[10px] font-mono text-gray-400">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={showMA} 
                    onChange={(e) => setShowMA(e.target.checked)} 
                    className="accent-amber-500 size-3 cursor-pointer"
                  />
                  <span className={showMA ? 'text-amber-400 font-semibold' : ''}>7-SMA (Gold)</span>
                </label>
                
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={showRSI} 
                    onChange={(e) => setShowRSI(e.target.checked)} 
                    className="accent-[#00D1FF] size-3 cursor-pointer"
                  />
                  <span className={showRSI ? 'text-[#00D1FF] font-semibold' : ''}>RSI Indicator</span>
                </label>
              </div>
            </div>

            {/* Candle High Precision Hover Stats Indicator */}
            <div className="h-6 bg-white/5 border border-white/5 font-mono text-[10px] text-gray-300 rounded px-2 flex items-center gap-4 overflow-x-auto no-scrollbar">
              <span className="text-[#D4AF37] tracking-wider uppercase font-sans text-[9px] font-bold">INFO BAR</span>
              {hoveredCandle ? (
                <>
                  <span>O:<span className="text-gray-100 font-mono-numbers">${hoveredCandle.open}</span></span>
                  <span>H:<span className="text-[#00FF94] font-mono-numbers">${hoveredCandle.high}</span></span>
                  <span>L:<span className="text-[#FF3B3B] font-mono-numbers">${hoveredCandle.low}</span></span>
                  <span>C:<span className="text-gray-100 font-mono-numbers">${hoveredCandle.close}</span></span>
                  <span>V:<span className="text-cyan-400 font-mono-numbers">{hoveredCandle.volume} BTC</span></span>
                  <span className="text-gray-500">({hoveredCandle.time})</span>
                </>
              ) : (
                <span className="text-gray-500 font-sans italic">Hover over candlesticks to reveal real-time tick metrics</span>
              )}
            </div>

            {/* Render Candlesticks Canvas component */}
            <div className="bg-[#05070A] rounded border border-white/5 p-2 relative">
              <div className="absolute top-2 right-2 flex items-center gap-1 opacity-40 hover:opacity-100 transition z-10 text-[9px] font-mono text-gray-400 select-none bg-[#05070A] p-1 border border-white/5 rounded">
                <Maximize2 className="w-3 h-3" />
                <span>CROSSHAIRS ENABLED</span>
              </div>
              {renderChartCanvas()}
            </div>

            {/* Render RSI if toggled */}
            {showRSI && (
              <div className="bg-[#05070A] rounded border border-white/5 p-2 space-y-1">
                <div className="text-[9px] font-mono uppercase text-gray-400 tracking-wider">RELATIVE STRENGTH INDEX (RSI-14)</div>
                {renderRSI()}
              </div>
            )}
          </div>

          {/* FLOATING DIRECTORY: Active Sovereign Orders & Transactions logs */}
          <div className="terminal-card rounded p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                <span className="font-display font-semibold text-xs uppercase tracking-wider text-white">Active Cryptographic Orders ({orders.filter(o => o.status === 'OPEN').length})</span>
              </div>
              <span className="text-[10px] font-mono text-gray-500">Sovereign settlement queue</span>
            </div>

            {orders.filter(o => o.status === 'OPEN').length === 0 ? (
              <div className="text-center py-6 text-gray-500 font-sans text-xs">
                No active outstanding orders. Place a buy/sell order below.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-[11px] text-gray-300">
                  <thead>
                     <tr className="border-b border-white/5 text-gray-500 uppercase text-[9px] tracking-wider">
                      <th className="pb-2">ID</th>
                      <th className="pb-2">Side</th>
                      <th className="pb-2">Type</th>
                      <th className="pb-2">Amount (BTC)</th>
                      <th className="pb-2">Price (USDT)</th>
                      <th className="pb-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.filter(o => o.status === 'OPEN').map(o => (
                      <tr key={o.id} className="border-b border-white/5 hover:bg-white/5 transition">
                        <td className="py-2.5 font-bold text-gray-400">{o.id}</td>
                        <td className="py-2.5">
                          <span className={`px-1.5 py-0.5 rounded-xs text-[9px] font-semibold ${
                            o.side === 'BUY' 
                              ? 'bg-[#00FF94]/10 text-[#00FF94]' 
                              : 'bg-[#FF3B3B]/10 text-[#FF3B3B]'
                          }`}>
                            {o.side}
                          </span>
                        </td>
                        <td className="py-2.5 text-gray-400">{o.type}</td>
                        <td className="py-2.5 text-white font-mono-numbers">{o.amount.toFixed(4)}</td>
                        <td className="py-2.5 text-white font-mono-numbers">
                          {o.type === 'MARKET' ? 'MARKET RATE' : `$${o.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                        </td>
                        <td className="py-2.5">
                          <button
                            onClick={() => onCancelOrder(o.id)}
                            className="bg-white/5 border border-white/10 hover:border-red-500/40 hover:bg-red-500/10 text-gray-400 hover:text-red-400 px-2.5 py-0.8 rounded text-[10px] transition uppercase tracking-wider"
                          >
                            Cancel
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: ORDER BOOK PANEL & ORDER EXECUTION PANEL (4 Columns) */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* Order Execution Panel (Buy/Sell toggle form) */}
          <div className="terminal-card rounded p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="font-display font-semibold text-xs uppercase tracking-wider text-white">Execute Sovereign Order</span>
              <div className="flex items-center gap-1.5 text-[9px] font-mono text-emerald-500 bg-emerald-500/10 px-1.5 py-0.2 rounded">
                <Lock className="w-3 h-3" />
                <span>TLS SECURED</span>
              </div>
            </div>

            {/* Buy / Sell Tab Switches */}
            <div className="grid grid-cols-2 gap-1.5 p-0.5 bg-white/5 rounded border border-white/10">
              <button
                onClick={() => setOrderSide('BUY')}
                className={`py-2 text-[11px] uppercase tracking-wider font-semibold rounded-sm transition ${
                  orderSide === 'BUY'
                    ? 'bg-[#00FF94] text-[#05070A] font-extrabold shadow-[0_0_10px_rgba(0,255,148,0.3)]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Buy BTC
              </button>
              
              <button
                onClick={() => setOrderSide('SELL')}
                className={`py-2 text-[11px] uppercase tracking-wider font-semibold rounded-sm transition ${
                  orderSide === 'SELL'
                    ? 'bg-[#FF3B3B] text-white font-extrabold shadow-[0_0_10px_rgba(255,59,59,0.3)]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Sell BTC
              </button>
            </div>

            {/* Quick Balance Readouts */}
            <div className="flex items-center justify-between text-[11px] font-mono bg-white/5 p-2 rounded border border-white/5">
              <span className="text-gray-400">Available Capital:</span>
              <span className="text-white font-semibold font-mono-numbers">
                {orderSide === 'BUY' 
                  ? `$${walletUsdt.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDT`
                  : `${walletBtc.toFixed(4)} BTC`}
              </span>
            </div>

            <form onSubmit={handleExecute} className="space-y-4">
              
              {/* Type Switch (Market, Limit, Stop Loss) */}
              <div>
                <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1">Execution Mechanism</label>
                <div className="grid grid-cols-3 gap-1 bg-white/5 p-0.5 rounded border border-white/5 text-[10px] font-mono">
                  {(['LIMIT', 'MARKET', 'STOP_LOSS'] as OrderType[]).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setOrderType(t)}
                      className={`py-1.5 rounded-sm uppercase tracking-wider text-center transition ${
                        orderType === t
                          ? 'bg-white/10 text-[#00D1FF] font-bold border border-[#00D1FF]/20'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {t.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Conditional Form Inputs */}
              {orderType === 'STOP_LOSS' && (
                <div>
                  <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1">Trigger Price (USD)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                      value={stopPriceInput}
                      onChange={(e) => setStopPriceInput(e.target.value)}
                      placeholder="e.g. 68000"
                    />
                    <span className="absolute right-3 top-2 text-[10px] font-mono text-gray-500">USD</span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1">
                  {orderType === 'MARKET' ? 'Limit Reference Base' : 'Set Asset Price (USDT)'}
                </label>
                {orderType === 'MARKET' ? (
                  <div className="w-full bg-white/5 border border-white/5 rounded px-3 py-2 text-xs font-mono text-gray-400">
                    Sovereign Spot Market Rate (Best Offer)
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                      value={priceInput}
                      onChange={(e) => setPriceInput(e.target.value)}
                    />
                    <span className="absolute right-3 top-2 text-[10px] font-mono text-gray-500">USDT</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1">Commitment Volume (BTC)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.0001"
                    className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                  />
                  <span className="absolute right-3 top-2 text-[10px] font-mono text-gray-500">BTC</span>
                </div>
              </div>

              {/* Percentage Presets */}
              <div className="grid grid-cols-4 gap-1.5 font-mono text-[9px]">
                {[0.25, 0.50, 0.75, 1.0].map((frac, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handlePercentageChange(frac)}
                    className="py-1 border border-white/5 hover:border-amber-500/20 bg-white/5 hover:bg-white/10 rounded transition text-center text-gray-400 hover:text-amber-400 font-bold"
                  >
                    {frac * 100}%
                  </button>
                ))}
              </div>

              {/* Transaction calculations summary */}
              <div className="p-3 bg-white/5 border border-white/5 rounded font-mono text-[10px] space-y-1.5 text-left">
                <div className="flex justify-between text-gray-500">
                  <span>Gross Capital Liability:</span>
                  <span className="text-white font-mono-numbers">${calculatedTotal()} USDT</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Sovereign Settlement Fee (0.01%):</span>
                  <span className="text-[#00D1FF] font-mono-numbers">
                    ${(parseFloat(calculatedTotal()) * 0.0001).toFixed(3)} USDT
                  </span>
                </div>
                <div className="border-t border-white/5 pt-1.5 flex justify-between font-bold text-gray-300">
                  <span>Final Capital Outlay:</span>
                  <span className="text-amber-400 font-mono-numbers">
                    ${(parseFloat(calculatedTotal()) * 1.0001).toFixed(2)} USDT
                  </span>
                </div>
              </div>

              {/* Submit Execution */}
              <button
                type="submit"
                className={`w-full py-3.5 font-semibold font-display tracking-widest text-[#05070A] rounded-sm text-xs uppercase cursor-pointer transition-all duration-300 ${
                  orderSide === 'BUY'
                    ? 'bg-[#00FF94] hover:bg-emerald-400 hover:shadow-[0_0_15px_rgba(0,255,148,0.4)]'
                    : 'bg-[#FF3B3B] hover:bg-orange-500 text-white hover:shadow-[0_0_15px_rgba(255,59,59,0.4)]'
                }`}
                id="btn-execute-trade"
              >
                Execute {orderSide} Trade
              </button>
            </form>

            {/* Interactive Alert Confirmation feedback */}
            {orderSuccessMsg && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 text-[10px] rounded font-mono flex items-center gap-2 text-left"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></div>
                <span>{orderSuccessMsg}</span>
              </motion.div>
            )}
          </div>

          {/* Depth Order Book panel */}
          <div className="terminal-card rounded p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="font-display font-semibold text-xs uppercase tracking-wider text-white">Live Term Depth Book</span>
              <span className="text-[9px] font-mono text-gray-500">Aggregation Level: 0.01</span>
            </div>

            {/* Depth visual lists */}
            <div className="space-y-4">
              {/* Asks (Sells) */}
              <div className="space-y-0.5">
                <div className="grid grid-cols-3 text-[9px] text-gray-500 font-mono font-medium tracking-tight mb-1 text-left">
                  <span>Quote Price</span>
                  <span className="text-right">Volume (BTC)</span>
                  <span className="text-right">Aggregate</span>
                </div>
                {orderBook.asks.map((ask, idx) => (
                  <div
                    key={idx}
                    onClick={() => handlePriceClick(ask.price)}
                    className="grid grid-cols-3 text-[10px] font-mono cursor-pointer hover:bg-white/5 transition relative text-left py-0.5"
                    title="Click price to populate transaction panel"
                  >
                    {/* Depth color ribbon backdrop */}
                    <div 
                      className="absolute right-0 top-0 bottom-0 bg-[#FF3B3B]/5 transition-all duration-300" 
                      style={{ width: `${ask.depthPerc}%` }}
                    />
                    <span className="text-[#FF3B3B] font-semibold font-mono-numbers relative z-10">${ask.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    <span className="text-right text-gray-300 font-mono-numbers relative z-10">{ask.amount.toFixed(3)}</span>
                    <span className="text-right text-gray-500 font-mono-numbers relative z-10">{ask.total.toFixed(3)}</span>
                  </div>
                ))}
              </div>

              {/* Spread Spot rate banner separator */}
              <div className="bg-white/5 border-y border-white/5 py-1.5 px-2 flex items-center justify-between font-mono text-[10px] text-gray-300 select-none">
                <span className="text-gray-500 uppercase tracking-wider">Spot Rate Spread</span>
                <span className="font-bold relative flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 glow-cyan"></span>
                  ${btcPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[#00FF94] font-bold uppercase text-[9px] tracking-wide">0.015%</span>
              </div>

              {/* Bids (Buys) */}
              <div className="space-y-0.5">
                {orderBook.bids.map((bid, idx) => (
                  <div
                    key={idx}
                    onClick={() => handlePriceClick(bid.price)}
                    className="grid grid-cols-3 text-[10px] font-mono cursor-pointer hover:bg-white/5 transition relative text-left py-0.5"
                    title="Click price to populate transaction panel"
                  >
                    {/* Depth color ribbon backdrop */}
                    <div 
                      className="absolute right-0 top-0 bottom-0 bg-[#00FF94]/5 transition-all duration-300"
                      style={{ width: `${bid.depthPerc}%` }}
                    />
                    <span className="text-[#00FF94] font-semibold font-mono-numbers relative z-10">${bid.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    <span className="text-right text-gray-300 font-mono-numbers relative z-10">{bid.amount.toFixed(3)}</span>
                    <span className="text-right text-gray-500 font-mono-numbers relative z-10">{bid.total.toFixed(3)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
