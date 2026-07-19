import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Calendar, AlertCircle, ShieldAlert, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { user } = useAuth();

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
    <div className="space-y-6 max-w-3xl mx-auto animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
          My Profile
        </h1>
        <p className="text-gray-400 text-sm font-light mt-0.5">
          View your registered personal and financial details.
        </p>
      </div>

      <div className="glass-card rounded-2xl p-8 border border-white/5 space-y-8 relative overflow-hidden">
        
        {/* Decorative corner glows */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/10 rounded-full blur-xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent-cyan/5 rounded-full blur-xl" />

        <div className="flex flex-col items-center sm:flex-row gap-6 pb-6 border-b border-white/5 relative z-10">
          {/* Avatar */}
          {user?.profilePicture ? (
            <img
              src={user.profilePicture}
              alt="Profile"
              className="h-24 w-24 rounded-2xl object-cover border border-white/10 shadow-glow-primary"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary-600 to-primary-800 text-3xl font-bold text-white shadow-glow-primary">
              {getInitials(user?.name)}
            </div>
          )}

          <div className="text-center sm:text-left space-y-1">
            <h2 className="text-xl font-bold text-white">{user?.name || 'Smart User'}</h2>
            <p className="text-sm text-gray-400 font-light flex items-center justify-center sm:justify-start gap-2">
              <Mail className="w-4 h-4 text-primary-400" />
              {user?.email}
            </p>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 px-3 py-1 text-xs font-semibold text-primary-300 mt-2">
              <Award className="w-3.5 h-3.5" />
              Level 1 Wealth Builder
            </span>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          <div className="rounded-xl border border-white/5 bg-white/5 p-5">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Finance Targets</h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Monthly Budget Threshold:</span>
                <span className="font-bold text-white">
                  {user?.monthlyBudgetLimit > 0 ? `₹${user.monthlyBudgetLimit.toLocaleString('en-IN')}` : 'Not Configured'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Target Warning Ratio:</span>
                <span className="font-semibold text-amber-400">80% of limit</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/5 bg-white/5 p-5">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">System Meta</h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Secure Vault Status:</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  Active
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Client Platform:</span>
                <span className="font-semibold text-white">Web React Client</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions bar */}
        <div className="flex gap-4 pt-4 border-t border-white/5 relative z-10">
          <Link to="/settings" className="btn-primary rounded-xl px-5 py-2.5 text-sm font-bold text-white">
            Edit Profile & Settings
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Profile;
