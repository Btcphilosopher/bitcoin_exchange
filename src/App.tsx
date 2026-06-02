/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Navigation from './components/Navigation';
import LandingPage from './components/LandingPage';
import TradingDashboard from './components/TradingDashboard';
import MarketExplorer from './components/MarketExplorer';
import WalletPage from './components/WalletPage';
import PortfolioAnalytics from './components/PortfolioAnalytics';
import SecurityDashboard from './components/SecurityDashboard';
import SettingsPage from './components/SettingsPage';

import { CoinData, Order, Transaction } from './types';
import { 
  INITIAL_COINS, 
  INITIAL_ORDERS, 
  INITIAL_TRANSACTIONS 
} from './mockData';

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>('landing');
  const [userEmail] = useState<string>('tom@ahyx.org');

  // Core simulated live price tick feed values
  const [btcPrice, setBtcPrice] = useState<number>(68425.50);
  const [prevBtcPrice, setPrevBtcPrice] = useState<number>(68425.50);
  const [priceDirection, setPriceDirection] = useState<'up' | 'down' | 'flat'>('flat');

  // Ledger state repositories
  const [coins, setCoins] = useState<CoinData[]>(INITIAL_COINS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);

  // User wallet metrics balances
  const [walletUsdt, setWalletUsdt] = useState<number>(284205.00);
  const [walletBtc, setWalletBtc] = useState<number>(8.4204);

  // Mimic live global Bitcoin ticker tick movements
  useEffect(() => {
    const timer = setInterval(() => {
      setBtcPrice(prev => {
        const volatility = 18.5; // average trading noise deviation
        const skew = 2.4; // positive London morning skew
        const offset = (Math.random() - 0.45) * volatility + skew;
        const newPrice = Number((prev + offset).toFixed(2));

        setPrevBtcPrice(prev);
        if (newPrice > prev) setPriceDirection('up');
        else if (newPrice < prev) setPriceDirection('down');
        else setPriceDirection('flat');

        // Check if any OPEN limit orders are filled at this new price index
        setOrders(origOrders => {
          return origOrders.map(ord => {
            if (ord.status === 'OPEN') {
              const matchesBuy = ord.side === 'BUY' && newPrice <= ord.price;
              const matchesSell = ord.side === 'SELL' && newPrice >= ord.price;
              const matchesStop = ord.type === 'STOP_LOSS' && ord.triggerPrice && (
                (ord.side === 'SELL' && newPrice <= ord.triggerPrice) ||
                (ord.side === 'BUY' && newPrice >= ord.triggerPrice)
              );

              if (matchesBuy || matchesSell || matchesStop) {
                // Adjust user capital on fill
                if (ord.side === 'BUY') {
                  // Already precommitted or calculated at fill
                  const cost = ord.amount * ord.price;
                  setWalletUsdt(u => u - cost);
                  setWalletBtc(b => b + ord.amount);
                } else {
                  const gain = ord.amount * (ord.type === 'STOP_LOSS' ? ord.price : ord.price);
                  setWalletBtc(b => b - ord.amount);
                  setWalletUsdt(u => u + gain);
                }

                // Add to trade block ledgers history
                setTransactions(txs => [
                  {
                    id: 'TXN-' + Math.floor(Math.random() * 900000 + 100000),
                    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
                    type: ord.side === 'BUY' ? 'DEPOSIT' : 'WITHDRAW', // mapped context
                    asset: 'BTC',
                    amount: ord.amount,
                    status: 'COMPLETED',
                    address: ord.side === 'BUY' ? 'Aethel Deposit Vault' : 'External Whitelisted',
                    txHash: '0x' + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('')
                  },
                  ...txs
                ]);

                return { ...ord, status: 'FILLED', filledAmount: ord.amount };
              }
            }
            return ord;
          });
        });

        return newPrice;
      });
    }, 3800);

    return () => clearInterval(timer);
  }, []);

  const handlePlaceOrder = (newOrderData: Omit<Order, 'id' | 'timestamp' | 'status' | 'filledAmount'>) => {
    const id = 'TX-' + Math.floor(Math.random() * 90000 + 10000);
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const isMarket = newOrderData.type === 'MARKET';
    
    const newOrder: Order = {
      ...newOrderData,
      id,
      timestamp,
      status: isMarket ? 'FILLED' : 'OPEN',
      filledAmount: isMarket ? newOrderData.amount : 0.00
    };

    if (isMarket) {
      // Deduct or supplement balances immediately for instant trades
      const costRaw = newOrderData.amount * btcPrice;
      if (newOrderData.side === 'BUY') {
        setWalletUsdt(u => u - costRaw);
        setWalletBtc(b => b + newOrderData.amount);
      } else {
        setWalletBtc(b => b - newOrderData.amount);
        setWalletUsdt(u => u + costRaw);
      }

      // Add to transaction ledgers
      setTransactions(prev => [
        {
          id: 'TXN-' + Math.floor(Math.random() * 900000 + 100000),
          timestamp,
          type: newOrderData.side === 'BUY' ? 'DEPOSIT' : 'WITHDRAW',
          asset: 'BTC',
          amount: newOrderData.amount,
          status: 'COMPLETED',
          address: newOrderData.side === 'BUY' ? 'Instant Broker Settlement' : 'Sovereign Spot Liquidity Pool',
          txHash: '0x' + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('')
        },
        ...prev
      ]);
    } else {
      // Capital Commitment Check for LIMIT buy just to lock the collateral
      if (newOrderData.side === 'BUY') {
         // Holds collateral in escrow until limit hit or canceled
      }
    }

    setOrders(prev => [newOrder, ...prev]);
  };

  const handleCancelOrder = (id: string) => {
    setOrders(prev => prev.map(ord => {
      if (ord.id === id) {
        return { ...ord, status: 'CANCELED' };
      }
      return ord;
    }));
  };

  const handleAddTransaction = (newTxn: Omit<Transaction, 'id' | 'timestamp'>) => {
    const id = 'TXN-' + Math.floor(Math.random() * 900000 + 100000);
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    
    setTransactions(prev => [
      {
        ...newTxn,
        id,
        timestamp
      },
      ...prev
    ]);
  };

  const handleAdjustBalance = (usdtDiff: number, btcDiff: number) => {
    if (usdtDiff !== 0) setWalletUsdt(u => u + usdtDiff);
    if (btcDiff !== 0) setWalletBtc(b => b + btcDiff);
  };

  // Render view router based on currentPage state
  const renderCurrentView = () => {
    switch (currentPage) {
      case 'landing':
        return (
          <LandingPage 
            btcPrice={btcPrice} 
            prevBtcPrice={prevBtcPrice}
            onEnterApp={() => setCurrentPage('dashboard')}
            onOpenSettings={() => setCurrentPage('settings')}
          />
        );
      case 'dashboard':
        return (
          <TradingDashboard 
            btcPrice={btcPrice} 
            orders={orders}
            onPlaceOrder={handlePlaceOrder}
            onCancelOrder={handleCancelOrder}
            walletUsdt={walletUsdt}
            walletBtc={walletBtc}
          />
        );
      case 'markets':
        return (
          <MarketExplorer 
            coins={coins} 
            btcPrice={btcPrice}
            onEnterTrade={() => setCurrentPage('dashboard')}
          />
        );
      case 'wallet':
        return (
          <WalletPage 
            transactions={transactions}
            walletUsdt={walletUsdt}
            walletBtc={walletBtc}
            btcPrice={btcPrice}
            onAddTransaction={handleAddTransaction}
            onAdjustBalance={handleAdjustBalance}
          />
        );
      case 'analytics':
        return (
          <PortfolioAnalytics 
            walletUsdt={walletUsdt}
            walletBtc={walletBtc}
            btcPrice={btcPrice}
          />
        );
      case 'security':
        return <SecurityDashboard />;
      case 'settings':
        return <SettingsPage userEmail={userEmail} />;
      default:
        return (
          <LandingPage 
            btcPrice={btcPrice} 
            prevBtcPrice={prevBtcPrice}
            onEnterApp={() => setCurrentPage('dashboard')}
            onOpenSettings={() => setCurrentPage('settings')}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#05070A] text-[#E0E2E5] relative flex flex-col font-sans select-none antialiased">
      {/* Dynamic Navigation Rails */}
      <Navigation 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        btcPrice={btcPrice}
        priceDirection={priceDirection}
        userEmail={userEmail}
      />

      {/* Primary view content area with dynamic animation wrapper */}
      <main className="flex-grow flex flex-col relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -3 }}
            transition={{ duration: 0.18, ease: 'easeInOut' }}
            className="flex-grow flex flex-col"
          >
            {renderCurrentView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Decorative footer metrics ribbon */}
      <footer className="border-t border-white/5 bg-[#080A0F] py-3 px-6 text-center text-[10px] text-gray-500 font-mono flex flex-col sm:flex-row items-center justify-between gap-2 select-none relative z-20">
        <div>
          © 2026 ÆTHEL VAULTS SECURE. REGULATED INTRA-LEDGER ROUTE DEPLOYED.
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[#00FF94] flex items-center gap-1 font-semibold uppercase">
            <span className="w-1.5 h-1.5 bg-[#00FF94] rounded-full animate-pulse mr-0.5"></span>
            SYS STATUS: STEADY CONSTANT (140μs EXEC)
          </span>
          <span className="hidden sm:inline">SHA-512 CONSENSUS ENFORCED</span>
        </div>
      </footer>
    </div>
  );
}
