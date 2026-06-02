/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface CoinData {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  dominance: number;
  liquidityScore: number;
  sparkline: number[];
}

export type OrderType = 'MARKET' | 'LIMIT' | 'STOP_LOSS';
export type OrderSide = 'BUY' | 'SELL';
export type OrderStatus = 'OPEN' | 'FILLED' | 'CANCELED';

export interface Order {
  id: string;
  timestamp: string;
  symbol: string; // e.g. "BTC/USDT"
  type: OrderType;
  side: OrderSide;
  amount: number;
  price: number;
  triggerPrice?: number;
  status: OrderStatus;
  filledAmount: number;
}

export interface Transaction {
  id: string;
  timestamp: string;
  type: 'DEPOSIT' | 'WITHDRAW';
  asset: string;
  amount: number;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  address: string;
  txHash: string;
}

export interface ApiCredential {
  id: string;
  name: string;
  publicKey: string;
  permissions: ('READ' | 'TRADE' | 'WITHDRAW')[];
  created: string;
  lastUsed: string;
}

export interface LoginSession {
  id: string;
  device: string;
  browser: string;
  location: string;
  ip: string;
  timestamp: string;
  current: boolean;
}

export interface PortfolioSnapshot {
  timestamp: string;
  btcValue: number;
  usdtValue: number;
  totalUsdt: number;
}
