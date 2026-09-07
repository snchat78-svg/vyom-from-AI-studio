import React, { useState } from 'react';
import { Save, FileText, Plus, Check, Download } from 'lucide-react';

interface NotepadAppProps {
  initialContent?: string;
  initialTitle?: string;
  onSave?: (title: string, content: string) => void;
}

export const NotepadApp: React.FC<NotepadAppProps> = ({
  initialContent = 'Welcome to Vyom Notepad.\n\nYou can speak or type to dictate notes:\n- "Open notepad and write meeting notes"\n- Edit directly here and save to virtual storage.',
  initialTitle = 'Untitled Note.txt',
  onSave
}) => {
  const [content, setContent] = useState(initialContent);
  const [title, setTitle] = useState(initialTitle);
  const [savedStatus, setSavedStatus] = useState<string | null>(null);

  const handleSave = async () => {
    if (onSave) {
      onSave(title, content);
    }
    try {
      await fetch('/api/files/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: title, content, folder: 'Documents' })
      });
      setSavedStatus('Saved to Documents');
      setTimeout(() => setSavedStatus(null), 2500);
    } catch {
      setSavedStatus('Saved locally');
      setTimeout(() => setSavedStatus(null), 2000);
    }
  };

  const handleNew = () => {
    setTitle(`Note_${new Date().toLocaleTimeString().replace(/:/g, '-')}.txt`);
    setContent('');
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  return (
    <div id="notepad-app-container" className="flex flex-col h-full bg-slate-900 text-slate-100 font-sans">
      {/* Top Toolbar */}
      <div id="notepad-toolbar" className="flex items-center justify-between px-3 py-2 border-b border-slate-800 bg-slate-950/60">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-amber-400" />
          <input
            id="notepad-title-input"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-xs font-medium bg-transparent border-b border-transparent hover:border-slate-700 focus:border-cyan-500 focus:outline-none px-1 text-slate-200"
          />
        </div>
        <div className="flex items-center gap-2 text-xs">
          {savedStatus && (
            <span className="flex items-center gap-1 text-emerald-400 font-medium animate-pulse">
              <Check className="w-3.5 h-3.5" /> {savedStatus}
            </span>
          )}
          <button
            id="notepad-new-btn"
            onClick={handleNew}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
          >
            <Plus className="w-3.5 h-3.5" /> New
          </button>
          <button
            id="notepad-save-btn"
            onClick={handleSave}
            className="flex items-center gap-1 px-3 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs transition shadow-sm"
          >
            <Save className="w-3.5 h-3.5" /> Save
          </button>
        </div>
      </div>

      {/* Editor Area */}
      <textarea
        id="notepad-content-area"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Type notes or commands here..."
        className="flex-1 w-full p-4 bg-slate-900/90 text-slate-100 font-mono text-sm leading-relaxed resize-none focus:outline-none placeholder-slate-600 select-text"
      />

      {/* Status Bar */}
      <div id="notepad-status-bar" className="flex items-center justify-between px-3 py-1.5 border-t border-slate-800 text-[11px] text-slate-400 bg-slate-950/40">
        <div className="flex items-center gap-4">
          <span>Characters: {charCount}</span>
          <span>Words: {wordCount}</span>
        </div>
        <div>UTF-8 • Windows CRLF</div>
      </div>
    </div>
  );
};
