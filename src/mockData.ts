/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CoinData, Candle, Order, Transaction, ApiCredential, LoginSession, PortfolioSnapshot } from './types';

// Let's create realistic London-sovereign financial data.
export const INITIAL_COINS: CoinData[] = [
  {
    id: 'bitcoin',
    symbol: 'BTC',
    name: 'Bitcoin Sovereign',
    price: 68425.50,
    change24h: 3.42,
    volume24h: 38420500120,
    marketCap: 1342600582900,
    dominance: 58.4,
    liquidityScore: 99.8,
    sparkline: [66100, 66320, 66250, 66800, 67100, 66950, 67200, 67800, 67400, 67900, 68150, 68425.50]
  },
  {
    id: 'tether',
    symbol: 'USDT',
    name: 'Tether Sovereign',
    price: 1.0002,
    change24h: 0.01,
    volume24h: 52100850000,
    marketCap: 112400300000,
    dominance: 4.8,
    liquidityScore: 98.5,
    sparkline: [1.0001, 1.0003, 1.0002, 1.0001, 1.0002, 1.0004, 1.0002, 1.0001, 1.0002, 1.0003, 1.0001, 1.0002]
  },
  {
    id: 'usd-coin',
    symbol: 'USDC',
    name: 'USD Treasury Stablecoin',
    price: 0.9999,
    change24h: -0.02,
    volume24h: 7420100000,
    marketCap: 34100200000,
    dominance: 1.5,
    liquidityScore: 95.2,
    sparkline: [1.0001, 0.9998, 1.0000, 0.9999, 1.0001, 0.9999, 0.9998, 1.0001, 1.0000, 0.9999, 1.0000, 0.9999]
  },
  {
    id: 'gbpt',
    symbol: 'GBPT',
    name: 'Sterling Digital Sovereign',
    price: 1.2742,
    change24h: 0.12,
    volume24h: 840200300,
    marketCap: 4501200300,
    dominance: 0.2,
    liquidityScore: 88.7,
    sparkline: [1.2680, 1.2695, 1.2710, 1.2705, 1.2718, 1.2730, 1.2725, 1.2738, 1.2732, 1.2741, 1.2735, 1.2742]
  },
  {
    id: 'gold-sovereign',
    symbol: 'PAXG',
    name: 'Gold Sovereign Coin',
    price: 2342.10,
    change24h: 0.45,
    volume24h: 184020100,
    marketCap: 6420500100,
    dominance: 0.28,
    liquidityScore: 82.3,
    sparkline: [2325, 2330, 2328, 2332, 2335, 2331, 2337, 2340, 2336, 2341, 2339, 2342.10]
  }
];

