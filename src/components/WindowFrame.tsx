import React from 'react';
import { Minus, Square, X, LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface WindowFrameProps {
  id: string;
  title: string;
  icon?: LucideIcon;
  isOpen: boolean;
  isFocused: boolean;
  onFocus: () => void;
  onClose: () => void;
  onMinimize?: () => void;
  children: React.ReactNode;
}

export const WindowFrame: React.FC<WindowFrameProps> = ({
  id,
  title,
  icon: Icon,
  isOpen,
  isFocused,
  onFocus,
  onClose,
  onMinimize,
  children
}) => {
  if (!isOpen) return null;

  return (
    <motion.div
      id={`window-frame-${id}`}
      initial={{ opacity: 0, scale: 0.96, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: 10 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      onClick={onFocus}
      className={`absolute flex flex-col rounded-xl overflow-hidden border shadow-2xl transition-all duration-150 ${
        isFocused
          ? 'border-cyan-500/40 shadow-cyan-950/30 z-30 ring-1 ring-cyan-500/20'
          : 'border-slate-800 shadow-slate-950/80 z-20 opacity-95'
      }`}
      style={{
        width: 'min(780px, 92vw)',
        height: 'min(520px, 72vh)',
        top: '12%',
        left: 'calc(50% - min(390px, 46vw))',
      }}
    >
      {/* Window Title Bar */}
      <div
        id={`window-titlebar-${id}`}
        className={`flex items-center justify-between px-3 py-2 select-none cursor-default border-b transition-colors ${
          isFocused
            ? 'bg-slate-900 border-slate-800 text-slate-100'
            : 'bg-slate-950 border-slate-800/80 text-slate-400'
        }`}
      >
        <div className="flex items-center gap-2 text-xs font-semibold tracking-wide">
          {Icon && <Icon className={`w-3.5 h-3.5 ${isFocused ? 'text-cyan-400' : 'text-slate-500'}`} />}
          <span>{title}</span>
        </div>

        {/* Window Controls */}
        <div className="flex items-center gap-1">
          {onMinimize && (
            <button
              id={`window-min-btn-${id}`}
              onClick={(e) => { e.stopPropagation(); onMinimize(); }}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
              title="Minimize"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            id={`window-close-btn-${id}`}
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="p-1 rounded hover:bg-rose-950 hover:text-rose-300 text-slate-400 transition"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Window Body */}
      <div className="flex-1 overflow-hidden bg-slate-900">
        {children}
      </div>
    </motion.div>
  );
};
