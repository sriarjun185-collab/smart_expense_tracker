import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon, Menu, X, Wallet } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-[#08090d]/65 backdrop-blur-glass">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left branding */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary-500 to-accent-cyan shadow-glow-primary">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <span className="font-sans text-lg font-bold tracking-tight text-white sm:block">
              Smart Expense Tracker
            </span>
          </Link>
        </div>

        {/* Right user profile & settings dropdown */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/5 p-1.5 pr-3 hover:bg-white/10 hover:border-white/10 transition"
            >
              {user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt="Profile"
                  className="h-7 w-7 rounded-lg object-cover border border-white/10"
                />
              ) : (
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-primary-600 to-primary-800 text-xs font-bold text-white">
                  {getInitials(user.name)}
                </div>
              )}
              <span className="hidden text-sm font-medium text-gray-300 sm:block max-w-[120px] truncate">
                {user.name}
              </span>
            </button>

            {dropdownOpen && (
              <>
                {/* Backdrop overlay to close */}
                <div 
                  className="fixed inset-0 z-30" 
                  onClick={() => setDropdownOpen(false)}
                />
                
                {/* Dropdown panel */}
                <div className="absolute right-0 mt-2.5 w-56 origin-top-right rounded-xl border border-white/10 bg-[#0e0f14] p-1.5 shadow-glass-lg backdrop-blur-xl z-40 animate-fade-in">
                  <div className="px-3 py-2 border-b border-white/5 mb-1.5">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Signed in as</p>
                    <p className="text-sm font-medium text-white truncate">{user.email}</p>
                  </div>
                  
                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition"
                  >
                    <UserIcon className="w-4 h-4 text-primary-400" />
                    My Profile
                  </Link>
                  
                  <Link
                    to="/settings"
                    onClick={() => setDropdownOpen(false)}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition"
                  >
                    <Wallet className="w-4 h-4 text-accent-cyan" />
                    Settings
                  </Link>
                  
                  <hr className="my-1.5 border-white/5" />
                  
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      handleLogout();
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10 transition"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
