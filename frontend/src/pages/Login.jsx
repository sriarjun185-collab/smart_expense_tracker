import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wallet, Mail, Lock, Loader2 } from 'lucide-react';
import Toast from '../components/Toast';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      await login(email, password);
      setSuccessMsg('Logged in successfully! Redirecting...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (err) {
      setErrorMsg(err.message || 'Invalid email or password.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08090d] flex items-center justify-center px-4 relative overflow-hidden">
      
      {/* Background glow filters */}
      <div className="absolute top-[20%] left-[25%] w-[400px] h-[400px] rounded-full bg-primary-600/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[25%] w-[400px] h-[400px] rounded-full bg-accent-cyan/5 blur-[100px] pointer-events-none" />

      {/* Polish Toast Alerts */}
      {errorMsg && (
        <Toast 
          message={errorMsg} 
          type="error" 
          onClose={() => setErrorMsg('')} 
        />
      )}
      {successMsg && (
        <Toast 
          message={successMsg} 
          type="success" 
          onClose={() => setSuccessMsg('')} 
        />
      )}

      <div className="w-full max-w-md relative z-10 animate-slide-up">
        {/* Brand logo header */}
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="flex items-center gap-2.5 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-primary-500 to-accent-cyan shadow-glow-primary">
              <Wallet className="h-5.5 w-5.5 text-white" />
            </div>
            <span className="font-sans text-xl font-bold tracking-tight text-white">
              Smart Expense Tracker
            </span>
          </Link>
          <p className="text-gray-400 text-sm font-light">Sign in to your financial vault</p>
        </div>

        {/* Login form container */}
        <div className="glass-card rounded-2xl p-8 border border-white/10">
          <h2 className="text-xl font-bold text-white mb-6">Welcome Back</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="glass-input pl-10 w-full text-sm"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Password</label>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="glass-input pl-10 w-full text-sm"
                  required
                />
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4.5 h-4.5 animate-spin" />
                  Authenticating...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        {/* Footer Navigation */}
        <p className="text-center text-sm text-gray-400 mt-6 font-light">
          Don't have an account yet?{' '}
          <Link to="/signup" className="text-primary-400 hover:text-primary-300 font-semibold hover:underline">
            Sign up for free
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
