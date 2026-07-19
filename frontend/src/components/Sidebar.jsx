import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ArrowUpRight, 
  ArrowDownRight, 
  History, 
  Settings, 
  User,
  X
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const navItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />
    },
    {
      label: 'Add Income',
      path: '/add-income',
      icon: <ArrowUpRight className="w-5 h-5 text-emerald-400" />
    },
    {
      label: 'Add Expense',
      path: '/add-expense',
      icon: <ArrowDownRight className="w-5 h-5 text-rose-400" />
    },
    {
      label: 'History',
      path: '/transactions',
      icon: <History className="w-5 h-5" />
    },
    {
      label: 'Profile',
      path: '/profile',
      icon: <User className="w-5 h-5" />
    },
    {
      label: 'Settings',
      path: '/settings',
      icon: <Settings className="w-5 h-5" />
    }
  ];

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed bottom-0 top-16 z-40 w-64 border-r border-white/5 bg-[#08090d]/80 backdrop-blur-glass transition-transform lg:sticky lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col justify-between px-4 py-6">
          <div className="space-y-6">
            {/* Header for mobile view */}
            <div className="flex items-center justify-between lg:hidden mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Navigation</span>
              <button 
                onClick={onClose}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-white/5 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav list */}
            <nav className="space-y-1.5">
              {navItems.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-medium transition duration-200 ${
                      isActive
                        ? 'bg-primary-500/10 text-primary-300 border border-primary-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'
                    }`
                  }
                >
                  {item.icon}
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Footer branding */}
          <div className="rounded-2xl border border-white/5 bg-white/5 p-4 text-center">
            <h4 className="text-xs font-semibold text-gray-300">Track smarter.</h4>
            <p className="mt-1 text-[11px] text-gray-500">
              Manage your daily budgets, monitor savings, and build wealth.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
