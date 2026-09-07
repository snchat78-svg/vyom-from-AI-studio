import React, { useState } from 'react';
import { Bot, FileText, Calculator, Folder, Terminal, Cpu, Globe, Search } from 'lucide-react';
import { AppDefinition } from '../types';

interface TaskbarProps {
  apps: AppDefinition[];
  runningApps: string[];
  activeAppId: string | null;
  onSelectApp: (appId: string) => void;
  onToggleAssistant: () => void;
}

export const Taskbar: React.FC<TaskbarProps> = ({
  apps,
  runningApps,
  activeAppId,
  onSelectApp,
  onToggleAssistant
}) => {
  const [startOpen, setStartOpen] = useState(false);
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const getIcon = (id: string) => {
    switch (id) {
      case 'notepad': return <FileText className="w-4 h-4 text-amber-400" />;
      case 'calculator': return <Calculator className="w-4 h-4 text-cyan-400" />;
      case 'files': return <Folder className="w-4 h-4 text-blue-400" />;
      case 'terminal': return <Terminal className="w-4 h-4 text-emerald-400" />;
      case 'system': return <Cpu className="w-4 h-4 text-purple-400" />;
      case 'browser': return <Globe className="w-4 h-4 text-orange-400" />;
      default: return <FileText className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div id="desktop-taskbar" className="h-12 border-t border-slate-800 bg-slate-950/95 backdrop-blur px-3 flex items-center justify-between select-none z-40">
      {/* Left: Start Menu & Running Apps */}
      <div className="flex items-center gap-1.5">
        {/* Start Button */}
        <button
          id="taskbar-start-btn"
          onClick={() => setStartOpen(!startOpen)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition ${
            startOpen ? 'bg-cyan-950 text-cyan-300 border-cyan-700' : 'bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Bot className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold">Start</span>
        </button>

        {/* Separator */}
        <div className="w-px h-5 bg-slate-800 mx-1" />

        {/* Running App Badges */}
        <div className="flex items-center gap-1">
          {apps.filter(a => runningApps.includes(a.id)).map(app => {
            const isActive = activeAppId === app.id;
            return (
              <button
                key={app.id}
                id={`taskbar-app-${app.id}`}
                onClick={() => onSelectApp(app.id)}
                className={`flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
                  isActive
                    ? 'bg-slate-900 text-cyan-300 border-cyan-800/80 shadow-sm'
                    : 'bg-slate-950 text-slate-400 border-slate-800/70 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                {getIcon(app.id)}
                <span className="hidden sm:inline truncate max-w-[90px]">{app.name}</span>
                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-cyan-400' : 'bg-slate-600'}`} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Start Menu Popup */}
      {startOpen && (
        <div
          id="start-menu-popup"
          className="absolute bottom-14 left-3 w-72 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl p-3 z-50 space-y-2"
        >
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <span>Search apps, commands...</span>
          </div>

          <div className="text-[11px] font-semibold text-slate-400 px-2 pt-1 uppercase tracking-wider">Installed Applications</div>
          <div className="space-y-1">
            {apps.map(app => (
              <button
                key={app.id}
                id={`start-app-item-${app.id}`}
                onClick={() => {
                  onSelectApp(app.id);
                  setStartOpen(false);
                }}
                className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-900 text-left text-xs text-slate-200 transition"
              >
                <div className="flex items-center gap-2.5">
                  {getIcon(app.id)}
                  <div>
                    <div className="font-medium">{app.name}</div>
                    <div className="text-[10px] text-slate-500">{app.description}</div>
                  </div>
                </div>
                {runningApps.includes(app.id) && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Right: Quick Vyom HUD trigger & Clock */}
      <div className="flex items-center gap-3 text-xs text-slate-400">
        <button
          id="taskbar-vyom-trigger"
          onClick={onToggleAssistant}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800/60 text-cyan-300 font-medium transition"
        >
          <Bot className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Vyom Assistant</span>
        </button>

        <div className="font-mono text-slate-300 font-medium">{currentTime}</div>
      </div>
    </div>
  );
};
