export type SupportedLanguage = 'hindi' | 'hinglish' | 'english';

export interface CognitiveTrace {
  rawInput: string;
  language: SupportedLanguage;
  intent: string;
  target: string;
  reasoningSteps: string[];
  actionTaken: string;
  status: 'success' | 'clarification_needed' | 'error' | 'pending_selection';
  verification: string;
  executionTimeMs: number;
}

export interface SelectionOption {
  index: number;
  label: string;
  detail: string;
  type: 'app' | 'file' | 'action';
  targetValue: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'vyom';
  text: string;
  timestamp: string;
  intent?: string;
  actions?: string[];
  cognitiveTrace?: CognitiveTrace;
  selectionOptions?: SelectionOption[];
  spokenText?: string;
}

export interface AppDefinition {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: 'productivity' | 'utilities' | 'system' | 'internet';
  isOpen: boolean;
  isMinimized: boolean;
  zIndex: number;
}

export interface VirtualFile {
  id: string;
  name: string;
  path: string;
  folder: 'Desktop' | 'Documents' | 'Downloads' | 'Pictures' | 'Projects';
  type: 'document' | 'spreadsheet' | 'presentation' | 'image' | 'code' | 'text' | 'pdf';
  size: string;
  content: string;
  updatedAt: string;
}

export interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  uptimeSeconds: number;
  activeTasks: number;
}

export interface SystemState {
  metrics: SystemMetrics;
  activeApp: string | null;
  runningApps: string[];
  pendingSelection: SelectionOption[] | null;
  lastAction: string | null;
  lastGoal: string | null;
  taskState: 'idle' | 'active' | 'waiting_for_selection' | 'completed' | 'failed';
  geminiActive: boolean;
}

export interface VyomApiResponse {
  reply: string;
  spokenText: string;
  intent: string;
  target: string;
  cognitiveTrace: CognitiveTrace;
  actionsExecuted: string[];
  selectionOptions?: SelectionOption[];
  systemState: SystemState;
  openedAppId?: string;
  closedAppId?: string;
  openedFile?: VirtualFile;
}
