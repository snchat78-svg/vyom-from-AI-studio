import React, { useState } from 'react';
import { Delete, History, RotateCcw } from 'lucide-react';

export const CalculatorApp: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [shouldResetDisplay, setShouldResetDisplay] = useState(false);

  const handleDigit = (digit: string) => {
    if (display === '0' || shouldResetDisplay) {
      setDisplay(digit);
      setShouldResetDisplay(false);
    } else {
      setDisplay(display + digit);
    }
  };

  const handleOperator = (op: string) => {
    setEquation(`${display} ${op} `);
    setShouldResetDisplay(true);
  };

  const handleClear = () => {
    setDisplay('0');
    setEquation('');
    setShouldResetDisplay(false);
  };

  const handleBackspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const handleEquals = () => {
    if (!equation) return;
    try {
      const fullExpression = equation + display;
      // Sanitize expression
      const sanitized = fullExpression.replace(/×/g, '*').replace(/÷/g, '/');
      // Simple math evaluation
      // eslint-disable-next-line no-eval
      const result = Function(`'use strict'; return (${sanitized})`)();
      const formattedResult = Number.isInteger(result) ? result.toString() : result.toFixed(4).replace(/\.?0+$/, '');
      setHistory(prev => [`${fullExpression} = ${formattedResult}`, ...prev.slice(0, 9)]);
      setDisplay(formattedResult);
      setEquation('');
      setShouldResetDisplay(true);
    } catch {
      setDisplay('Error');
      setEquation('');
      setShouldResetDisplay(true);
    }
  };

  return (
    <div id="calculator-app-container" className="flex flex-col h-full bg-slate-900 text-slate-100 select-none">
      {/* Screen Display */}
      <div id="calculator-screen" className="p-4 bg-slate-950/80 border-b border-slate-800 text-right">
        <div className="h-5 text-xs text-slate-400 font-mono overflow-hidden truncate">
          {equation || '\u00A0'}
        </div>
        <div id="calculator-display-value" className="text-3xl font-bold font-mono tracking-wider text-cyan-400 overflow-hidden truncate mt-1">
          {display}
        </div>
      </div>

      {/* Calculator Buttons Grid */}
      <div id="calculator-keys-grid" className="flex-1 p-3 grid grid-cols-4 gap-2 bg-slate-900">
        <button
          id="calc-btn-clear"
          onClick={handleClear}
          className="p-3 rounded-lg bg-rose-950/40 text-rose-300 hover:bg-rose-900/60 font-medium text-sm transition"
        >
          C
        </button>
        <button
          id="calc-btn-backspace"
          onClick={handleBackspace}
          className="p-3 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center justify-center transition"
        >
          <Delete className="w-4 h-4" />
        </button>
        <button
          id="calc-btn-percent"
          onClick={() => {
            const val = parseFloat(display) / 100;
            setDisplay(val.toString());
          }}
          className="p-3 rounded-lg bg-slate-800 text-cyan-300 hover:bg-slate-700 font-medium text-sm transition"
        >
          %
        </button>
        <button
          id="calc-btn-div"
          onClick={() => handleOperator('÷')}
          className="p-3 rounded-lg bg-cyan-950/50 text-cyan-400 hover:bg-cyan-900/60 font-semibold text-base transition"
        >
          ÷
        </button>

        <button onClick={() => handleDigit('7')} className="p-3 rounded-lg bg-slate-800/80 hover:bg-slate-700 font-medium text-base transition">7</button>
        <button onClick={() => handleDigit('8')} className="p-3 rounded-lg bg-slate-800/80 hover:bg-slate-700 font-medium text-base transition">8</button>
        <button onClick={() => handleDigit('9')} className="p-3 rounded-lg bg-slate-800/80 hover:bg-slate-700 font-medium text-base transition">9</button>
        <button onClick={() => handleOperator('×')} className="p-3 rounded-lg bg-cyan-950/50 text-cyan-400 hover:bg-cyan-900/60 font-semibold text-base transition">×</button>

        <button onClick={() => handleDigit('4')} className="p-3 rounded-lg bg-slate-800/80 hover:bg-slate-700 font-medium text-base transition">4</button>
        <button onClick={() => handleDigit('5')} className="p-3 rounded-lg bg-slate-800/80 hover:bg-slate-700 font-medium text-base transition">5</button>
        <button onClick={() => handleDigit('6')} className="p-3 rounded-lg bg-slate-800/80 hover:bg-slate-700 font-medium text-base transition">6</button>
        <button onClick={() => handleOperator('-')} className="p-3 rounded-lg bg-cyan-950/50 text-cyan-400 hover:bg-cyan-900/60 font-semibold text-base transition">−</button>

        <button onClick={() => handleDigit('1')} className="p-3 rounded-lg bg-slate-800/80 hover:bg-slate-700 font-medium text-base transition">1</button>
        <button onClick={() => handleDigit('2')} className="p-3 rounded-lg bg-slate-800/80 hover:bg-slate-700 font-medium text-base transition">2</button>
        <button onClick={() => handleDigit('3')} className="p-3 rounded-lg bg-slate-800/80 hover:bg-slate-700 font-medium text-base transition">3</button>
        <button onClick={() => handleOperator('+')} className="p-3 rounded-lg bg-cyan-950/50 text-cyan-400 hover:bg-cyan-900/60 font-semibold text-base transition">+</button>

        <button onClick={() => handleDigit('0')} className="p-3 col-span-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 font-medium text-base transition">0</button>
        <button onClick={() => !display.includes('.') && setDisplay(display + '.')} className="p-3 rounded-lg bg-slate-800/80 hover:bg-slate-700 font-medium text-base transition">.</button>
        <button
          id="calc-btn-equals"
          onClick={handleEquals}
          className="p-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-lg shadow-md transition"
        >
          =
        </button>
      </div>

      {/* Recent Calculation History Drawer */}
      {history.length > 0 && (
        <div id="calculator-history" className="p-2 border-t border-slate-800 bg-slate-950/70 text-[11px] text-slate-400 max-h-24 overflow-y-auto">
          <div className="flex items-center justify-between font-semibold mb-1 text-slate-300">
            <span className="flex items-center gap-1"><History className="w-3 h-3" /> Recent calculations</span>
            <button onClick={() => setHistory([])} className="hover:text-rose-400"><RotateCcw className="w-2.5 h-2.5" /></button>
          </div>
          {history.map((h, i) => (
            <div key={i} className="font-mono py-0.5 truncate">{h}</div>
          ))}
        </div>
      )}
    </div>
  );
};
