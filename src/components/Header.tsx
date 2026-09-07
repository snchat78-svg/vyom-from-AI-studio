import React from 'react';
import { Bot, Volume2, VolumeX, RefreshCw, LayoutDashboard, MessageSquare, Columns, Sparkles, Mic } from 'lucide-react';
import { SystemState } from '../types';

interface HeaderProps {
  systemState: SystemState | null;
  agentStatus: 'ready' | 'listening' | 'thinking' | 'speaking';
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  language: 'hindi' | 'hinglish' | 'english';
  onChangeLanguage: (lang: 'hindi' | 'hinglish' | 'english') => void;
  viewMode: 'desktop' | 'chat' | 'split';
  onChangeViewMode: (mode: 'desktop' | 'chat' | 'split') => void;
  onResetSession: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  systemState,
  agentStatus,
  voiceEnabled,
  onToggleVoice,
  language,
  onChangeLanguage,
  viewMode,
  onChangeViewMode,
  onResetSession
}) => {
  const getStatusBadge = () => {
    switch (agentStatus) {
      case 'listening':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-950/80 text-rose-300 border border-rose-800/80 animate-pulse">
            <Mic className="w-3 h-3 text-rose-400" /> Listening...
          </span>
        );
      case 'thinking':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-950/80 text-amber-300 border border-amber-800/80 animate-pulse">
            <RefreshCw className="w-3 h-3 text-amber-400 animate-spin" /> Thinking...
          </span>
        );
      case 'speaking':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 animate-pulse">
            <Volume2 className="w-3 h-3 text-cyan-400" /> Speaking...
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> Vyom Ready
          </span>
        );
    }
  };

  return (
    <header id="vyom-global-header" className="h-14 border-b border-slate-800 bg-slate-950/90 backdrop-blur px-4 flex items-center justify-between select-none z-40">
      {/* Brand & Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-950/50">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-bold text-sm text-slate-100 tracking-wide">
              <span>Vyom AI</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">v1.0</span>
            </div>
            <div className="text-[10px] text-slate-400 font-medium">Multilingual Autonomous Runtime</div>
          </div>
        </div>

        <div className="hidden sm:block ml-2">{getStatusBadge()}</div>
      </div>

      {/* Center View Switcher */}
      <div id="view-mode-tabs" className="hidden md:flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
        <button
          id="view-mode-split"
          onClick={() => onChangeViewMode('split')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition ${
            viewMode === 'split' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/60 shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Columns className="w-3.5 h-3.5" /> Workspace + HUD
        </button>
        <button
          id="view-mode-desktop"
          onClick={() => onChangeViewMode('desktop')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition ${
            viewMode === 'desktop' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/60 shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" /> Virtual Desktop
        </button>
        <button
          id="view-mode-chat"
          onClick={() => onChangeViewMode('chat')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition ${
            viewMode === 'chat' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/60 shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" /> Assistant Chat
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Language selector */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
          <button
            onClick={() => onChangeLanguage('english')}
            className={`px-2 py-1 rounded text-[11px] font-medium transition ${language === 'english' ? 'bg-cyan-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'}`}
          >
            EN
          </button>
          <button
            onClick={() => onChangeLanguage('hinglish')}
            className={`px-2 py-1 rounded text-[11px] font-medium transition ${language === 'hinglish' ? 'bg-cyan-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Hinglish
          </button>
          <button
            onClick={() => onChangeLanguage('hindi')}
            className={`px-2 py-1 rounded text-[11px] font-medium transition ${language === 'hindi' ? 'bg-cyan-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'}`}
          >
            हिंदी
          </button>
        </div>

        {/* Voice TTS Toggle */}
        <button
          id="toggle-voice-btn"
          onClick={onToggleVoice}
          title={voiceEnabled ? 'Mute Vyom Voice' : 'Enable Vyom Voice Speech'}
          className={`p-2 rounded-lg border transition ${
            voiceEnabled
              ? 'bg-cyan-950/70 text-cyan-300 border-cyan-800 hover:bg-cyan-900/80'
              : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
          }`}
        >
          {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Reset Memory Button */}
        <button
          id="reset-session-btn"
          onClick={onResetSession}
          title="Reset working session memory"
          className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
