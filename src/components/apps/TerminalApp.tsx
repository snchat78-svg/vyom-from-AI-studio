import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon } from 'lucide-react';

interface TerminalAppProps {
  onCommand?: (cmd: string) => Promise<string | void>;
}

export const TerminalApp: React.FC<TerminalAppProps> = ({ onCommand }) => {
  const [history, setHistory] = useState<Array<{ text: string; type: 'input' | 'output' | 'error' | 'system' }>>([
    { text: 'Vyom AI Universal Terminal [Version 1.0.0]', type: 'system' },
    { text: '(c) 2025 Vyom Autonomous Architecture. Multilingual runtime initialized.', type: 'system' },
    { text: 'Type "help" for a list of commands, or "vyom <message>" to talk to the AI.', type: 'system' },
    { text: '', type: 'system' }
  ]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && input.trim()) {
      const cmd = input.trim();
      setInput('');
      const newHistory = [...history, { text: `user@vyom:~$ ${cmd}`, type: 'input' as const }];

      const parts = cmd.split(' ');
      const main = parts[0].toLowerCase();

      if (main === 'clear') {
        setHistory([]);
        return;
      }

      if (main === 'help') {
        newHistory.push(
          { text: 'Available commands:', type: 'output' },
          { text: '  vyom <message>  - Send direct instruction to Vyom AI', type: 'output' },
          { text: '  status          - View agent and session state', type: 'output' },
          { text: '  apps            - List all registered applications', type: 'output' },
          { text: '  open <name>     - Open an app or file', type: 'output' },
          { text: '  close <name>    - Terminate an app', type: 'output' },
          { text: '  files           - List virtual filesystem', type: 'output' },
          { text: '  whoami          - Current user identity', type: 'output' },
          { text: '  date            - Show system time', type: 'output' },
          { text: '  clear           - Clear terminal window', type: 'output' }
        );
        setHistory(newHistory);
        return;
      }

      if (main === 'whoami') {
        newHistory.push({ text: 'User: vyom-operator (Admin privileges)', type: 'output' });
        setHistory(newHistory);
        return;
      }

      if (main === 'date') {
        newHistory.push({ text: new Date().toString(), type: 'output' });
        setHistory(newHistory);
        return;
      }

      if (main === 'echo') {
        newHistory.push({ text: parts.slice(1).join(' '), type: 'output' });
        setHistory(newHistory);
        return;
      }

      // If it's a Vyom command or general input, pass to agent
      if (onCommand) {
        setHistory(newHistory);
        const vyomPrompt = main === 'vyom' ? parts.slice(1).join(' ') : cmd;
        try {
          const res = await onCommand(vyomPrompt);
          if (res) {
            setHistory(prev => [...prev, { text: `[Vyom] ${res}`, type: 'system' }]);
          }
        } catch {
          setHistory(prev => [...prev, { text: 'Execution error in autonomous runtime.', type: 'error' }]);
        }
      } else {
        newHistory.push({ text: `Executed command: ${cmd}`, type: 'output' });
        setHistory(newHistory);
      }
    }
  };

  return (
    <div id="terminal-app-container" className="flex flex-col h-full bg-slate-950 text-slate-100 font-mono text-xs select-text">
      {/* Terminal Title Bar */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-slate-800 bg-slate-900/90 text-slate-400">
        <TerminalIcon className="w-3.5 h-3.5 text-cyan-400" />
        <span className="font-semibold text-slate-300">bash — vyom-terminal</span>
      </div>

      {/* Terminal Output */}
      <div id="terminal-logs-pane" className="flex-1 p-3 overflow-y-auto space-y-1">
        {history.map((item, idx) => (
          <div
            key={idx}
            className={`leading-relaxed whitespace-pre-wrap ${
              item.type === 'input'
                ? 'text-cyan-400 font-semibold'
                : item.type === 'error'
                  ? 'text-rose-400'
                  : item.type === 'system'
                    ? 'text-slate-400'
                    : 'text-slate-200'
            }`}
          >
            {item.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Terminal Input Line */}
      <div id="terminal-input-bar" className="flex items-center gap-2 p-2 border-t border-slate-800 bg-slate-950">
        <span className="text-cyan-400 font-semibold">user@vyom:~$</span>
        <input
          id="terminal-cli-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          className="flex-1 bg-transparent border-none outline-none text-slate-100 font-mono text-xs"
          placeholder="type command (e.g. 'status', 'help', 'vyom open notepad')..."
        />
      </div>
    </div>
  );
};
