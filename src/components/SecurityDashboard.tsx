/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Trash2, 
  CheckCircle, 
  MapPin, 
  Smartphone, 
  Eye, 
  LogOut, 
  ShieldAlert, 
  AlertOctagon,
  ClipboardList,
  Unlock,
  KeyRound,
  Plus
} from 'lucide-react';
import { LoginSession } from '../types';
import { INITIAL_LOGINS } from '../mockData';

export default function SecurityDashboard() {
  const [sessions, setSessions] = useState<LoginSession[]>(INITIAL_LOGINS);
  const [twoFactorActive, setTwoFactorActive] = useState(true);
  const [addressWhitelist, setAddressWhitelist] = useState<string[]>([
    'bc1q WhitelistReserveLondonColdSovereign_Primary',
    'bc1q WhitelistTreasuryBermudaHSM_BackupA',
    '0x3f5c WhitelistUSDTEscrowTokenBroker_US'
  ]);
  const [newWhitelistAddr, setNewWhitelistAddr] = useState('');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const handleRevokeSession = (id: string, name: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    setActionFeedback(`Access token revoked for device: ${name}`);
    setTimeout(() => setActionFeedback(null), 3000);
  };

  const handleToggleTwoFactor = () => {
    setTwoFactorActive(!twoFactorActive);
    setActionFeedback(`Two-Factor Authentication: ${!twoFactorActive ? 'ENABLED' : 'DISABLED'}`);
    setTimeout(() => setActionFeedback(null), 3000);
  };

  const handleAddWhitelist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWhitelistAddr.trim()) return;
    setAddressWhitelist(prev => [...prev, newWhitelistAddr.trim()]);
    setActionFeedback(`Whitelisted new payout address successfully.`);
    setNewWhitelistAddr('');
    setTimeout(() => setActionFeedback(null), 3000);
  };

  const handleRemoveWhitelist = (addr: string) => {
    setAddressWhitelist(prev => prev.filter(a => a !== addr));
    setActionFeedback(`Removed address from payout whitelist.`);
    setTimeout(() => setActionFeedback(null), 3000);
  };

  return (
    <div className="flex-grow flex flex-col p-4 md:p-6 space-y-6 max-w-7xl mx-auto w-full z-10">
      
      {/* 1. TOP HEALTH CHECK GAUGES */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
        
        {/* Security Assessment wheel (4 columns) */}
        <div className="md:col-span-4 terminal-card rounded p-5 flex flex-col justify-between text-left relative overflow-hidden">
          <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-60">
            <span className="w-2 h-2 rounded-full bg-[#00FF94] glow-cyan"></span>
            <span className="text-[9px] font-mono text-gray-500 uppercase">Audit grade AA+</span>
          </div>

          <div className="space-y-4">
            <span className="text-[10px] uppercase font-mono text-gray-500 tracking-wider block">Security Risk Index (ÆSR)</span>
            
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-display font-extrabold text-[#00FF94]">94%</span>
              <span className="text-xs text-gray-400 font-mono tracking-wide">Secure Status</span>
            </div>

            <div className="space-y-1.5">
              <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                <div className="bg-[#00FF94] h-full w-[94%]" />
              </div>
              <p className="text-[9px] font-mono text-gray-500 leading-relaxed uppercase">
                Active core defenses verified. Dual-signatures synchronized.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 font-mono text-[9px] text-[#00D1FF] uppercase flex items-center gap-1.5 mt-4">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Custodian secure parameters active</span>
          </div>
        </div>

        {/* 2FA Configuration widget (4 columns) */}
        <div className="md:col-span-4 terminal-card rounded p-5 flex flex-col justify-between text-left">
          <div className="space-y-4">
            <span className="text-[10px] uppercase font-mono text-gray-500 tracking-wider block">Authenticator Protocol (2FA)</span>
            
            <div className="flex items-center justify-between">
              <div>
                <span className={`text-[#e2e8f0] font-sans font-semibold text-sm ${twoFactorActive ? 'text-white' : 'text-gray-400'}`}>
                  {twoFactorActive ? 'Active and Enforcing' : 'Deactivated'}
                </span>
                <span className="text-[10px] text-gray-500 block font-mono pr-2 mt-1 leading-relaxed">
                  Requires 6-digit cryptographic TOTP credentials for all payouts.
                </span>
              </div>

              {/* Slide Button switch */}
              <button
                onClick={handleToggleTwoFactor}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  twoFactorActive ? 'bg-[#00FF94]' : 'bg-white/10'
                }`}
                id="btn-toggle-2fa"
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-[#0c1017] shadow-lg ring-0 transition duration-200 ease-in-out ${
                    twoFactorActive ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 font-mono text-[9px] text-gray-500 mt-4 uppercase">
            Last re-verified: 2026-06-02 08:31:20
          </div>
        </div>

        {/* Global IP Whitelist Shield alert (4 columns) */}
        <div className="md:col-span-4 terminal-card rounded p-5 flex flex-col justify-between text-left border-l-2 border-[#00D1FF]">
          <div className="space-y-4">
            <span className="text-[10px] uppercase font-mono text-gray-500 tracking-wider block">Network Lock Guard</span>
            <div className="space-y-1">
              <span className="text-white font-sans font-semibold text-sm block">Subnet Binding Active</span>
              <p className="text-[10px] text-gray-400 font-mono leading-relaxed">
                Platform actions are restricted to audited London secure VPS gateways. Rogue packets are automatically quarantined.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 font-mono text-[9px] text-[#00D1FF] uppercase flex items-center gap-1.5 mt-4">
            <KeyRound className="w-3.5 h-3.5" />
            <span>IP Lock: Verified Class-C Subnets</span>
          </div>
        </div>

      </div>

      {/* 2. SECURITY WHITELIST AND SESSIONS (Grid columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* Payout address Whitelist management (7 columns) */}
        <div className="lg:col-span-7 terminal-card rounded p-6 space-y-6 text-left">
          <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-[#D4AF37]" />
              <span className="font-display font-semibold text-xs uppercase tracking-wider text-white">Guarded Payout Whitelist ({addressWhitelist.length})</span>
            </div>
            <span className="text-[9px] font-mono text-gray-500">Authorized endpoints</span>
          </div>

          {/* Form adding whitelist */}
          <form onSubmit={handleAddWhitelist} className="flex gap-2">
            <input
              type="text"
              className="flex-grow bg-[#05070A] border border-white/10 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#00D1FF] placeholder-gray-500 text-left"
              placeholder="bc1q WhitelistAddress..."
              value={newWhitelistAddr}
              onChange={(e) => setNewWhitelistAddr(e.target.value)}
              id="whitelist-address-input"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/15 text-white font-mono font-medium rounded text-xs uppercase cursor-pointer flex items-center gap-1 hover:border-amber-500/25 shrink-0"
              id="btn-add-whitelist"
            >
              <Plus className="w-3.5 h-3.5 text-[#00D1FF]" />
              <span>Whitelist</span>
            </button>
          </form>

          {/* Whitelist ledger records */}
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {addressWhitelist.map((addr) => (
              <div 
                key={addr} 
                className="flex items-center justify-between p-3 bg-[#04060b] border border-white/5 rounded"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></div>
                  <span className="font-mono text-xs text-white break-all select-all pr-2 text-left">{addr}</span>
                </div>
                <button
                  onClick={() => handleRemoveWhitelist(addr)}
                  className="p-1.5 text-gray-500 hover:text-red-400 border border-white/5 hover:border-red-500/15 bg-white/5 rounded transition shrink-0"
                  title="Remove address from withdrawal whitelist"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <p className="text-[10px] font-mono text-gray-500 leading-relaxed uppercase">
            Addition of payout addresses triggers a 24-hour withdrawal blockade on that specific tunnel for protection.
          </p>
        </div>

        {/* Active login history tracking (5 columns) */}
        <div className="lg:col-span-5 terminal-card rounded p-6 space-y-4 text-left">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-[#00D1FF]" />
              <span className="font-display font-semibold text-xs uppercase tracking-wider text-white">Active Sessions ({sessions.length})</span>
            </div>
            <span className="text-[9px] font-mono text-[#00FF94]">Shield Audit Active</span>
          </div>

          {/* Sessions list loops */}
          <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
            {sessions.map((ses) => (
              <div 
                key={ses.id} 
                className="p-3 bg-white/5 border border-white/5 rounded flex items-start justify-between gap-3 text-left"
              >
                <div className="space-y-1 overflow-hidden font-mono text-[11px]">
                  <div className="flex items-center gap-2 text-white font-sans font-semibold text-xs">
                    <span>{ses.device}</span>
                    {ses.current && (
                      <span className="text-[8px] bg-emerald-500/10 text-[#00FF94] px-1 py-0.2 rounded font-mono uppercase">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="text-gray-400 flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-[#00D1FF] select-none shrink-0" />
                    <span>{ses.location}</span>
                  </div>
                  <div className="text-gray-500 text-[10px]">
                    IP: {ses.ip} ━ {ses.browser}
                  </div>
                </div>

                {!ses.current && (
                  <button
                    onClick={() => handleRevokeSession(ses.id, ses.device)}
                    className="p-1.5 text-gray-400 hover:text-red-400 border border-white/5 hover:border-red-500/15 bg-[#030508] rounded transition shrink-0"
                    title="Revoke session cookie token"
                    id={`btn-revoke-session-${ses.id}`}
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Action toast info */}
          {actionFeedback && (
            <div className="p-2.5 bg-cyan-400/10 border border-cyan-400/20 text-[#00D1FF] rounded font-mono text-[10px] text-center">
              ● CRITICAL DEFENSE: {actionFeedback}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
