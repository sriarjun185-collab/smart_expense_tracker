import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose, duration = 4000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const config = {
    success: {
      bg: 'rgba(16, 185, 129, 0.1)',
      border: 'border-emerald-500/30',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
      glow: 'shadow-glow-emerald'
    },
    error: {
      bg: 'rgba(244, 63, 94, 0.1)',
      border: 'border-rose-500/30',
      icon: <XCircle className="w-5 h-5 text-rose-400" />,
      glow: 'shadow-glow-rose'
    },
    warning: {
      bg: 'rgba(245, 158, 11, 0.1)',
      border: 'border-amber-500/30',
      icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
      glow: 'shadow-[0_0_15px_rgba(245,158,11,0.25)]'
    }
  }[type];

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl backdrop-blur-xl border ${config.border} ${config.bg} ${config.glow} text-white text-sm max-w-sm animate-slide-up`}>
      <div className="flex-shrink-0">{config.icon}</div>
      <div className="font-medium mr-2">{message}</div>
      <button 
        onClick={onClose} 
        className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;
