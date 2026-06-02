/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Building2, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Copy, 
  Check, 
  ExternalLink,
  Lock,
  QrCode,
  ShieldCheck,
  AlertTriangle,
  History,
  CornerDownRight
} from 'lucide-react';
import { Transaction } from '../types';

interface WalletPageProps {
  transactions: Transaction[];
  walletUsdt: number;
  walletBtc: number;
  btcPrice: number;
  onAddTransaction: (txn: Omit<Transaction, 'id' | 'timestamp'>) => void;
  onAdjustBalance: (usdtDiff: number, btcDiff: number) => void;
}

export default function WalletPage({ 
  transactions, 
  walletUsdt, 
  walletBtc, 
  btcPrice,
  onAddTransaction,
  onAdjustBalance
}: WalletPageProps) {
  // Navigation
  const [activeTab, setActiveTab] = useState<'DEPOSIT' | 'WITHDRAW'>('DEPOSIT');
  const [selectedAsset, setSelectedAsset] = useState<'BTC' | 'USDT' | 'GBP'>('BTC');
  
  // Deposit States
  const [copyStatus, setCopyStatus] = useState(false);

  // Withdrawal form inputs
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [withdrawalSuccess, setWithdrawalSuccess] = useState<string | null>(null);

  // Authenticate Modal
  const [showMfa, setShowMfa] = useState(false);
  const [mfaCode, setMfaCode] = useState('');

  // Static wallets mapped to actual deposits
  const depositAddresses = {
    BTC: 'bc1q SovereignColdStorageReserveAethel920146x',
    USDT: '0x3f5c921e4901fbc3d84224901fbc3d84224901fb',
    GBP: 'Barclays Bank PLC London (Aethel Client Vault Ref: Æ-TOM-8041)'
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(depositAddresses[selectedAsset]);
    setCopyStatus(true);
    setTimeout(() => setCopyStatus(false), 2000);
  };

  const handleWithdrawPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setWithdrawalSuccess(null);

    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      setErrorMsg('Please specify a positive asset volume.');
      return;
    }

    // Balance validations
    if (selectedAsset === 'BTC' && amount > walletBtc) {
      setErrorMsg(`Insufficient Bitcoin. Maximum deliverable quantity: ${walletBtc.toFixed(4)} BTC`);
      return;
    }
    if (selectedAsset === 'USDT' && amount > walletUsdt) {
      setErrorMsg(`Insufficient USDT. Maximum deliverable quantity: $${walletUsdt.toLocaleString()}`);
      return;
    }
    if (selectedAsset === 'GBP') {
      const gbpEquiv = walletUsdt / 1.27; // hardcoded GBP representation
      if (amount > gbpEquiv) {
        setErrorMsg(`Insufficient Sterling. Maximum deliverable quantity: £${gbpEquiv.toFixed(2)}`);
        return;
      }
    }

    if (!withdrawAddress) {
      setErrorMsg('Destination cryptographic address or IBAN mapping required.');
      return;
    }

    // Trigger secure login MFA
    setShowMfa(true);
  };

  const handleWithdrawConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (mfaCode.length !== 6) {
      setErrorMsg('Invalid multi-factor code.');
      return;
    }

    const amount = parseFloat(withdrawAmount);
    
    // Deduct balances
    if (selectedAsset === 'BTC') {
      onAdjustBalance(0, -amount);
    } else if (selectedAsset === 'USDT') {
      onAdjustBalance(-amount, 0);
    } else {
      // GBP is mapped to Usdt equivalent (e.g. times 1.27)
      onAdjustBalance(-(amount * 1.27), 0);
    }

    // Log the transaction
    onAddTransaction({
      type: 'WITHDRAW',
      asset: selectedAsset,
      amount,
      status: 'COMPLETED',
      address: withdrawAddress,
      txHash: '0x' + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('')
    });

    setWithdrawalSuccess(`Successfully routed withdrawal of ${amount} ${selectedAsset} to whitelisted vault.`);
    setWithdrawAddress('');
    setWithdrawAmount('');
    setMfaCode('');
    setShowMfa(false);
  };

  return (
    <div className="flex-grow flex flex-col p-4 md:p-6 space-y-6 max-w-7xl mx-auto w-full z-10">
      
      {/* 1. VAULT BALANCES GRID SYSTEM */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5" id="wallet-balances-grid">
        
        {/* BTC Cold Vault */}
        <div className="terminal-card rounded p-5 space-y-4 relative overflow-hidden text-left border-l-2 border-[#D4AF37]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono text-gray-500 tracking-wider">Bitcoin Cold Sourced Vault</span>
            <Lock className="w-3.5 h-3.5 text-[#D4AF37]" />
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-display font-bold text-white font-mono-numbers">
              {walletBtc.toFixed(4)} <span className="text-xl text-gray-400">BTC</span>
            </div>
            <div className="text-[11px] font-mono text-gray-500">
              ≈ ${(walletBtc * btcPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })} USDT Equiv.
            </div>
          </div>
          <div className="text-[9px] font-mono text-[#D4AF37] bg-amber-500/10 border border-amber-500/20 rounded px-2.5 py-1 inline-flex items-center gap-1.5 uppercase">
            <ShieldCheck className="w-3 h-3" />
            <span>Nuclear Bunker Protected (Vault 04B)</span>
          </div>
        </div>

        {/* USDT Sovereign Pools */}
        <div className="terminal-card rounded p-5 space-y-4 relative overflow-hidden text-left border-l-2 border-[#00D1FF]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono text-gray-500 tracking-wider">USDT Sovereign Pool Equity</span>
            <Lock className="w-3.5 h-3.5 text-[#00D1FF]" />
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-display font-bold text-white font-mono-numbers">
              ${walletUsdt.toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="text-xl text-gray-400">USDT</span>
            </div>
            <div className="text-[11px] font-mono text-gray-500">
              ≈ 1.0000 Sovereign Token Equivalents.
            </div>
          </div>
          <div className="text-[9px] font-mono text-[#00D1FF] bg-[#00D1FF]/10 border border-[#00D1FF]/20 rounded px-2.5 py-1 inline-flex items-center gap-1.5 uppercase">
            <ShieldCheck className="w-3 h-3" />
            <span>Custodian Account Segregated</span>
          </div>
        </div>

        {/* Fiat sterling equivalent */}
        <div className="terminal-card rounded p-5 space-y-4 relative overflow-hidden text-left border-l-2 border-[#00FF94]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono text-gray-500 tracking-wider">GBP Reserve Holding Account</span>
            <Building2 className="w-3.5 h-3.5 text-[#00FF94]" />
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-display font-bold text-white font-mono-numbers">
              £{(walletUsdt / 1.2742).toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="text-xl text-gray-400">GBP</span>
            </div>
            <div className="text-[11px] font-mono text-gray-500">
              Barclays Core Escrow. Reference: Æ-TOM-8041
            </div>
          </div>
          <div className="text-[9px] font-mono text-[#00FF94] bg-[#00FF94]/10 border border-[#00FF94]/20 rounded px-2.5 py-1 inline-flex items-center gap-1.5 uppercase font-medium">
            <ShieldCheck className="w-3 h-3" />
            <span>FCA Insured Fiat Escrow Channel</span>
          </div>
        </div>

      </div>

      {/* 2. TRANSACTION WIZARDS: DEPOSIT / WITHDRAW MODULAR CORES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* Left Side Tab Form Panel (7 Columns) */}
        <div className="lg:col-span-7 terminal-card rounded p-6 flex flex-col justify-between">
          
          <div className="space-y-6">
            {/* Nav tabs deposit vs. withdraw */}
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setActiveTab('DEPOSIT');
                    setErrorMsg(null);
                    setWithdrawalSuccess(null);
                  }}
                  className={`pb-2.5 text-xs font-display font-bold uppercase tracking-wider transition-colors relative ${
                    activeTab === 'DEPOSIT' ? 'text-white border-b-2 border-[#D4AF37]' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Sovereign Deposit Gateway
                </button>
                
                <button
                  onClick={() => {
                    setActiveTab('WITHDRAW');
                    setErrorMsg(null);
                    setWithdrawalSuccess(null);
                  }}
                  className={`pb-2.5 text-xs font-display font-bold uppercase tracking-wider transition-colors relative ${
                    activeTab === 'WITHDRAW' ? 'text-white border-b-2 border-[#D4AF37]' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Whitelisted Withdrawals
                </button>
              </div>

              {/* Asset choice dropdown */}
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="text-gray-500">Asset:</span>
                <select 
                  value={selectedAsset}
                  onChange={(e) => setSelectedAsset(e.target.value as any)}
                  className="bg-[#05070A] border border-white/10 text-white rounded px-2.5 py-1 text-xs font-mono focus:outline-none focus:border-[#00D1FF]"
                >
                  <option value="BTC" className="bg-[#0E121A]">BTC (Native)</option>
                  <option value="USDT" className="bg-[#0E121A]">USDT (TRC20)</option>
                  <option value="GBP" className="bg-[#0E121A]">GBP (Royal Wire)</option>
                </select>
              </div>
            </div>

            {/* TAB 1: DEPOSIT DETAILS */}
            {activeTab === 'DEPOSIT' && (
              <div className="space-y-6 text-left">
                <div className="space-y-3">
                  <h3 className="font-display font-semibold text-sm text-gray-200">How to deposit {selectedAsset} into your core account</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Transfer {selectedAsset} to the unique cryptographic escrow vault address listed below. Incoming blocks undergo 2-node validations (~10 minutes) before balancing.
                  </p>
                </div>

                {/* Display Address Block */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block">Core Deposit Vault Address</span>
                  
                  <div className="flex items-center gap-2 bg-[#04060b] p-3 border border-white/5 rounded">
                    <span className="font-mono text-white text-xs select-all break-all overflow-hidden text-left flex-1" id="deposit-wallet-address">
                      {depositAddresses[selectedAsset]}
                    </span>
                    <button
                      onClick={handleCopy}
                      className="p-2 border border-white/15 bg-white/5 hover:bg-white/15 rounded text-gray-300 hover:text-white transition"
                      title="Copy transaction address to click board"
                      id="btn-copy-address"
                    >
                      {copyStatus ? <Check className="w-4 h-4 text-[#00FF94]" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Security advisory */}
                <div className="bg-amber-500/5 p-3 rounded.sm border border-amber-500/10 text-left font-mono text-[10px] text-amber-500 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Jurisdiction warning</span>
                  </div>
                  <p className="leading-relaxed">
                    Ensure network correctness. Depositing tokens other than {selectedAsset} or over unsupported transport channels will result in severe irreversible digital currency dissipation.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 2: WITHDRAWS DETAILS */}
            {activeTab === 'WITHDRAW' && (
              <div className="space-y-5 text-left">
                
                {!showMfa ? (
                  <form onSubmit={handleWithdrawPrompt} className="space-y-4">
                    <div className="space-y-1">
                      <h3 className="font-display font-semibold text-sm text-gray-200">Request Whitelisted Outward Routing</h3>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        Funds can only be dispatched to pre-whitelisted secure offsite addresses, or registered British CHAPS bank coordinates.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Destination Input */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block">Whitelisted Destination</label>
                        <input
                          type="text"
                          className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#00D1FF]"
                          placeholder={selectedAsset === 'GBP' ? 'E.g. Barclays CHAPS sort code...' : 'E.g.bc1q...'}
                          value={withdrawAddress}
                          onChange={(e) => setWithdrawAddress(e.target.value)}
                        />
                      </div>

                      {/* Quantity Input */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block">Withdraw Amount</label>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.0001"
                            className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#00D1FF]"
                            placeholder="0.00"
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                          />
                          <span className="absolute right-3 top-2 text-[10px] font-mono text-gray-500">{selectedAsset}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-[#D4AF37] hover:bg-amber-400 text-[#05070A] font-semibold font-display uppercase tracking-widest text-xs rounded transition flex items-center justify-center gap-1.5 cursor-pointer"
                      id="btn-withdraw-init"
                    >
                      <span>Authorize Outbound Release</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </form>
                ) : (
                  /* Form confirming withdrawal via MFA */
                  <form onSubmit={handleWithdrawConfirm} className="space-y-4">
                    <div className="bg-amber-500/5 p-4 rounded border border-amber-500/20 text-center space-y-2">
                      <Lock className="w-6 h-6 text-[#d4af37] mx-auto animate-bounce" />
                      <span className="block font-display font-semibold text-xs tracking-wider uppercase text-white">Cryptographic Clearance Requested</span>
                      <p className="text-[11px] text-gray-400 font-mono">
                        Authorizing outbound lease of <strong className="text-[#00f0ff]">{withdrawAmount} {selectedAsset}</strong> to destination <strong className="text-white break-all">{withdrawAddress}</strong>.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block text-center">Multi-Factor Authenticator Protocol Code</label>
                      <input
                        type="text"
                        maxLength={6}
                        className="w-36 text-center mx-auto bg-white/5 border border-white/10 rounded py-2.5 text-lg font-mono tracking-widest text-[#00f0ff] focus:outline-none focus:border-cyan-400 block"
                        placeholder="••••••"
                        value={mfaCode}
                        onChange={(e) => setMfaCode(e.target.value)}
                        required
                        id="mfa-input"
                      />
                    </div>

                    <div className="flex gap-2 justify-center">
                      <button
                        type="button"
                        onClick={() => {
                          setShowMfa(false);
                          setMfaCode('');
                        }}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-400 text-xs rounded font-sans uppercase tracking-wider border border-white/10"
                      >
                        Cancel
                      </button>
                      
                      <button
                        type="submit"
                        className="px-6 py-2 bg-[#00e676] hover:bg-emerald-400 text-black font-semibold text-xs rounded font-sans uppercase tracking-wider shadow-[0_0_15px_rgba(0,230,118,0.3)]"
                        id="btn-withdraw-confirm"
                      >
                        Sign and Dispatch
                      </button>
                    </div>
                  </form>
                )}

              </div>
            )}
          </div>

          {/* Feedback alerts */}
          <div className="mt-4">
            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-[#FF3B3B] text-[11px] font-mono text-left">
                ● ERROR: {errorMsg}
              </div>
            )}
            {withdrawalSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded text-[#00FF94] text-[11px] font-mono text-left flex items-center gap-1.5">
                <span>✓</span> {withdrawalSuccess}
              </div>
            )}
          </div>

        </div>

        {/* Right Side Visual Holographic Details Drawer (5 Columns) */}
        <div className="lg:col-span-5 relative flex flex-col justify-between">
          <div className="terminal-card rounded p-6 h-full flex flex-col justify-between text-left relative overflow-hidden">
            {/* Background design graphics */}
            <div className="absolute inset-0 terminal-scanlines pointer-events-none opacity-[0.02]"></div>

            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="font-display font-semibold text-xs uppercase tracking-wider text-white">Security Hologram QR</span>
                <span className="text-[9px] font-mono text-cyan-400 uppercase">Holographic link</span>
              </div>

              {/* simulated QR barcode block */}
              <div className="w-36 h-36 border border-white/10 bg-white/5 rounded p-2.5 mx-auto relative flex items-center justify-center">
                <QrCode className="w-full h-full text-[#00D1FF] opacity-80" />
                {/* Laser beam scan */}
                <div className="absolute left-0 right-0 top-1/4 h-0.5 bg-[#00D1FF]/80 blur-xs glow-cyan animate-pulse"></div>
              </div>

              <div className="font-mono text-[9px] text-gray-500 space-y-2">
                <div className="flex items-start gap-1">
                  <span className="text-[#00D1FF]">★</span>
                  <span><strong>2-Factor Verified:</strong> Always check your browser URL bar for the official SSL signature. Ensure you are connected tunnel encrypted.</span>
                </div>
                <div className="flex items-start gap-1">
                  <span className="text-[#00D1FF]">★</span>
                  <span><strong>Physical Cold Isolation:</strong> Outbound assets above 5 BTC trigger manual dual-sign offsite keys held physical safes (London Vault Group). Released at 11:00 and 16:00 UTC.</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-gray-400">
              <span>Sovereign ID Verified</span>
              <span className="text-[#00FF94] uppercase">Class-AA Certificate</span>
            </div>
          </div>
        </div>

      </div>

      {/* 3. TRANSACTION LEDGER LOGS TABLE HISTORICAL */}
      <div className="terminal-card rounded p-5 space-y-4 text-left">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-amber-500" />
            <span className="font-display font-semibold text-xs uppercase tracking-wider text-white">Sovereign Account Transaction Ledger</span>
          </div>
          <span className="text-[9px] font-mono text-gray-500 uppercase">Double-entry cryptographic records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs text-gray-300">
            <thead>
              <tr className="border-b border-white/5 text-gray-500 uppercase text-[9px] tracking-widest pl-2">
                <th className="pb-3 pl-2">Sovereign Ref ID</th>
                <th className="pb-3">Logged Date</th>
                <th className="pb-3 text-center">Direction</th>
                <th className="pb-3 text-right">Volume</th>
                <th className="pb-3">Cryptographic Destination / Address</th>
                <th className="pb-3">Transaction ID (TXID)</th>
                <th className="pb-3 text-right pr-2">Clearance Pillar</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => {
                const isDeposit = t.type === 'DEPOSIT';
                return (
                  <tr key={t.id} className="border-b border-white/5 hover:bg-white/5 transition duration-150">
                    <td className="py-3 pl-2 font-bold text-gray-400 text-xs">{t.id}</td>
                    <td className="py-3 text-xs text-gray-400">{t.timestamp}</td>
                    <td className="py-3 text-center">
                      <span className={`inline-flex items-center gap-1 text-[9px] font-semibold px-2 py-0.5 rounded-full ${
                        isDeposit 
                          ? 'bg-[#00FF94]/10 text-[#00FF94]' 
                          : 'bg-[#FF3B3B]/10 text-[#FF3B3B]'
                      }`}>
                        {isDeposit ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                        {t.type}
                      </span>
                    </td>
                    <td className="py-3 text-right font-semibold font-mono-numbers text-white">
                      {isDeposit ? '+' : '-'}{t.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} {t.asset}
                    </td>
                    <td className="py-3 text-[11px] text-gray-400 select-all font-mono max-w-[200px] truncate" title={t.address}>
                      {t.address}
                    </td>
                    <td className="py-3 text-[11px] text-gray-500 select-all font-mono max-w-[150px] truncate">
                      {t.txHash}
                    </td>
                    <td className="py-3 text-right pr-2">
                      <span className={`inline-flex items-center gap-1.5 text-[9px] font-bold ${
                        t.status === 'COMPLETED' ? 'text-emerald-500' : 'text-amber-500'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${t.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-amber-500 animate-ping'}`}></span>
                        {t.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
