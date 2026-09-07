import React, { useState, useEffect } from 'react';
import { Cpu, Server, Activity, XCircle, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { SystemState } from '../../types';

interface SystemMonitorAppProps {
  systemState?: SystemState | null;
  onCloseApp?: (appId: string) => void;
  onRefresh?: () => void;
}

export const SystemMonitorApp: React.FC<SystemMonitorAppProps> = ({
  systemState,
  onCloseApp,
  onRefresh
}) => {
  const [cpu, setCpu] = useState(24);
  const [ram, setRam] = useState(45);

  useEffect(() => {
    if (systemState?.metrics) {
      setCpu(systemState.metrics.cpuUsage);
      setRam(systemState.metrics.memoryUsage);
    }
    const interval = setInterval(() => {
      setCpu(prev => Math.min(95, Math.max(12, Math.floor(prev + (Math.random() * 8 - 4)))));
      setRam(prev => Math.min(85, Math.max(30, Math.floor(prev + (Math.random() * 4 - 2)))));
    }, 2500);
    return () => clearInterval(interval);
  }, [systemState]);

  const runningApps = systemState?.runningApps || ['files'];

  return (
    <div id="system-monitor-container" className="flex flex-col h-full bg-slate-900 text-slate-100 select-none overflow-y-auto p-4 space-y-4">
      {/* Metrics Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div id="cpu-metric-card" className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="flex items-center gap-1.5 font-medium"><Cpu className="w-3.5 h-3.5 text-cyan-400" /> CPU Load</span>
            <span className="font-mono text-cyan-400 font-semibold">{cpu}%</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${cpu}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-500 mt-2">Core allocation: 4 vCPUs • 2.8 GHz</div>
        </div>

        <div id="ram-metric-card" className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="flex items-center gap-1.5 font-medium"><Server className="w-3.5 h-3.5 text-violet-400" /> RAM Usage</span>
            <span className="font-mono text-violet-400 font-semibold">{ram}%</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${ram}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-500 mt-2">Memory: {(ram * 0.16).toFixed(1)} GB / 16.0 GB</div>
        </div>
      </div>

      {/* Autonomous Session Memory State */}
      <div id="session-state-card" className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
          <span className="flex items-center gap-1.5"><Activity className="w-3.5 h-3.5 text-emerald-400" /> Vyom Session Memory</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800">
            {systemState?.taskState || 'idle'}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 pt-1">
          <div><span className="text-slate-500">Active Window:</span> <span className="text-slate-200 font-medium">{systemState?.activeApp || 'None'}</span></div>
          <div><span className="text-slate-500">Last Action:</span> <span className="text-slate-200 font-medium">{systemState?.lastAction || 'Idle'}</span></div>
          <div className="col-span-2 truncate"><span className="text-slate-500">Current Goal:</span> <span className="text-cyan-300">{systemState?.lastGoal || 'Awaiting user instruction'}</span></div>
        </div>
      </div>

      {/* Process Manager */}
      <div id="processes-table-card" className="flex-1 rounded-xl bg-slate-950/70 border border-slate-800 p-3 flex flex-col">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-3">
          <span>Active Processes ({runningApps.length})</span>
          {onRefresh && (
            <button onClick={onRefresh} className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200">
              <RefreshCw className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="space-y-1.5 flex-1 overflow-y-auto">
          {runningApps.map((appId) => (
            <div
              key={appId}
              id={`process-row-${appId}`}
              className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800/80 text-xs"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-medium text-slate-200 uppercase tracking-wide">{appId}</span>
                <span className="text-[10px] text-slate-500 font-mono">PID {Math.floor(1000 + Math.random() * 9000)}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-slate-400 font-mono">{(Math.random() * 4 + 1).toFixed(1)}% CPU</span>
                {onCloseApp && (
                  <button
                    id={`kill-process-btn-${appId}`}
                    onClick={() => onCloseApp(appId)}
                    className="flex items-center gap-1 px-2 py-0.5 rounded bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 text-[10px] border border-rose-800/60 transition"
                  >
                    <XCircle className="w-3 h-3" /> End Task
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
