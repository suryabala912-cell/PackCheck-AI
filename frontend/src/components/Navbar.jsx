import React, { useState } from 'react';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  Scan, 
  History, 
  FileCheck2, 
  LogOut, 
  User, 
  Menu, 
  X,
  Scale
} from 'lucide-react';

export default function Navbar({ currentUser, currentPath, onNavigate, onLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'SUPERVISOR':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Image Scan', path: '/scan', icon: Scan },
    { label: 'Scan History', path: '/scans', icon: History },
    { label: 'Review Queue', path: '/reviews', icon: FileCheck2 },
  ];

  const handleNavClick = (path) => {
    onNavigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Title */}
          <div 
            onClick={() => handleNavClick('/')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="p-2 bg-blue-600 text-white rounded-xl shadow-xs group-hover:bg-blue-700 transition">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-lg tracking-tight group-hover:text-blue-600 transition">
                  PackCheck AI
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                  SIH26034
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Legal Metrology Compliance System
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path || (item.path === '/scans' && currentPath.startsWith('/scans'));
              
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavClick(item.path)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User Identity & Logout */}
          <div className="hidden sm:flex items-center gap-3">
            {currentUser && (
              <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="w-7 h-7 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 font-bold text-xs shrink-0">
                  <User className="w-3.5 h-3.5" />
                </div>
                <div className="text-left leading-tight">
                  <div className="text-xs font-semibold text-slate-900 truncate max-w-[130px]">
                    {currentUser.full_name || currentUser.fullName}
                  </div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${getRoleBadgeStyle(currentUser.role)}`}>
                    {currentUser.role}
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={onLogout}
              title="Sign Out"
              className="p-2 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 hover:border-rose-200 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 transition"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-4 space-y-2 animate-fade-in shadow-lg">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path || (item.path === '/scans' && currentPath.startsWith('/scans'));
            
            return (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4 text-blue-600" />
                <span>{item.label}</span>
              </button>
            );
          })}

          {currentUser && (
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900">
                    {currentUser.full_name || currentUser.fullName}
                  </div>
                  <div className="text-[10px] text-slate-500">{currentUser.email}</div>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-600 border border-rose-200 text-xs font-medium flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
