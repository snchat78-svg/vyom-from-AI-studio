import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { VyomHUD } from './components/VyomHUD';
import { DesktopIcons } from './components/DesktopIcons';
import { Taskbar } from './components/Taskbar';
import { WindowFrame } from './components/WindowFrame';
import { NotepadApp } from './components/apps/NotepadApp';
import { CalculatorApp } from './components/apps/CalculatorApp';
import { FileExplorerApp } from './components/apps/FileExplorerApp';
import { TerminalApp } from './components/apps/TerminalApp';
import { SystemMonitorApp } from './components/apps/SystemMonitorApp';
import { BrowserApp } from './components/apps/BrowserApp';
import { AppDefinition, ChatMessage, SelectionOption, SupportedLanguage, SystemState, VirtualFile, VyomApiResponse } from './types';
import { FileText, Calculator, Folder, Terminal, Cpu, Globe } from 'lucide-react';

const INITIAL_APPS: AppDefinition[] = [
  {
    id: 'notepad',
    name: 'Notepad',
    icon: 'FileText',
    description: 'Text and meeting notes editor',
    category: 'productivity',
    isOpen: false,
    isMinimized: false,
    zIndex: 10
  },
  {
    id: 'calculator',
    name: 'Calculator',
    icon: 'Calculator',
    description: 'Math and arithmetic calculator',
    category: 'utilities',
    isOpen: false,
    isMinimized: false,
    zIndex: 10
  },
  {
    id: 'files',
    name: 'File Explorer',
    icon: 'Folder',
    description: 'Browse virtual system files & folders',
    category: 'utilities',
    isOpen: true,
    isMinimized: false,
    zIndex: 12
  },
  {
    id: 'terminal',
    name: 'Terminal',
    icon: 'Terminal',
    description: 'Interactive system shell',
    category: 'system',
    isOpen: false,
    isMinimized: false,
    zIndex: 10
  },
  {
    id: 'system',
    name: 'System Monitor',
    icon: 'Cpu',
    description: 'CPU, RAM, and Process Manager',
    category: 'system',
    isOpen: false,
    isMinimized: false,
    zIndex: 10
  },
  {
    id: 'browser',
    name: 'Web Browser',
    icon: 'Globe',
    description: 'Web navigation & search',
    category: 'internet',
    isOpen: false,
    isMinimized: false,
    zIndex: 10
  }
];

