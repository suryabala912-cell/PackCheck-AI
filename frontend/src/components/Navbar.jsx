import React from 'react';
import { Shield, Scan, History, FileCheck, LayoutDashboard, LogOut, User as UserIcon } from 'lucide-react';

export default function Navbar({ currentUser, currentPath, onNavigate, onLogout }) {
  if (!currentUser) return null;

  const roleName = currentUser.role || 'ENFORCEMENT_OFFICER';
  const roleDisplay = roleName.replace('_', ' ');

  const navItems = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { key: 'scan', label: 'Image Scan', icon: Scan, path: '/scan' },
    { key: 'history', label: 'Scan History', icon: History, path: '/scans' },
    { key: 'reviews', label: 'Review Queue', icon: FileCheck, path: '/reviews' },
  ];

  return (
    <header className="bg-slate-900/90 border-b border-slate-800 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('/')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-500 p-0.5 shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Shield className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base tracking-tight text-slate-100">
                  PackCheck <span className="text-cyan-400">AI</span>
                </h1>
                <span className="text-[10px] font-bold px-1.5 py-0.2 bg-slate-800 text-slate-400 rounded border border-slate-700">
                  PROTOTYPE
                </span>
              </div>
              <p className="text-[10px] font-medium text-slate-400 tracking-wide">
                Legal Metrology Enforcement System
              </p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path));
              return (
                <button
                  key={item.key}
                  onClick={() => onNavigate(item.path)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* User Profile & Logout */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800">
              <UserIcon className="w-4 h-4 text-slate-400" />
              <div className="text-left">
                <p className="text-xs font-semibold text-slate-200 leading-none">
                  {currentUser.full_name || currentUser.fullName || currentUser.email}
                </p>
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                  {roleDisplay}
                </span>
              </div>
            </div>

            <button
              onClick={onLogout}
              title="Logout"
              className="p-2 rounded-lg bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-400 border border-slate-700 transition-colors flex items-center gap-1.5 text-xs font-semibold"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-800/80">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path));
            return (
              <button
                key={item.key}
                onClick={() => onNavigate(item.path)}
                className={`flex flex-col items-center gap-1 px-3 py-1 rounded-md text-[10px] font-semibold transition-all ${
                  isActive ? 'text-cyan-400' : 'text-slate-400'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
