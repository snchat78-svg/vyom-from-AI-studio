import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send, Brain, Sparkles, CheckCircle2, ChevronRight, Activity, Clock, ShieldCheck, CornerDownLeft } from 'lucide-react';
import { ChatMessage, CognitiveTrace, SelectionOption, SupportedLanguage } from '../types';

interface VyomHUDProps {
  messages: ChatMessage[];
  onSendMessage: (msg: string) => void;
  onSelectOption: (option: SelectionOption) => void;
  isLoading: boolean;
  agentStatus: 'ready' | 'listening' | 'thinking' | 'speaking';
  setAgentStatus: (status: 'ready' | 'listening' | 'thinking' | 'speaking') => void;
  activeLanguage: SupportedLanguage;
}

export const VyomHUD: React.FC<VyomHUDProps> = ({
  messages,
  onSendMessage,
  onSelectOption,
  isLoading,
  agentStatus,
  setAgentStatus,
  activeLanguage
}) => {
  const [inputText, setInputText] = useState('');
  const [activeTab, setActiveTab] = useState<'chat' | 'cognitive'>('chat');
  const [latestTrace, setLatestTrace] = useState<CognitiveTrace | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    const lastVyomMsg = [...messages].reverse().find(m => m.sender === 'vyom' && m.cognitiveTrace);
    if (lastVyomMsg?.cognitiveTrace) {
      setLatestTrace(lastVyomMsg.cognitiveTrace);
    }
  }, [messages]);

  // Web Speech STT Setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = activeLanguage === 'hindi' ? 'hi-IN' : 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
        setAgentStatus('listening');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          onSendMessage(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsRecording(false);
        setAgentStatus('ready');
      };

      recognition.onend = () => {
        setIsRecording(false);
        setAgentStatus('ready');
      };

      recognitionRef.current = recognition;
    }
  }, [activeLanguage, onSendMessage, setAgentStatus]);

  const toggleMic = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please type your message.');
      return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      setAgentStatus('ready');
    } else {
      try {
        recognitionRef.current.lang = activeLanguage === 'hindi' ? 'hi-IN' : 'en-US';
        recognitionRef.current.start();
      } catch (e) {
        console.warn('Recognition start failed:', e);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    const msg = inputText.trim();
    setInputText('');
    onSendMessage(msg);
  };

  const quickPrompts = [
    { label: 'Notepad खोलो', query: 'Notepad kholo' },
    { label: 'Open Calculator', query: 'Open calculator' },
    { label: 'फाइल्स ढूंढो', query: 'Search file quarterly_report' },
    { label: 'System status kya hai?', query: 'System status kya hai?' },
    { label: 'Who are you?', query: 'Who are you?' }
  ];

  return (
    <div id="vyom-hud-container" className="flex flex-col h-full bg-slate-950 border-l border-slate-800 text-slate-100 select-none">
      {/* Header Tabs */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 bg-slate-900/60">
        <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
          <button
            id="tab-chat"
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1 rounded text-xs font-medium transition ${
              activeTab === 'chat' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/80 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Voice & Chat
          </button>
          <button
            id="tab-cognitive"
            onClick={() => setActiveTab('cognitive')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition ${
              activeTab === 'cognitive' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/80 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Brain className="w-3.5 h-3.5 text-cyan-400" />
            <span>Brain Trace</span>
            {latestTrace && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
          </button>
        </div>

        <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
          <Activity className="w-3 h-3 text-cyan-400" />
          <span>Multilingual</span>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === 'chat' ? (
          <div id="chat-stream-container" className="flex-1 p-3 overflow-y-auto space-y-3.5">
            {messages.map((msg) => (
              <div
                key={msg.id}
                id={`chat-msg-${msg.id}`}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mb-1 px-1">
                  <span>{msg.sender === 'user' ? 'You' : 'Vyom AI'}</span>
                  <span>•</span>
                  <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                <div
                  className={`p-3 rounded-2xl text-xs max-w-[88%] leading-relaxed select-text shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-cyan-600 text-white rounded-tr-none font-medium'
                      : 'bg-slate-900 border border-slate-800/90 text-slate-200 rounded-tl-none space-y-2'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.text}</div>

                  {/* If action happened */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="pt-2 border-t border-slate-800/80 space-y-1">
                      {msg.actions.map((act, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono">
                          <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
                          <span>{act}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* If Multiple options returned */}
                  {msg.selectionOptions && msg.selectionOptions.length > 0 && (
                    <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                      <div className="text-[11px] font-semibold text-slate-400">Click to select:</div>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.selectionOptions.map((opt) => (
                          <button
                            key={opt.index}
                            id={`option-btn-${opt.index}`}
                            onClick={() => onSelectOption(opt)}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-cyan-950 hover:border-cyan-700 border border-slate-700 text-cyan-300 text-xs transition"
                          >
                            <span className="font-bold text-[10px] px-1 py-0.5 rounded bg-slate-900 text-cyan-400">{opt.index}</span>
                            <span className="truncate max-w-[140px]">{opt.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 w-fit">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]" />
                <span>Processing in autonomous pipeline...</span>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>
        ) : (
          /* Cognitive Trace Inspector Tab */
          <div id="cognitive-trace-view" className="flex-1 p-4 overflow-y-auto space-y-4">
            {latestTrace ? (
              <div className="space-y-3.5">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Input Query:</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-cyan-950 text-cyan-300 border border-cyan-800">
                      {latestTrace.language}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-slate-100 font-mono select-text">
                    "{latestTrace.rawInput}"
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="text-slate-500 text-[11px]">Parsed Intent</div>
                    <div className="font-mono text-cyan-300 font-semibold mt-0.5 capitalize">{latestTrace.intent}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="text-slate-500 text-[11px]">Extracted Target</div>
                    <div className="font-mono text-amber-300 font-semibold mt-0.5 truncate">{latestTrace.target || 'N/A'}</div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                    <Brain className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Cognitive Execution Pipeline</span>
                  </div>
                  <div className="space-y-1.5 text-[11px] font-mono text-slate-300 pl-1 border-l-2 border-cyan-500/30">
                    {latestTrace.reasoningSteps.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-cyan-500 font-bold">{idx + 1}.</span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Observation Verifier</span>
                  </div>
                  <div className="text-[11px] text-slate-400">{latestTrace.verification}</div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 font-mono">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Runtime: {latestTrace.executionTimeMs}ms</span>
                  <span>Safety Status: PASS</span>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 text-xs py-12">
                <Brain className="w-8 h-8 text-slate-700 mb-2" />
                <span>No intent trace yet.</span>
                <span className="text-[11px]">Send a command to view internal reasoning.</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Suggested Command Chips */}
      <div id="quick-prompts-bar" className="px-3 py-2 border-t border-slate-800/80 bg-slate-950/90 overflow-x-auto flex items-center gap-1.5 text-xs">
        <span className="text-[10px] text-slate-500 uppercase font-semibold mr-1 flex-shrink-0">Try:</span>
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => onSendMessage(p.query)}
            className="flex-shrink-0 px-2.5 py-1 rounded-full bg-slate-900 hover:bg-cyan-950 hover:border-cyan-700 border border-slate-800 text-slate-300 hover:text-cyan-300 text-[11px] transition"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSubmit} id="vyom-chat-input-form" className="p-3 border-t border-slate-800 bg-slate-900/90 flex items-center gap-2">
        <button
          type="button"
          id="voice-mic-btn"
          onClick={toggleMic}
          title={isRecording ? 'Stop Listening' : 'Voice Input (Click to speak in Hindi or English)'}
          className={`p-2.5 rounded-xl border transition flex-shrink-0 ${
            isRecording
              ? 'bg-rose-600 text-white border-rose-500 animate-pulse shadow-lg shadow-rose-950/50'
              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
          }`}
        >
          {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        <input
          id="user-command-input"
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={activeLanguage === 'hindi' ? 'व्योम को बताएं (उदा. "Notepad खोलो", "कैलकुलेटर")...' : 'Speak or type command (e.g., "open notepad", "status")...'}
          className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 select-text"
        />

        <button
          type="submit"
          id="send-command-btn"
          disabled={!inputText.trim() || isLoading}
          className="p-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:hover:bg-cyan-600 text-white transition flex-shrink-0 shadow-sm"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