export const App: React.FC = () => {
  const [apps, setApps] = useState<AppDefinition[]>(INITIAL_APPS);
  const [activeAppId, setActiveAppId] = useState<string | null>('files');
  const [systemState, setSystemState] = useState<SystemState | null>(null);
  const [activeLanguage, setActiveLanguage] = useState<SupportedLanguage>('hinglish');
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [agentStatus, setAgentStatus] = useState<'ready' | 'listening' | 'thinking' | 'speaking'>('ready');
  const [viewMode, setViewMode] = useState<'desktop' | 'chat' | 'split'>('split');
  const [isLoading, setIsLoading] = useState(false);
  const [openedFileInNotepad, setOpenedFileInNotepad] = useState<VirtualFile | null>(null);
  const [selectedFileInExplorer, setSelectedFileInExplorer] = useState<VirtualFile | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-welcome',
      sender: 'vyom',
      text: 'Namaste! Main Vyom AI hoon—aapka autonomous multilingual assistant.\n\nAap mujhse Hindi, Hinglish, ya English me baat kar sakte hain. Try typing or saying:\n• "Notepad kholo"\n• "Open Calculator"\n• "Search file quarterly_report"\n• "System status kya hai?"',
      timestamp: new Date().toISOString(),
      actions: ['Multilingual Engine Active', 'Session Memory Initialized', 'ToolManager Ready']
    }
  ]);

  // Top z-index tracker
  const maxZIndex = useRef<number>(20);

  // Fetch system state on mount
  const fetchState = async () => {
    try {
      const res = await fetch('/api/system/state');
      const data = await res.json();
      setSystemState(data);
    } catch (e) {
      console.error('Failed to fetch system state:', e);
    }
  };

  useEffect(() => {
    fetchState();
  }, []);

  // Text-To-Speech (TTS) Handler
  const speakText = (text: string, lang: SupportedLanguage) => {
    if (!voiceEnabled || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*_#`[\]()]/g, ' ').slice(0, 280);
    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Pick appropriate voice
    const voices = window.speechSynthesis.getVoices();
    if (lang === 'hindi') {
      const hindiVoice = voices.find(v => v.lang.includes('hi') || v.name.toLowerCase().includes('hindi'));
      if (hindiVoice) utterance.voice = hindiVoice;
    } else {
      const englishVoice = voices.find(v => v.lang.includes('en-IN') || v.lang.includes('en-US') || v.lang.includes('en-GB'));
      if (englishVoice) utterance.voice = englishVoice;
    }

    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => setAgentStatus('speaking');
    utterance.onend = () => setAgentStatus('ready');
    utterance.onerror = () => setAgentStatus('ready');

    window.speechSynthesis.speak(utterance);
  };

  // Launch or focus an app
  const handleLaunchApp = (appId: string) => {
    maxZIndex.current += 1;
    setApps(prev => prev.map(a => {
      if (a.id === appId) {
        return { ...a, isOpen: true, isMinimized: false, zIndex: maxZIndex.current };
      }
      return a;
    }));
    setActiveAppId(appId);

    // Inform backend
    fetch('/api/apps/launch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appId })
    }).catch(console.error);

    fetchState();
  };

  // Close an app
  const handleCloseApp = (appId: string) => {
    setApps(prev => prev.map(a => {
      if (a.id === appId) {
        return { ...a, isOpen: false, isMinimized: false };
      }
      return a;
    }));
    if (activeAppId === appId) {
      const remainingOpen = apps.filter(a => a.isOpen && a.id !== appId);
      setActiveAppId(remainingOpen.length > 0 ? remainingOpen[0].id : null);
    }

    // Inform backend
    fetch('/api/apps/close', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appId })
    }).catch(console.error);

    fetchState();
  };

  // Focus an open app
  const handleFocusApp = (appId: string) => {
    maxZIndex.current += 1;
    setApps(prev => prev.map(a => {
      if (a.id === appId) {
        return { ...a, zIndex: maxZIndex.current, isMinimized: false };
      }
      return a;
    }));
    setActiveAppId(appId);
  };

  // Minimize an app
  const handleMinimizeApp = (appId: string) => {
    setApps(prev => prev.map(a => {
      if (a.id === appId) {
        return { ...a, isMinimized: true };
      }
      return a;
    }));
    if (activeAppId === appId) {
      const remainingVisible = apps.filter(a => a.isOpen && !a.isMinimized && a.id !== appId);
      setActiveAppId(remainingVisible.length > 0 ? remainingVisible[0].id : null);
    }
  };

  // Send Message / Voice Command to Vyom AI Engine
  const handleSendMessage = async (userText: string) => {
    if (!userText.trim()) return;

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: userText,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    setAgentStatus('thinking');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText })
      });
      const data: VyomApiResponse = await res.json();

      const vyomMsg: ChatMessage = {
        id: 'msg-' + (Date.now() + 1),
        sender: 'vyom',
        text: data.reply,
        timestamp: new Date().toISOString(),
        intent: data.intent,
        actions: data.actionsExecuted,
        cognitiveTrace: data.cognitiveTrace,
        selectionOptions: data.selectionOptions,
        spokenText: data.spokenText
      };

      setMessages(prev => [...prev, vyomMsg]);
      setSystemState(data.systemState);

      // Handle App launch / close actions from agent
      if (data.openedAppId) {
        handleLaunchApp(data.openedAppId);
      }
      if (data.closedAppId) {
        handleCloseApp(data.closedAppId);
      }

      // Handle Opened File
      if (data.openedFile) {
        handleLaunchApp('files');
        setSelectedFileInExplorer(data.openedFile);
      }

      // Voice TTS
      if (data.spokenText) {
        speakText(data.spokenText, data.cognitiveTrace?.language || activeLanguage);
      } else {
        setAgentStatus('ready');
      }
    } catch (e) {
      console.error('API Chat Error:', e);
      const errorMsg: ChatMessage = {
        id: 'msg-err-' + Date.now(),
        sender: 'vyom',
        text: 'Error processing request in the autonomous execution pipeline. Please try again.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMsg]);
      setAgentStatus('ready');
    } finally {
      setIsLoading(false);
    }
  };

  // Selection Option clicked
  const handleSelectOption = (option: SelectionOption) => {
    handleSendMessage(option.index.toString());
  };

  // Open file in Notepad
  const handleOpenFileInNotepad = (file: VirtualFile) => {
    setOpenedFileInNotepad(file);
    handleLaunchApp('notepad');
  };

  // Reset Session Memory
  const handleResetSession = async () => {
    try {
      await fetch('/api/session/reset', { method: 'POST' });
      fetchState();
      setMessages([
        {
          id: 'm-reset-' + Date.now(),
          sender: 'vyom',
          text: 'Session memory has been reset. Working context and goals are cleared. What would you like to do next?',
          timestamp: new Date().toISOString()
        }
      ]);
    } catch (e) {
      console.error(e);
    }
  };

  const getRunningAppIds = () => {
    return apps.filter(a => a.isOpen).map(a => a.id);
  };

  return (
    <div id="vyom-app-root" className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden select-none">
      {/* Top Global Bar */}
      <Header
        systemState={systemState}
        agentStatus={agentStatus}
        voiceEnabled={voiceEnabled}
        onToggleVoice={() => setVoiceEnabled(!voiceEnabled)}
        language={activeLanguage}
        onChangeLanguage={setActiveLanguage}
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        onResetSession={handleResetSession}
      />

      {/* Main Workspace Area */}
      <div id="vyom-workspace-body" className="flex-1 flex overflow-hidden relative">
        {/* Virtual Desktop Workspace */}
        {(viewMode === 'desktop' || viewMode === 'split') && (
          <div
            id="virtual-desktop-screen"
            className={`relative flex-1 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 overflow-hidden ${
              viewMode === 'split' ? 'w-3/5' : 'w-full'
            }`}
          >
            {/* Subtle Grid Background Pattern */}
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(rgba(148, 163, 184, 0.4) 1px, transparent 1px)',
                backgroundSize: '24px 24px'
              }}
            />

            {/* Desktop Shortcuts */}
            <DesktopIcons
              apps={apps}
              onLaunchApp={handleLaunchApp}
            />

            {/* Active Window: Notepad */}
            <WindowFrame
              id="notepad"
              title="Notepad — Virtual Text Editor"
              icon={FileText}
              isOpen={Boolean(apps.find(a => a.id === 'notepad')?.isOpen && !apps.find(a => a.id === 'notepad')?.isMinimized)}
              isFocused={activeAppId === 'notepad'}
              onFocus={() => handleFocusApp('notepad')}
              onClose={() => handleCloseApp('notepad')}
              onMinimize={() => handleMinimizeApp('notepad')}
            >
              <NotepadApp
                initialTitle={openedFileInNotepad?.name || 'Untitled Note.txt'}
                initialContent={openedFileInNotepad?.content || undefined}
              />
            </WindowFrame>

            {/* Active Window: Calculator */}
            <WindowFrame
              id="calculator"
              title="Calculator — Standard & Scientific"
              icon={Calculator}
              isOpen={Boolean(apps.find(a => a.id === 'calculator')?.isOpen && !apps.find(a => a.id === 'calculator')?.isMinimized)}
              isFocused={activeAppId === 'calculator'}
              onFocus={() => handleFocusApp('calculator')}
              onClose={() => handleCloseApp('calculator')}
              onMinimize={() => handleMinimizeApp('calculator')}
            >
              <CalculatorApp />
            </WindowFrame>

            {/* Active Window: File Explorer */}
            <WindowFrame
              id="files"
              title="File Explorer — Virtual Storage"
              icon={Folder}
              isOpen={Boolean(apps.find(a => a.id === 'files')?.isOpen && !apps.find(a => a.id === 'files')?.isMinimized)}
              isFocused={activeAppId === 'files'}
              onFocus={() => handleFocusApp('files')}
              onClose={() => handleCloseApp('files')}
              onMinimize={() => handleMinimizeApp('files')}
            >
              <FileExplorerApp
                selectedFile={selectedFileInExplorer}
                onOpenFileInNotepad={handleOpenFileInNotepad}
              />
            </WindowFrame>

            {/* Active Window: Terminal */}
            <WindowFrame
              id="terminal"
              title="Terminal — Command Shell"
              icon={Terminal}
              isOpen={Boolean(apps.find(a => a.id === 'terminal')?.isOpen && !apps.find(a => a.id === 'terminal')?.isMinimized)}
              isFocused={activeAppId === 'terminal'}
              onFocus={() => handleFocusApp('terminal')}
              onClose={() => handleCloseApp('terminal')}
              onMinimize={() => handleMinimizeApp('terminal')}
            >
              <TerminalApp
                onCommand={async (cmd) => {
                  await handleSendMessage(cmd);
                }}
              />
            </WindowFrame>

            {/* Active Window: System Monitor */}
            <WindowFrame
              id="system"
              title="System Monitor — Task Manager"
              icon={Cpu}
              isOpen={Boolean(apps.find(a => a.id === 'system')?.isOpen && !apps.find(a => a.id === 'system')?.isMinimized)}
              isFocused={activeAppId === 'system'}
              onFocus={() => handleFocusApp('system')}
              onClose={() => handleCloseApp('system')}
              onMinimize={() => handleMinimizeApp('system')}
            >
              <SystemMonitorApp
                systemState={systemState}
                onCloseApp={handleCloseApp}
                onRefresh={fetchState}
              />
            </WindowFrame>

            {/* Active Window: Web Browser */}
            <WindowFrame
              id="browser"
              title="Web Browser — Chrome Simulation"
              icon={Globe}
              isOpen={Boolean(apps.find(a => a.id === 'browser')?.isOpen && !apps.find(a => a.id === 'browser')?.isMinimized)}
              isFocused={activeAppId === 'browser'}
              onFocus={() => handleFocusApp('browser')}
              onClose={() => handleCloseApp('browser')}
              onMinimize={() => handleMinimizeApp('browser')}
            >
              <BrowserApp />
            </WindowFrame>

            {/* Desktop Bottom Taskbar */}
            <div className="absolute bottom-0 left-0 right-0">
              <Taskbar
                apps={apps}
                runningApps={getRunningAppIds()}
                activeAppId={activeAppId}
                onSelectApp={(id) => {
                  const targetApp = apps.find(a => a.id === id);
                  if (!targetApp?.isOpen) {
                    handleLaunchApp(id);
                  } else if (targetApp.isMinimized) {
                    handleFocusApp(id);
                  } else if (activeAppId === id) {
                    handleMinimizeApp(id);
                  } else {
                    handleFocusApp(id);
                  }
                }}
                onToggleAssistant={() => {
                  setViewMode(prev => prev === 'split' ? 'desktop' : 'split');
                }}
              />
            </div>
          </div>
        )}

        {/* Vyom Assistant Copilot HUD */}
        {(viewMode === 'chat' || viewMode === 'split') && (
          <div
            id="vyom-assistant-dock"
            className={`${viewMode === 'split' ? 'w-[420px] max-w-[45vw]' : 'w-full'} h-full flex flex-col`}
          >
            <VyomHUD
              messages={messages}
              onSendMessage={handleSendMessage}
              onSelectOption={handleSelectOption}
              isLoading={isLoading}
              agentStatus={agentStatus}
              setAgentStatus={setAgentStatus}
              activeLanguage={activeLanguage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
