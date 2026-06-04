/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  ShoppingBag, 
  Search, 
  BookOpen, 
  TrendingUp, 
  ShieldCheck, 
  Coins, 
  Heart,
  Bot,
  Layers
} from 'lucide-react';
import { UserRole } from '../types';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onSearch: (term: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  wishlistCount: number;
  onOpenAssistant: () => void;
  onOpenLogin: () => void;
}

export default function Header({ 
  currentRole, 
  onRoleChange, 
  onSearch, 
  activeTab, 
  setActiveTab,
  wishlistCount,
  onOpenAssistant,
  onOpenLogin
}: HeaderProps) {
  const [term, setTerm] = React.useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(term);
    setActiveTab('catalog');
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN: return 'border-rose-300 text-rose-700 bg-rose-50/50';
      case UserRole.PARTNER: return 'border-emerald-300 text-emerald-800 bg-emerald-50/50';
      case UserRole.CUSTOMER: return 'border-amber-300 text-amber-800 bg-amber-50/50';
      default: return 'border-zinc-300 text-zinc-600 bg-zinc-50';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#121212]/15 bg-[#FCFBFA]/95 backdrop-blur-md">
      {/* Editorial Simulation Status Bar */}
      <div className="bg-[#121212] px-4 sm:px-6 py-2 flex flex-col sm:flex-row gap-2 sm:gap-0 items-center justify-between text-[11px] text-zinc-300 font-sans tracking-tight">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 sm:gap-2">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#D9411E] animate-pulse"></span>
          <span className="font-mono text-zinc-400 text-[10px] sm:text-[11px]">STATUS: ACTIVE SEEDS</span>
          <span className="text-zinc-600 hidden xs:inline">|</span>
          <span className="italic text-zinc-300 text-[10px] sm:text-[11px] text-center sm:text-left">Reseller Commission Aggregator & AI Assistant</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            {currentRole === UserRole.GUEST ? (
              <button
                id="login-trigger"
                onClick={onOpenLogin}
                className="bg-[#D9411E] hover:bg-white hover:text-black hover:border-[#D9411E] text-white px-3 sm:px-4 py-1.5 font-sans text-[9px] sm:text-[10px] font-bold uppercase tracking-wider transition-all duration-300 border border-[#D9411E] shadow-sm transform hover:scale-[1.02] cursor-pointer"
              >
                SIGN IN / SIGN UP
              </button>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-[9px] sm:text-[10px] uppercase font-mono tracking-widest text-[#D9411E] font-bold">
                  {currentRole === UserRole.ADMIN ? 'ADMIN' : 'CUSTOMER'}
                </span>
                <button
                  id="signout-trigger"
                  onClick={() => onRoleChange(UserRole.GUEST)}
                  className="bg-zinc-800 hover:bg-[#D9411E] text-white px-3 sm:px-4 py-1.5 font-sans text-[9px] sm:text-[10px] font-bold uppercase tracking-wider transition-all duration-300 border border-zinc-700 hover:border-[#D9411E] shadow-sm cursor-pointer"
                >
                  LOGOUT
                </button>
              </div>
            )}
          </div>
          <span className="text-[9px] sm:text-[10px] uppercase font-mono tracking-widest font-bold text-white bg-[#D9411E] py-0.5 px-1.5 sm:px-2">
            KES Market
          </span>
        </div>
      </div>

      <div className="mx-auto flex flex-col md:flex-row md:h-20 max-w-7xl items-center justify-between px-4 sm:px-6 py-3.5 md:py-0 gap-3 md:gap-0">
        {/* Top brand row on mobile, styled side-by-side on desktop */}
        <div className="w-full md:w-auto flex items-center justify-between md:justify-start gap-4">
          {/* Brand Logo - Editorial Large Headings */}
          <div 
            onClick={() => setActiveTab('landing')} 
            className="flex cursor-pointer items-center gap-2.5 sm:gap-3 group"
          >
            <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center border border-[#121212] bg-[#121212] text-white transition-all group-hover:bg-[#D9411E] group-hover:border-[#D9411E]">
              <ShoppingBag className="h-4.5 w-4.5 sm:h-5 w-5" id="logo-icon" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tighter text-[#121212] font-serif uppercase leading-none" id="brand-title">
                DEALY <span className="text-[#D9411E] italic">KE</span>
              </h1>
              <p className="text-[9px] sm:text-[10px] font-bold text-[#121212]/60 uppercase tracking-[0.15em] sm:tracking-[0.2em] mt-0.5 font-sans">
                Curated Discovery
              </p>
            </div>
          </div>

          {/* Mobile Right Actions (Only visible on screens below md) */}
          <div className="flex md:hidden items-center gap-1.5 xs:gap-2 shrink-0">
            {/* Interactive AI Shopping toggle */}
            <button
              id="trigger-assistant-btn-mobile"
              onClick={onOpenAssistant}
              className="flex items-center gap-1 bg-[#D9411E] hover:bg-black text-white px-2.5 py-1.5 font-sans uppercase text-[10px] xs:text-[11px] tracking-wider font-bold transition shadow-sm shrink-0"
            >
              <Bot className="h-3.5 w-3.5 shrink-0" />
              <span className="whitespace-nowrap">AI Agent</span>
            </button>

            {currentRole !== UserRole.GUEST && (
              <button
                id="wishlist-btn-mobile"
                onClick={() => {
                  if (currentRole === UserRole.CUSTOMER) setActiveTab('customer-desk');
                  else setActiveTab('catalog');
                }}
                className="relative p-1.5 text-[#121212]/80 hover:text-[#D9411E] hover:bg-zinc-100 transition shrink-0"
                title="My Wishlist Items"
              >
                <Heart className="h-4 w-4" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#D9411E] text-white font-mono text-[8px] h-3.5 w-3.5 rounded-full flex items-center justify-center border border-[#FCFBFA]">
                    {wishlistCount}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Minimal Editorial Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hidden lg:flex relative flex-1 max-w-sm mx-10">
          <input
            type="text"
            id="global-search-input"
            placeholder="Search products, guides, deal drops..."
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            className="w-full bg-white border-b border-[#121212]/30 py-1.5 pl-1 pr-8 text-xs font-sans placeholder-[#121212]/45 focus:outline-none focus:border-[#D9411E] transition-colors"
          />
          <button type="submit" id="search-btn" className="absolute right-1 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-[#D9411E] transition">
            <Search className="h-3.5 w-3.5" />
          </button>
        </form>

        {/* Navigations tabs with editorial thin font borders */}
        <nav className="w-full md:w-auto flex flex-wrap items-center justify-center md:justify-end gap-1 sm:gap-2.5 md:gap-4 border-t md:border-t-0 pt-2 md:pt-0 mt-0.5 md:mt-0">
          <button
            id="nav-tab-catalog"
            onClick={() => setActiveTab('catalog')}
            className={`text-xs uppercase tracking-widest py-1.5 px-2.5 transition font-semibold font-sans ${activeTab === 'catalog' ? 'text-[#D9411E] border-b-2 border-[#D9411E]' : 'text-[#121212]/80 hover:text-[#121212]'}`}
          >
            Catalog
          </button>
          
          <button
            id="nav-tab-blogs"
            onClick={() => setActiveTab('blogs')}
            className={`text-xs uppercase tracking-widest py-1.5 px-2.5 transition font-semibold font-sans flex items-center gap-1.5 ${activeTab === 'blogs' ? 'text-[#D9411E] border-b-2 border-[#D9411E]' : 'text-[#121212]/80 hover:text-[#121212]'}`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Guides</span>
          </button>

          {/* Role specific workspace tabs with vintage tag layout */}
          {currentRole === UserRole.CUSTOMER && (
            <button
              id="nav-tab-customer"
              onClick={() => setActiveTab('customer-desk')}
              className={`text-xs uppercase tracking-widest py-1.5 px-2 transition font-mono border ${activeTab === 'customer-desk' ? 'bg-[#D9411E] text-white border-[#D9411E]' : 'bg-transparent text-[#121212] hover:bg-zinc-100 border-[#121212]/15'}`}
            >
              MY ORDERS
            </button>
          )}

          {currentRole === UserRole.PARTNER && (
            <button
              id="nav-tab-partner"
              onClick={() => setActiveTab('partner-desk')}
              className={`text-xs uppercase tracking-widest py-1.5 px-2 transition font-mono border ${activeTab === 'partner-desk' ? 'border-[#D9411E] bg-[#D9411E] text-white' : 'border-[#121212]/15 text-emerald-800 bg-emerald-50/20 hover:bg-emerald-50'}`}
            >
              Partner
            </button>
          )}

          {currentRole === UserRole.ADMIN && (
            <button
              id="nav-tab-admin"
              onClick={() => setActiveTab('admin-desk')}
              className={`text-xs uppercase tracking-widest py-1.5 px-2 transition font-mono border ${activeTab === 'admin-desk' ? 'border-rose-900 bg-rose-950 text-white' : 'border-rose-300 text-rose-950 bg-rose-50/50 hover:bg-rose-50'}`}
            >
              Admin CMS
            </button>
          )}

          {/* Right Area Icons - Hidden on small screens */}
          <div className="hidden md:flex items-center gap-3 border-l border-[#121212]/15 pl-4 ml-2">
            
            {/* Interactive AI Shopping toggle with live attention badge */}
            <button
              id="trigger-assistant-btn"
              onClick={onOpenAssistant}
              className="flex items-center gap-1.5 bg-[#D9411E] hover:bg-black text-white px-3 py-1.5 font-sans uppercase text-[10px] tracking-widest font-bold transition shadow-sm"
            >
              <Bot className="h-3.5 w-3.5" />
              <span>AI Agent</span>
            </button>

            {currentRole !== UserRole.GUEST && (
              <button
                id="wishlist-btn"
                onClick={() => {
                  if (currentRole === UserRole.CUSTOMER) setActiveTab('customer-desk');
                  else setActiveTab('catalog');
                }}
                className="relative p-1.5 text-[#121212]/80 hover:text-[#D9411E] hover:bg-zinc-100 transition"
                title="My Wishlist Items"
              >
                <Heart className="h-4.5 w-4.5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#D9411E] text-white font-mono text-[9px] h-4 w-4 rounded-full flex items-center justify-center border border-[#FCFBFA]">
                    {wishlistCount}
                  </span>
                )}
              </button>
            )}

            <div className="hidden xs:flex items-center">
              <span className={`text-[9px] font-mono tracking-wider font-bold border px-2.5 py-1 ${getRoleColor(currentRole)}`}>
                {currentRole}
              </span>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
