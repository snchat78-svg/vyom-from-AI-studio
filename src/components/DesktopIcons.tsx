import React from 'react';
import { FileText, Calculator, Folder, Terminal, Cpu, Globe, LucideIcon } from 'lucide-react';
import { AppDefinition } from '../types';

interface DesktopIconsProps {
  apps: AppDefinition[];
  onLaunchApp: (appId: string) => void;
}

export const DesktopIcons: React.FC<DesktopIconsProps> = ({ apps, onLaunchApp }) => {
  const getIcon = (id: string): LucideIcon => {
    switch (id) {
      case 'notepad': return FileText;
      case 'calculator': return Calculator;
      case 'files': return Folder;
      case 'terminal': return Terminal;
      case 'system': return Cpu;
      case 'browser': return Globe;
      default: return FileText;
    }
  };

  const getIconColor = (id: string): string => {
    switch (id) {
      case 'notepad': return 'text-amber-400 group-hover:bg-amber-950/40 border-amber-800/40';
      case 'calculator': return 'text-cyan-400 group-hover:bg-cyan-950/40 border-cyan-800/40';
      case 'files': return 'text-blue-400 group-hover:bg-blue-950/40 border-blue-800/40';
      case 'terminal': return 'text-emerald-400 group-hover:bg-emerald-950/40 border-emerald-800/40';
      case 'system': return 'text-purple-400 group-hover:bg-purple-950/40 border-purple-800/40';
      case 'browser': return 'text-orange-400 group-hover:bg-orange-950/40 border-orange-800/40';
      default: return 'text-slate-400 group-hover:bg-slate-800 border-slate-800';
    }
  };

  return (
    <div id="desktop-shortcuts-grid" className="p-4 flex flex-col gap-3.5 w-fit select-none z-10">
      {apps.map((app) => {
        const Icon = getIcon(app.id);
        const colorClasses = getIconColor(app.id);
        return (
          <button
            key={app.id}
            id={`desktop-app-${app.id}`}
            onClick={() => onLaunchApp(app.id)}
            className="group flex flex-col items-center justify-center p-2 rounded-xl hover:bg-slate-900/60 hover:backdrop-blur border border-transparent hover:border-slate-800 transition w-20 text-center"
          >
            <div className={`w-12 h-12 rounded-2xl bg-slate-900/90 border flex items-center justify-center shadow-lg transition transform group-hover:scale-105 ${colorClasses}`}>
              <Icon className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-medium text-slate-200 mt-1.5 drop-shadow group-hover:text-cyan-300 transition truncate max-w-full">
              {app.name}
            </span>
          </button>
        );
      })}
    </div>
  );
};