// Generate comprehensive candle sets
export function generateMockCandles(interval: string, basePrice: number = 68425.50): Candle[] {
  const count = 50;
  const candles: Candle[] = [];
  let currentPrice = basePrice - (count * 220); // start lower for positive trend
  
  // Deterministic random numbers
  let seed = 42;
  function random() {
    let x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  }

  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const change = (random() - 0.45) * 450; // positive bias
    const open = currentPrice;
    const close = currentPrice + change;
    const high = Math.max(open, close) + (random() * 180);
    const low = Math.min(open, close) - (random() * 180);
    const volume = 20 + Math.floor(random() * 180);
    
    let timeStr = '';
    const dateCopy = new Date(now);
    if (interval === '1m') {
      dateCopy.setMinutes(now.getMinutes() - (count - i));
      timeStr = dateCopy.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (interval === '5m') {
      dateCopy.setMinutes(now.getMinutes() - (count - i) * 5);
      timeStr = dateCopy.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (interval === '1h') {
      dateCopy.setHours(now.getHours() - (count - i));
      timeStr = dateCopy.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + dateCopy.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } else if (interval === '1d') {
      dateCopy.setDate(now.getDate() - (count - i));
      timeStr = dateCopy.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } else { // 1w
      dateCopy.setDate(now.getDate() - (count - i) * 7);
      timeStr = dateCopy.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }

    candles.push({
      time: timeStr,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume: Number(volume.toFixed(2))
    });

    currentPrice = close;
  }
  return candles;
}

export function generateOrderBook(midPrice: number) {
  // Generates asks (red, higher prices) and bids (green, lower prices)
  const asks: { price: number; amount: number; total: number; depthPerc: number }[] = [];
  const bids: { price: number; amount: number; total: number; depthPerc: number }[] = [];
  
  let askTotal = 0;
  let bidTotal = 0;
  
  // Ascending asks (sellers look for high prices)
  for (let i = 1; i <= 12; i++) {
    const factor = 1 + (i * 0.00015);
    const price = Number((midPrice * factor).toFixed(2));
    const amount = Number((Math.sin(i * 1.5) * 1.2 + 1.4).toFixed(3));
    askTotal += amount;
    asks.push({ price, amount, total: Number(askTotal.toFixed(3)), depthPerc: 0 });
  }
  
  // Descending bids (buyers look for low prices)
  for (let i = 1; i <= 12; i++) {
    const factor = 1 - (i * 0.00018);
    const price = Number((midPrice * factor).toFixed(2));
    const amount = Number((Math.cos(i * 1.2) * 1.1 + 1.3).toFixed(3));
    bidTotal += amount;
    bids.push({ price, amount, total: Number(bidTotal.toFixed(3)), depthPerc: 0 });
  }

  // Calculate percentage of max cumulative total for bars representation
  const maxAskTotal = asks[asks.length - 1].total;
  const maxBidTotal = bids[bids.length - 1].total;
  const overallMax = Math.max(maxAskTotal, maxBidTotal) || 1;

  asks.forEach(a => a.depthPerc = (a.total / overallMax) * 100);
  bids.forEach(b => b.depthPerc = (b.total / overallMax) * 100);

  // Return asks sorted descending (highest at top or typical view), but standard ordering is descending-to-mid for asks
  return { asks: asks.reverse(), bids };
}

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'TX-80410',
    timestamp: '2026-06-02 08:15:20',
    symbol: 'BTC/USDT',
    type: 'LIMIT',
    side: 'BUY',
    amount: 0.35,
    price: 68250.00,
    status: 'OPEN',
    filledAmount: 0.00
  },
  {
    id: 'TX-80392',
    timestamp: '2026-06-02 07:44:12',
    symbol: 'BTC/USDT',
    type: 'STOP_LOSS',
    side: 'SELL',
    amount: 1.20,
    price: 66800.00,
    triggerPrice: 66850.00,
    status: 'OPEN',
    filledAmount: 0.00
  },
  {
    id: 'TX-80251',
    timestamp: '2026-06-02 05:12:01',
    symbol: 'BTC/USDT',
    type: 'MARKET',
    side: 'BUY',
    amount: 0.50,
    price: 68120.40,
    status: 'FILLED',
    filledAmount: 0.50
  },
  {
    id: 'TX-79910',
    timestamp: '2026-06-01 19:30:24',
    symbol: 'BTC/USDT',
    type: 'LIMIT',
    side: 'SELL',
    amount: 0.75,
    price: 68600.00,
    status: 'FILLED',
    filledAmount: 0.75
  },
  {
    id: 'TX-79840',
    timestamp: '2026-06-01 14:15:52',
    symbol: 'BTC/USDT',
    type: 'LIMIT',
    side: 'BUY',
    amount: 0.20,
    price: 67200.00,
    status: 'CANCELED',
    filledAmount: 0.00
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'TXN-991204',
    timestamp: '2026-06-02 03:14:15',
    type: 'DEPOSIT',
    asset: 'USDT',
    amount: 250000.00,
    status: 'COMPLETED',
    address: '0x3f5c...921e',
    txHash: '0x8f4d92...e62a'
  },
  {
    id: 'TXN-990422',
    timestamp: '2026-06-01 10:22:41',
    type: 'WITHDRAW',
    asset: 'BTC',
    amount: 1.5000,
    status: 'COMPLETED',
    address: 'bc1q SovereignCold...z493',
    txHash: '9a8b7c6d...f2e1'
  },
  {
    id: 'TXN-989201',
    timestamp: '2026-05-30 15:44:00',
    type: 'DEPOSIT',
    asset: 'BTC',
    amount: 4.8500,
    status: 'COMPLETED',
    address: 'bc1q SovereignDeposit...r921',
    txHash: '20f3e1a8...bc4d'
  },
  {
    id: 'TXN-988402',
    timestamp: '2026-05-28 09:12:11',
    type: 'DEPOSIT',
    asset: 'GBP',
    amount: 85000.00,
    status: 'COMPLETED',
    address: 'Barclays Bank, London UK (Sovereign Escrow)',
    txHash: 'FPS-BARC-774912'
  }
];

export const INITIAL_API_CREDENTIALS: ApiCredential[] = [
  {
    id: 'API-749',
    name: 'Algorithmic Arbitrage Bot London',
    publicKey: 'aethel_pub_9f3d...7a11',
    permissions: ['READ', 'TRADE'],
    created: '2026-05-15',
    lastUsed: '2026-06-02 08:30:14'
  },
  {
    id: 'API-391',
    name: 'Sovereign Treasury Reporter',
    publicKey: 'aethel_pub_8c22...2b04',
    permissions: ['READ'],
    created: '2026-04-20',
    lastUsed: '2026-06-02 08:15:00'
  }
];

export const INITIAL_LOGINS: LoginSession[] = [
  {
    id: 'LOG-991',
    device: 'Apple MacBook Pro M4 Max',
    browser: 'Safari Mobile/Desktop',
    location: 'London, United Kingdom (City of London Financial Hub)',
    ip: '82.165.122.41',
    timestamp: '2026-06-02 08:31:20',
    current: true
  },
  {
    id: 'LOG-984',
    device: 'High-Performance Trade Station v4',
    browser: 'Chrome 125 (Debian Linux Sovereign Security)',
    location: 'London, United Kingdom',
    ip: '82.165.122.99',
    timestamp: '2026-06-01 14:10:05',
    current: false
  },
  {
    id: 'LOG-911',
    device: 'iOS Device (iPhone 17 Pro Ultra)',
    browser: 'Aethel Cryptographic App Proxy',
    location: 'London, United Kingdom',
    ip: '109.224.81.12',
    timestamp: '2026-05-31 18:22:15',
    current: false
  }
];

export const PORTFOLIO_HISTORY: PortfolioSnapshot[] = [
  { timestamp: '05-26', btcValue: 4.25, usdtValue: 85000, totalUsdt: 375750 },
  { timestamp: '05-27', btcValue: 4.85, usdtValue: 85000, totalUsdt: 414800 },
  { timestamp: '05-28', btcValue: 4.85, usdtValue: 170000, totalUsdt: 499800 },
  { timestamp: '05-29', btcValue: 5.15, usdtValue: 170000, totalUsdt: 520200 },
  { timestamp: '05-30', btcValue: 10.00, usdtValue: 170000, totalUsdt: 850000 },
  { timestamp: '05-31', btcValue: 8.50, usdtValue: 272000, totalUsdt: 849000 },
  { timestamp: '06-01', btcValue: 8.50, usdtValue: 272000, totalUsdt: 853612 },
  { timestamp: '06-02', btcValue: 8.42, usdtValue: 284205, totalUsdt: 860555 }
];
