/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Key, 
  Eye, 
  Trash2, 
  Copy, 
  Check, 
  Bell, 
  ShieldAlert, 
  CheckCircle,
  FileText,
  Lock,
  Download,
  Terminal,
  Layers,
  Sparkles
} from 'lucide-react';
import { ApiCredential } from '../types';
import { INITIAL_API_CREDENTIALS } from '../mockData';

interface SettingsPageProps {
  userEmail: string;
}

export default function SettingsPage({ userEmail }: SettingsPageProps) {
  const [credentials, setCredentials] = useState<ApiCredential[]>(INITIAL_API_CREDENTIALS);
  
  // New API form
  const [apiKeyName, setApiKeyName] = useState('');
  const [chkRead, setChkRead] = useState(true);
  const [chkTrade, setChkTrade] = useState(true);
  const [chkWithdraw, setChkWithdraw] = useState(false);

  // New generated Key overlay reveal
  const [revealedSecret, setRevealedSecret] = useState<string | null>(null);
  const [revealedKeyName, setRevealedKeyName] = useState('');
  const [copyStatus, setCopyStatus] = useState(false);

  // Notifications toggles
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifTrade, setNotifTrade] = useState(true);
  const [notifWeekly, setNotifWeekly] = useState(true);

  const handleCreateApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKeyName.trim()) return;

    const perms: ('READ' | 'TRADE' | 'WITHDRAW')[] = [];
    if (chkRead) perms.push('READ');
    if (chkTrade) perms.push('TRADE');
    if (chkWithdraw) perms.push('WITHDRAW');

    const randPub = 'aethel_pub_' + Array.from({length: 12}, () => Math.floor(Math.random()*16).toString(16)).join('');
    // Generate private secret
    const secret = 'aethel_sec_' + Array.from({length: 32}, () => Math.floor(Math.random()*16).toString(16)).join('');

    const newKey: ApiCredential = {
      id: 'API-' + Math.floor(Math.random() * 900 + 100),
      name: apiKeyName.trim(),
      publicKey: randPub,
      permissions: perms,
      created: '2026-06-02',
      lastUsed: 'Never used'
    };

    setCredentials(prev => [newKey, ...prev]);
    setRevealedKeyName(apiKeyName.trim());
    setRevealedSecret(secret); // Show private secret overlay
    setApiKeyName('');
  };

  const handleRevokeKey = (id: string) => {
    setCredentials(prev => prev.filter(c => c.id !== id));
  };

  const handleCopySecret = () => {
    if (revealedSecret) {
      navigator.clipboard.writeText(revealedSecret);
      setCopyStatus(true);
      setTimeout(() => setCopyStatus(false), 2000);
    }
  };

  return (
    <div className="flex-grow flex flex-col p-4 md:p-6 space-y-6 max-w-7xl mx-auto w-full z-10">
      
      {/* 1. PROFILE DETAILS & KYC STATUS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
        
        {/* Profile Card details (7 columns) */}
        <div className="md:col-span-7 terminal-card rounded p-6 space-y-5 text-left">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <span className="font-display font-semibold text-xs uppercase tracking-wider text-white">Sovereign Profile Registry</span>
            <span className="text-[9px] font-mono text-[#00D1FF] uppercase">Registered user</span>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-sm bg-gradient-to-br from-[#D4AF37] to-amber-600 flex items-center justify-center text-black font-display font-bold text-lg select-none shrink-0 border border-white/10">
              Æ
            </div>
            <div className="space-y-1.5 font-mono text-xs overflow-hidden flex-1">
              <div className="text-sm font-sans font-bold text-white mb-0.5">Thomas Sovereign (Institutional)</div>
              
              <div className="flex items-center gap-2 text-gray-400">
                <Mail className="w-3.5 h-3.5 text-[#00D1FF] shrink-0 select-none" />
                <span className="truncate">{userEmail}</span>
              </div>
              
              <div className="text-gray-500 text-[10px]">
                Authorized Routing Level: <strong>Class-B Broker Signature</strong>
              </div>
            </div>
          </div>

          {/* Verification (KYC) progress status logs */}
          <div className="bg-[#04060b] p-4 rounded border border-white/5 space-y-3 font-mono text-xs text-left">
            <div className="flex items-center justify-between text-[11px] border-b border-white/5 pb-1.5">
              <span className="text-gray-400 uppercase">Verification Level: <strong>Sovereign Tier Tier-2</strong></span>
              <span className="text-[#00FF94] font-semibold flex items-center gap-1 uppercase">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Cleared</span>
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-[11px]">
              <div className="space-y-0.5 text-left">
                <span className="text-gray-500 block">Daily Buy/Sell Caps:</span>
                <span className="text-white font-semibold">1,000,000 USDT</span>
              </div>
              <div className="space-y-0.5 text-left">
                <span className="text-gray-500 block">Daily Outbound Release Limit:</span>
                <span className="text-[#D4AF37] font-semibold">500.00 BTC / day</span>
              </div>
            </div>

            <div className="pt-1.5 flex items-center gap-1.5 text-gray-500 text-[10px] uppercase">
              <FileText className="w-3.5 h-3.5" />
              <span>KYC records backed by national ledger hash verification</span>
            </div>
          </div>
        </div>

        {/* Notification details checklist (5 columns) */}
        <div className="md:col-span-5 terminal-card rounded p-6 space-y-5 text-left">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <span className="font-display font-semibold text-xs uppercase tracking-wider text-white">System Notifications</span>
            <Bell className="w-4 h-4 text-[#D4AF37]" />
          </div>

          <div className="space-y-3 font-sans text-xs">
            {/* option 1 */}
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={notifEmail} 
                onChange={(e) => setNotifEmail(e.target.checked)} 
                className="accent-[#D4AF37] size-3.5 mt-0.5 cursor-pointer"
              />
              <div className="space-y-0.5">
                <span className="text-white font-semibold">Daily Audit PDF Reports</span>
                <span className="text-gray-500 text-[10px] block">Dispatches signed accounting books of balances to registered email address.</span>
              </div>
            </label>

            {/* option 2 */}
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={notifTrade} 
                onChange={(e) => setNotifTrade(e.target.checked)} 
                className="accent-[#D4AF37] size-3.5 mt-0.5 cursor-pointer"
              />
              <div className="space-y-0.5">
                <span className="text-white font-semibold">Immediate Order Execution Telegrams</span>
                <span className="text-gray-500 text-[10px] block">Flashes secure SMS on limit fills, triggered stop-losses, and whitelists.</span>
              </div>
            </label>

            {/* option 3 */}
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={notifWeekly} 
                onChange={(e) => setNotifWeekly(e.target.checked)} 
                className="accent-[#D4AF37] size-3.5 mt-0.5 cursor-pointer"
              />
              <div className="space-y-0.5">
                <span className="text-white font-semibold">Sovereign Consensus Alerts</span>
                <span className="text-gray-500 text-[10px] block">Warns of physical vault audits, key updates, and consensus changes.</span>
              </div>
            </label>
          </div>
        </div>

      </div>

      {/* 2. API TRADING KEYS ARCHITECTURE MANAGEMENT (Grid columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                {/* Core Generator Form (5 columns) */}
        <div className="lg:col-span-5 terminal-card rounded p-6 space-y-4 text-left">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <div className="flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-[#00D1FF]" />
              <span className="font-display font-semibold text-xs uppercase tracking-wider text-white">Issue Algotrading API Key</span>
            </div>
            <span className="text-[9px] font-mono text-[#00D1FF] uppercase">API SECURE</span>
          </div>

          <form onSubmit={handleCreateApiKey} className="space-y-4 font-mono text-xs">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block">Trading Key Label / Name</label>
              <input
                type="text"
                placeholder="E.g. Trading Desk Client London..."
                className="w-full bg-[#05070A] border border-white/10 rounded px-3 py-2 text-xs font-sans text-white focus:outline-none focus:border-[#00D1FF] placeholder-gray-600 text-left"
                value={apiKeyName}
                onChange={(e) => setApiKeyName(e.target.value)}
                required
                id="api-key-name"
              />
            </div>

            {/* Scope selectors checkboxes */}
            <div className="space-y-2">
              <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block">Authorization Scope (Permissions)</label>
              <div className="grid grid-cols-3 gap-2 bg-[#04060b] p-2 border border-white/5 rounded text-[11px]">
                
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={chkRead} 
                    onChange={(e) => setChkRead(e.target.checked)} 
                    className="accent-[#00D1FF] size-3 cursor-pointer"
                  />
                  <span>READ</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={chkTrade} 
                    onChange={(e) => setChkTrade(e.target.checked)} 
                    className="accent-[#00D1FF] size-3 cursor-pointer"
                  />
                  <span>TRADE</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={chkWithdraw} 
                    onChange={(e) => setChkWithdraw(e.target.checked)} 
                    className="accent-[#00D1FF] size-3 cursor-pointer"
                  />
                  <span className="text-red-400 font-semibold" title="Withdrawals permission poses high asset extraction risk">WITHDRAW</span>
                </label>

              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#D4AF37] hover:bg-amber-500 text-black font-semibold font-display uppercase tracking-widest text-xs rounded transition cursor-pointer"
              id="btn-generate-api"
            >
              Issue Credentials Pair
            </button>
          </form>

          {/* Reveal dialog box popup inside side column ONLY ONCE */}
          {revealedSecret && (
            <div className="bg-amber-500/10 p-4 rounded border border-amber-500/25 space-y-3 font-mono text-xs text-left animate-pulse">
              <div className="flex items-center justify-between text-[10px] uppercase text-[#D4AF37] font-sans font-bold">
                <span className="flex items-center gap-1">🛡️ PRIVATE SECRET REVEALED</span>
                <span>COPY NOW (VISIBLE ONCE!)</span>
              </div>
              <p className="text-[10px] text-gray-400 leading-relaxed font-sans">
                Save this key private string inside standard offline secure vaults immediately.
              </p>
              
              <div className="flex items-center gap-2 bg-[#030508] p-2 rounded border border-white/5">
                <span className="text-[10px] text-[#00D1FF] select-all break-all overflow-hidden flex-1 leading-snug">
                  {revealedSecret}
                </span>
                <button
                  onClick={handleCopySecret}
                  className="p-1.5 bg-white/5 border border-white/10 hover:border-[#00FF94]/30 text-gray-400 hover:text-[#00FF94] rounded transition shrink-0"
                  id="btn-copy-secret"
                >
                  {copyStatus ? <Check className="w-3.5 h-3.5 text-[#00FF94]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <button
                onClick={() => setRevealedSecret(null)}
                className="w-full py-1 text-center bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded text-[10px] transition font-sans uppercase font-semibold"
              >
                Acknowledge and Terminate Display
              </button>
            </div>
          )}
        </div>

        {/* Existing keys table panel (7 columns) */}
        <div className="lg:col-span-7 terminal-card rounded p-6 space-y-4 text-left">
          <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
            <span className="font-display font-semibold text-xs uppercase tracking-wider text-white">Active Issued API Tunnels ({credentials.length})</span>
            <span className="text-[9px] font-mono text-gray-500">Authorized bots</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs text-gray-300">
              <thead>
                <tr className="border-b border-white/5 text-gray-500 uppercase text-[9px] tracking-wider font-mono">
                  <th className="pb-2 pl-1">ID</th>
                  <th className="pb-2">Tunnel label</th>
                  <th className="pb-2">Public credentials</th>
                  <th className="pb-2 text-center">Scopes</th>
                  <th className="pb-2 text-right">Last active</th>
                  <th className="pb-2 text-right pr-1">Action</th>
                </tr>
              </thead>
              <tbody>
                {credentials.map((cred) => (
                  <tr key={cred.id} className="border-b border-white/5 hover:bg-white/5 transition duration-150">
                    <td className="py-3 pl-1 font-bold text-gray-400">{cred.id}</td>
                    <td className="py-3 text-white font-sans font-semibold text-xs">{cred.name}</td>
                    <td className="py-3 text-[10px] text-gray-400 font-mono select-all truncate max-w-[120px]" title={cred.publicKey}>
                      {cred.publicKey}
                    </td>
                    <td className="py-3 text-center">
                      <div className="flex justify-center gap-1 font-mono text-[9px]">
                        {cred.permissions.map((p) => (
                          <span 
                            key={p} 
                            className={`px-1 py-0.2 rounded-xs font-semibold ${
                              p === 'READ' 
                                ? 'bg-[#00D1FF]/10 text-[#00D1FF]' 
                                : p === 'TRADE' 
                                ? 'bg-[#00FF94]/10 text-[#00FF94]' 
                                : 'bg-[#FF3B3B]/10 text-[#FF3B3B]'
                            }`}
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 text-right text-gray-400 text-[10px] font-mono-numbers">{cred.lastUsed}</td>
                    <td className="py-3 text-right pr-1">
                      <button
                        onClick={() => handleRevokeKey(cred.id)}
                        className="p-1.5 text-gray-500 hover:text-red-400 border border-white/5 hover:border-red-500/15 bg-white/5 rounded transition shrink-0"
                        title="Revoke and cancel credentials tunnel"
                        id={`btn-revoke-key-${cred.id}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-[10px] font-mono text-gray-500 leading-relaxed uppercase">
            API access points must be configured with specific endpoint whitelists for maximum defensive guarantees. Outward routes are monitored by AI shield pattern analysis.
          </p>
        </div>

      </div>

    </div>
  );
}
