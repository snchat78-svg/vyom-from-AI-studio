import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// ==========================================
// VIRTUAL FILE SYSTEM DATA
// ==========================================
interface VFile {
  id: string;
  name: string;
  path: string;
  folder: 'Desktop' | 'Documents' | 'Downloads' | 'Pictures' | 'Projects';
  type: 'document' | 'spreadsheet' | 'presentation' | 'image' | 'code' | 'text' | 'pdf';
  size: string;
  content: string;
  updatedAt: string;
}

const virtualFiles: VFile[] = [
  {
    id: 'f1',
    name: 'quarterly_report.docx',
    path: 'C:\\Users\\User\\Documents\\quarterly_report.docx',
    folder: 'Documents',
    type: 'document',
    size: '42 KB',
    content: 'Vyom AI Q3 Performance & Multilingual Intent Report.\nKey Highlights:\n- 99.4% intent recognition accuracy across Hindi, Hinglish, and English.\n- Seamless desktop automation & application launcher runtime.\n- Ultra-low latency voice pipeline.',
    updatedAt: '2025-05-12'
  },
  {
    id: 'f2',
    name: 'project_roadmap.pdf',
    path: 'C:\\Users\\User\\Documents\\project_roadmap.pdf',
    folder: 'Documents',
    type: 'pdf',
    size: '1.2 MB',
    content: 'Vyom Autonomous Agent Roadmap:\nPhase 1: Dual-language command engine.\nPhase 2: Universal app & file launcher.\nPhase 3: Deep reasoning model gateway.\nPhase 4: Multi-modal vision & automated workflow runtime.',
    updatedAt: '2025-05-18'
  },
  {
    id: 'f3',
    name: 'budget_2025.xlsx',
    path: 'C:\\Users\\User\\Documents\\budget_2025.xlsx',
    folder: 'Documents',
    type: 'spreadsheet',
    size: '78 KB',
    content: 'Category | Allocation | Q1 Spent | Q2 Spent\nR&D      | $120,000   | $28,000  | $31,500\nCloud    | $45,000    | $10,200  | $11,100\nDesign   | $30,000    | $7,400   | $8,000',
    updatedAt: '2025-05-20'
  },
  {
    id: 'f4',
    name: 'meeting_notes.txt',
    path: 'C:\\Users\\User\\Desktop\\meeting_notes.txt',
    folder: 'Desktop',
    type: 'text',
    size: '14 KB',
    content: 'Action items from AI Core sync:\n1. Integrate observation verifier with universal resolver.\n2. Ensure safe fallback when intent targets are ambiguous.\n3. Add live speech synthesis in user chosen language.',
    updatedAt: '2025-05-22'
  },
  {
    id: 'f5',
    name: 'vyom_architecture.png',
    path: 'C:\\Users\\User\\Pictures\\vyom_architecture.png',
    folder: 'Pictures',
    type: 'image',
    size: '340 KB',
    content: '[Architecture Diagram: CommandEngine -> Brain -> ReasoningEngine -> ToolManager -> Windows/Virtual Runtime]',
    updatedAt: '2025-04-10'
  },
  {
    id: 'f6',
    name: 'family_vacation.jpg',
    path: 'C:\\Users\\User\\Pictures\\family_vacation.jpg',
    folder: 'Pictures',
    type: 'image',
    size: '2.1 MB',
    content: '[Photograph: Mountains in Himachal Pradesh, Sunset view]',
    updatedAt: '2025-03-15'
  },
  {
    id: 'f7',
    name: 'main.py',
    path: 'C:\\Users\\User\\Projects\\main.py',
    folder: 'Projects',
    type: 'code',
    size: '8 KB',
    content: 'import sys\nfrom ai_core.main import main\n\nif __name__ == "__main__":\n    main()',
    updatedAt: '2025-05-01'
  },
  {
    id: 'f8',
    name: 'setup_guide.txt',
    path: 'C:\\Users\\User\\Downloads\\setup_guide.txt',
    folder: 'Downloads',
    type: 'text',
    size: '5 KB',
    content: 'Welcome to Vyom AI!\nSpeak or type naturally in Hindi or English:\n- "Notepad khole"\n- "Calculator start karo"\n- "Search quarterly report"\n- "System status batao"',
    updatedAt: '2025-05-21'
  }
];

// ==========================================
// REGISTERED APPLICATIONS
// ==========================================
interface AppMetadata {
  id: string;
  name: string;
  aliases: string[];
  description: string;
  category: 'productivity' | 'utilities' | 'system' | 'internet';
}

const registeredApps: AppMetadata[] = [
  {
    id: 'notepad',
    name: 'Notepad',
    aliases: ['notepad', 'notes', 'editor', 'text editor', 'नोटपैड', 'लिखने वाला'],
    description: 'Quick notes & document editor',
    category: 'productivity'
  },
  {
    id: 'calculator',
    name: 'Calculator',
    aliases: ['calculator', 'calc', 'cal', 'कैलकुलेटर', 'हिसाब'],
    description: 'Standard and scientific math calculator',
    category: 'utilities'
  },
  {
    id: 'files',
    name: 'File Explorer',
    aliases: ['file explorer', 'files', 'folder', 'my files', 'फाइल', 'एक्सप्लोरर', 'documents'],
    description: 'Browse, view, and manage storage',
    category: 'utilities'
  },
  {
    id: 'terminal',
    name: 'Terminal',
    aliases: ['terminal', 'cmd', 'command prompt', 'bash', 'powershell', 'कमांड', 'शेल'],
    description: 'Interactive system shell',
    category: 'system'
  },
  {
    id: 'system',
    name: 'System Monitor',
    aliases: ['system monitor', 'task manager', 'processes', 'status', 'सिस्टम', 'टास्क मैनेजर'],
    description: 'Real-time CPU, RAM, and process manager',
    category: 'system'
  },
  {
    id: 'browser',
    name: 'Web Browser',
    aliases: ['browser', 'chrome', 'google', 'web', 'इंटरनेट', 'ब्राउज़र'],
    description: 'Fast simulated web navigation & search',
    category: 'internet'
  },
  {
    id: 'settings',
    name: 'Settings',
    aliases: ['settings', 'config', 'preferences', 'सेटिंग्स', 'विकल्प'],
    description: 'Assistant voice and audio preferences',
    category: 'system'
  }
];

// ==========================================
// SESSION MEMORY STATE
// ==========================================
class ServerSessionMemory {
  active = true;
  currentGoal: string | null = null;
  lastInstruction: string | null = null;
  currentApp: string | null = null;
  currentFile: VFile | null = null;
  currentTarget: string | null = null;
  runningApps: Set<string> = new Set(['files']); // files open by default
  lastAction: string | null = 'System initialized';
  taskState: 'idle' | 'active' | 'waiting_for_selection' | 'completed' | 'failed' = 'idle';
  pendingSelection: any[] | null = null;
  selectionSource: 'app' | 'file' | 'resolver' | null = null;
  conversationHistory: { role: 'user' | 'vyom'; text: string; timestamp: string }[] = [];

  reset() {
    this.currentGoal = null;
    this.lastInstruction = null;
    this.currentApp = null;
    this.currentFile = null;
    this.currentTarget = null;
    this.pendingSelection = null;
    this.selectionSource = null;
    this.taskState = 'idle';
    this.conversationHistory = [];
  }
}

const sessionMemory = new ServerSessionMemory();

// ==========================================
// MULTILINGUAL COMMAND & INTENT PARSER
// ==========================================
interface ParsedIntent {
  intent: 'open' | 'close_app' | 'search_file' | 'open_file' | 'search_and_open_file' | 'selection' | 'conversation' | 'deep_reasoning' | 'unknown';
  target: string;
  language: 'hindi' | 'hinglish' | 'english';
  subType?: string;
  confidence: number;
}

function parseMultilingualCommand(rawInput: string): ParsedIntent {
  const input = rawInput.trim();
  const lower = input.toLowerCase();

  // Detect script/language
  const hasDevanagari = /[\u0900-\u097F]/.test(input);
  const isHinglish = /\b(kholo|khol|chalu|band|karo|batao|dhundo|kaise|kaun|hai|hoon|namaste|pranam|mujhe|aap|mera|meri|wala|wali|dusra|pehla)\b/i.test(lower);
  const language: 'hindi' | 'hinglish' | 'english' = hasDevanagari ? 'hindi' : (isHinglish ? 'hinglish' : 'english');

  // 1. NUMBER / SELECTION
  // Examples: "1", "2", "pehla wala", "first", "first one", "option 2", "dusra"
  const selectionNumberMatch = lower.match(/^(\d+)$/) ||
    lower.match(/\b(?:option|number|no\.?|choice)\s*(\d+)\b/) ||
    lower.match(/^(first|second|third|fourth|fifth|1st|2nd|3rd|4th|5th)$/);

  if (selectionNumberMatch) {
    let numStr = selectionNumberMatch[1];
    if (selectionNumberMatch[0] === 'first' || selectionNumberMatch[0] === '1st') numStr = '1';
    else if (selectionNumberMatch[0] === 'second' || selectionNumberMatch[0] === '2nd') numStr = '2';
    else if (selectionNumberMatch[0] === 'third' || selectionNumberMatch[0] === '3rd') numStr = '3';
    else if (selectionNumberMatch[0] === 'fourth' || selectionNumberMatch[0] === '4th') numStr = '4';
    else if (selectionNumberMatch[0] === 'fifth' || selectionNumberMatch[0] === '5th') numStr = '5';

    return {
      intent: 'selection',
      target: numStr,
      language,
      confidence: 0.98
    };
  }

  if (/\b(पहला|pehla|first|1st|first one|pehla wala)\b/i.test(lower)) {
    return { intent: 'selection', target: '1', language, confidence: 0.95 };
  }
  if (/\b(दूसरा|dusra|second|2nd|second one|dusra wala)\b/i.test(lower)) {
    return { intent: 'selection', target: '2', language, confidence: 0.95 };
  }
  if (/\b(तीसरा|teesra|third|3rd|third one|teesra wala)\b/i.test(lower)) {
    return { intent: 'selection', target: '3', language, confidence: 0.95 };
  }

  // 2. CLOSE INTENTS
  // Examples: "close notepad", "band karo", "calculator band kar do", "exit browser"
  const closeRegex = /\b(?:close|quit|exit|terminate|kill|shut|band|hatao|rok|roko)\b/i;
  if (closeRegex.test(lower)) {
    let target = lower
      .replace(/\b(?:please|can you|vyom|band|karo|kar|do|kardo|hatao|close|quit|exit|the|application|app)\b/gi, '')
      .trim();

    if (!target && sessionMemory.currentApp) {
      target = sessionMemory.currentApp;
    }

    return {
      intent: 'close_app',
      target,
      language,
      confidence: 0.92
    };
  }

  // 3. SEARCH FILE INTENTS
  // Examples: "search file report", "quarterly_report dhundo", "find document"
  const searchRegex = /\b(?:search|find|dhundo|khojo|lookup|locate)\b/i;
  if (searchRegex.test(lower)) {
    let target = lower
      .replace(/\b(?:search|find|dhundo|khojo|lookup|locate|file|document|folder|for|please|karo|kar|do)\b/gi, '')
      .trim();

    return {
      intent: 'search_file',
      target: target || 'all',
      language,
      confidence: 0.90
    };
  }

  // 4. OPEN FILE SPECIFIC
  // Examples: "open file meeting_notes.txt", "quarterly_report.docx kholo"
  const fileExtRegex = /\.(txt|docx|doc|pdf|xlsx|xls|png|jpg|jpeg|py|csv)$/i;
  if (fileExtRegex.test(lower)) {
    let target = lower.replace(/\b(?:open|kholo|start|view|file|khol|do)\b/gi, '').trim();
    return {
      intent: 'open_file',
      target,
      language,
      confidence: 0.94
    };
  }

  // 5. GENERAL OPEN APP OR FILE
  // Examples: "open notepad", "calculator kholo", "chrome chalu karo", "launch terminal"
  const openRegex = /\b(?:open|launch|start|run|kholo|khol|chalu|start karo|shuru karo)\b/i;
  if (openRegex.test(lower)) {
    let target = lower
      .replace(/\b(?:please|can you|vyom|open|launch|start|run|kholo|khol|do|kardo|chalu|karo|shuru|the|application|app)\b/gi, '')
      .trim();

    // Check if target is a file or app
    if (fileExtRegex.test(target)) {
      return { intent: 'open_file', target, language, confidence: 0.93 };
    }

    return {
      intent: 'open',
      target,
      language,
      confidence: 0.92
    };
  }

  // 6. CONVERSATIONAL PATTERNS
  // Greetings: "hello", "namaste", "hi", "hey"
  if (/\b(namaste|pranam|hello|hi|hey|good morning|good evening|salaam)\b/i.test(lower)) {
    return { intent: 'conversation', target: 'greeting', language, confidence: 0.99 };
  }
  // Identity: "who are you", "tum kaun ho", "aap kaun hain"
  if (/\b(?:who are you|tum kaun ho|aap kaun ho|aap kaun hain|apka naam kya hai|what is your name)\b/i.test(lower)) {
    return { intent: 'conversation', target: 'identity', language, confidence: 0.99 };
  }
  // Capabilities: "what can you do", "aap kya kar sakte ho", "help", "features"
  if (/\b(?:what can you do|capabilities|kya kar sakte ho|features|help|madad|madad karo)\b/i.test(lower)) {
    return { intent: 'conversation', target: 'capabilities', language, confidence: 0.99 };
  }
  // Status: "status", "system status", "health", "kaise ho", "how are you"
  if (/\b(?:status|system status|how are you|kaise ho|kya haal hai|health|metrics)\b/i.test(lower)) {
    return { intent: 'conversation', target: 'status', language, confidence: 0.99 };
  }
  // Gratitude / acknowledgement
  if (/\b(thank you|thanks|shukriya|dhanyawad|great|theek hai|achha)\b/i.test(lower)) {
    return { intent: 'conversation', target: 'thanks', language, confidence: 0.95 };
  }

  // Check if just the app name was spoken (e.g. "calculator", "notepad")
  for (const appDef of registeredApps) {
    if (appDef.aliases.some(alias => lower === alias || lower === `${alias} please`)) {
      return {
        intent: 'open',
        target: appDef.id,
        language,
        confidence: 0.88
      };
    }
  }

  // 7. DEEP REASONING / QA (Anything else)
  return {
    intent: 'deep_reasoning',
    target: rawInput,
    language,
    confidence: 0.75
  };
}

// ==========================================
// GEMINI / LOCAL REASONER GATEWAY
// ==========================================
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } catch (e) {
      console.error('Failed to init GoogleGenAI:', e);
    }
  }
  return aiClient;
}

async function reasonWithAI(prompt: string, language: 'hindi' | 'hinglish' | 'english'): Promise<string> {
  const client = getGeminiClient();
  const systemInstruction = `You are Vyom, an advanced, polite, and articulate multilingual AI assistant created for intelligent computing, desktop automation, and conversational reasoning.
Current context: User spoke in ${language}.
Always respond warmly, accurately, and concisely (1-3 sentences max) matching the language of the user (Hindi, Hinglish, or English).
Never use robotic meta-commentary. Keep your tone confident and helpful.`;

  if (client) {
    const modelsToTry = ['gemini-3.6-flash', 'gemini-3.8-flash', 'gemini-flash-latest'];
    for (const modelName of modelsToTry) {
      try {
        const response = await client.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            systemInstruction,
            temperature: 0.6,
            maxOutputTokens: 1000
          }
        });
        if (response.text) {
          return response.text.trim();
        }
      } catch (err) {
        console.warn(`Gemini query with ${modelName} failed, trying next:`, err);
      }
    }
  }

  // Local rule-based intelligent fallback
  if (language === 'hindi') {
    return `मैंने आपके प्रश्न "${prompt}" का विश्लेषण किया है। मैं एक मल्टीलिंगुअल ऑटोनॉमस असिस्टेंट हूँ। आप मुझसे ऐप्स खोलने, फाइल्स खोजने, या सिस्टम मॉनिटर करने के लिए कह सकते हैं।`;
  } else if (language === 'hinglish') {
    return `Main aapke query "${prompt}" ko samajh gaya hoon. Main aapke system commands execute karne aur desktop tasks automate karne ke liye taiyar hoon!`;
  }
  return `I have processed your query regarding "${prompt}". As Vyom AI, I am ready to automate your desktop workflow, launch applications, or search through your files.`;
}

// ==========================================
// ACTION EXECUTORS
// ==========================================
function executeOpen(target: string, language: 'hindi' | 'hinglish' | 'english') {
  const cleanTarget = target.toLowerCase().trim();

  // 1. Check registered applications
  const matchingApp = registeredApps.find(appDef =>
    appDef.id === cleanTarget ||
    appDef.name.toLowerCase() === cleanTarget ||
    appDef.aliases.some(alias => cleanTarget.includes(alias.toLowerCase()) || alias.toLowerCase().includes(cleanTarget))
  );

  if (matchingApp) {
    sessionMemory.runningApps.add(matchingApp.id);
    sessionMemory.currentApp = matchingApp.id;
    sessionMemory.lastAction = `Launched ${matchingApp.name}`;
    sessionMemory.taskState = 'completed';

    const reply = language === 'hindi'
      ? `${matchingApp.name} खोल दिया गया है।`
      : language === 'hinglish'
        ? `${matchingApp.name} open kar diya hai.`
        : `Opened ${matchingApp.name} successfully.`;

    return {
      success: true,
      appId: matchingApp.id,
      appName: matchingApp.name,
      reply,
      spokenText: reply
    };
  }

  // 2. Check virtual files
  const matchingFiles = virtualFiles.filter(f =>
    f.name.toLowerCase().includes(cleanTarget) ||
    cleanTarget.includes(f.name.toLowerCase().split('.')[0])
  );

  if (matchingFiles.length === 1) {
    const file = matchingFiles[0];
    sessionMemory.currentFile = file;
    sessionMemory.runningApps.add('files');
    sessionMemory.currentApp = 'files';
    sessionMemory.lastAction = `Opened file ${file.name}`;
    sessionMemory.taskState = 'completed';

    const reply = language === 'hindi'
      ? `फाइल '${file.name}' खोल दी गई है।`
      : language === 'hinglish'
        ? `File '${file.name}' open kar di hai.`
        : `Opened '${file.name}'.`;

    return {
      success: true,
      file,
      reply,
      spokenText: reply
    };
  }

  if (matchingFiles.length > 1) {
    sessionMemory.pendingSelection = matchingFiles.map((f, i) => ({
      index: i + 1,
      label: f.name,
      detail: `${f.folder} • ${f.size}`,
      type: 'file',
      targetValue: f.id
    }));
    sessionMemory.selectionSource = 'file';
    sessionMemory.taskState = 'waiting_for_selection';

    const optionsText = matchingFiles.map((f, i) => `${i + 1}. ${f.name} (${f.folder})`).join('\n');
    const reply = language === 'hindi'
      ? `'${target}' के लिए कई फाइल्स मिलीं:\n${optionsText}\nकृपया नंबर चुनें।`
      : language === 'hinglish'
        ? `'${target}' ke liye multiple files mili:\n${optionsText}\nKripya number chuniye.`
        : `Multiple files found for '${target}':\n${optionsText}\nPlease select a number.`;

    return {
      success: false,
      needsSelection: true,
      options: sessionMemory.pendingSelection,
      reply,
      spokenText: language === 'hindi' ? `कई फाइल्स मिलीं, कृपया नंबर चुनें।` : `Multiple files found. Please select a number.`
    };
  }

  // 3. If neither exact app nor file, check app suggestions
  const suggestedApps = registeredApps.filter(appDef =>
    appDef.aliases.some(alias => alias.includes(cleanTarget) || cleanTarget.includes(alias.slice(0, 3)))
  );

  if (suggestedApps.length > 0) {
    sessionMemory.pendingSelection = suggestedApps.map((a, i) => ({
      index: i + 1,
      label: a.name,
      detail: a.description,
      type: 'app',
      targetValue: a.id
    }));
    sessionMemory.selectionSource = 'app';
    sessionMemory.taskState = 'waiting_for_selection';

    const optionsText = suggestedApps.map((a, i) => `${i + 1}. ${a.name}`).join('\n');
    const reply = language === 'hindi'
      ? `क्या आपका मतलब इनमें से किसी ऐप से था?\n${optionsText}\nकृपया नंबर चुनें।`
      : language === 'hinglish'
        ? `Kya aapka matlab inme se kisi app se tha?\n${optionsText}\nKripya number chuniye.`
        : `Did you mean one of these applications?\n${optionsText}\nPlease choose a number.`;

    return {
      success: false,
      needsSelection: true,
      options: sessionMemory.pendingSelection,
      reply,
      spokenText: language === 'hindi' ? `कृपया एक विकल्प चुनें।` : `Please choose an option.`
    };
  }

  const notFoundReply = language === 'hindi'
    ? `क्षमा करें, मुझे '${target}' नाम का कोई ऐप या फाइल नहीं मिली।`
    : language === 'hinglish'
      ? `Sorry, mujhe '${target}' name ka koi app ya file nahi mili.`
      : `I could not find an application or file matching '${target}'.`;

  return {
    success: false,
    reply: notFoundReply,
    spokenText: notFoundReply
  };
}

function executeClose(target: string, language: 'hindi' | 'hinglish' | 'english') {
  let targetAppId = target.toLowerCase().trim();

  // If no target given, use current active app
  if (!targetAppId && sessionMemory.currentApp) {
    targetAppId = sessionMemory.currentApp;
  }

  const matchingApp = registeredApps.find(appDef =>
    appDef.id === targetAppId ||
    appDef.name.toLowerCase() === targetAppId ||
    appDef.aliases.some(alias => targetAppId.includes(alias.toLowerCase()))
  );

  if (matchingApp && sessionMemory.runningApps.has(matchingApp.id)) {
    sessionMemory.runningApps.delete(matchingApp.id);
    if (sessionMemory.currentApp === matchingApp.id) {
      sessionMemory.currentApp = sessionMemory.runningApps.size > 0 ? Array.from(sessionMemory.runningApps)[0] : null;
    }
    sessionMemory.lastAction = `Closed ${matchingApp.name}`;
    sessionMemory.taskState = 'completed';

    const reply = language === 'hindi'
      ? `${matchingApp.name} को बंद कर दिया गया है।`
      : language === 'hinglish'
        ? `${matchingApp.name} close kar diya gaya hai.`
        : `Closed ${matchingApp.name}.`;

    return {
      success: true,
      appId: matchingApp.id,
      reply,
      spokenText: reply
    };
  }

  if (matchingApp && !sessionMemory.runningApps.has(matchingApp.id)) {
    const reply = language === 'hindi'
      ? `${matchingApp.name} पहले से ही बंद है।`
      : language === 'hinglish'
        ? `${matchingApp.name} already band hai.`
        : `${matchingApp.name} is already closed.`;
    return { success: true, reply, spokenText: reply };
  }

  const fallbackClose = sessionMemory.currentApp;
  if (fallbackClose) {
    sessionMemory.runningApps.delete(fallbackClose);
    sessionMemory.currentApp = null;
    const reply = language === 'hindi' ? `वर्तमान विंडो बंद कर दी गई है।` : `Active window has been closed.`;
    return { success: true, appId: fallbackClose, reply, spokenText: reply };
  }

  const noWindowReply = language === 'hindi'
    ? `कोई सक्रिय ऐप खुला हुआ नहीं है।`
    : language === 'hinglish'
      ? `Koi active app khula nahi hai.`
      : `No active application is currently open.`;

  return { success: false, reply: noWindowReply, spokenText: noWindowReply };
}

function executeSearchFile(target: string, language: 'hindi' | 'hinglish' | 'english') {
  const cleanTarget = target.toLowerCase().trim();
  const results = virtualFiles.filter(f =>
    cleanTarget === 'all' ||
    f.name.toLowerCase().includes(cleanTarget) ||
    f.folder.toLowerCase().includes(cleanTarget) ||
    f.type.toLowerCase().includes(cleanTarget)
  );

  if (results.length === 0) {
    const reply = language === 'hindi'
      ? `'${target}' से संबंधित कोई फाइल नहीं मिली।`
      : language === 'hinglish'
        ? `'${target}' se related koi file nahi mili.`
        : `No files found matching '${target}'.`;
    return { success: false, reply, spokenText: reply };
  }

  if (results.length === 1) {
    const file = results[0];
    sessionMemory.currentFile = file;
    sessionMemory.runningApps.add('files');
    sessionMemory.currentApp = 'files';
    sessionMemory.lastAction = `Found & opened ${file.name}`;

    const reply = language === 'hindi'
      ? `1 फाइल मिली: '${file.name}' (${file.folder})\nइसे फाइल एक्सप्लोरर में खोल दिया गया है।`
      : language === 'hinglish'
        ? `1 file mili: '${file.name}' (${file.folder})\nIse File Explorer me open kar diya hai.`
        : `Found 1 file: '${file.name}' in ${file.folder}. Opening it in File Explorer.`;

    return {
      success: true,
      file,
      reply,
      spokenText: language === 'hindi' ? `फाइल '${file.name}' मिल गई है।` : `Found '${file.name}'.`
    };
  }

  // Multiple results: save to pending selection
  sessionMemory.pendingSelection = results.map((f, i) => ({
    index: i + 1,
    label: f.name,
    detail: `${f.folder} • ${f.size}`,
    type: 'file',
    targetValue: f.id
  }));
  sessionMemory.selectionSource = 'file';
  sessionMemory.taskState = 'waiting_for_selection';

  const listText = results.map((f, i) => `${i + 1}. ${f.name} [${f.folder} - ${f.size}]`).join('\n');
  const reply = language === 'hindi'
    ? `'${target}' के लिए ${results.length} फाइल्स मिलीं:\n${listText}\nकृपया खोलने के लिए संख्या बताएं (उदा. '1' या 'पहला वाला')।`
    : language === 'hinglish'
      ? `'${target}' ke liye ${results.length} files mili:\n${listText}\nKripya open karne ke liye number batayein.`
      : `Found ${results.length} files matching '${target}':\n${listText}\nPlease select a number to open.`;

  return {
    success: true,
    needsSelection: true,
    options: sessionMemory.pendingSelection,
    reply,
    spokenText: language === 'hindi' ? `${results.length} फाइल्स मिलीं, कृपया नंबर चुनें।` : `Found ${results.length} files. Please select a number.`
  };
}

function executeSelection(numStr: string, language: 'hindi' | 'hinglish' | 'english') {
  const num = parseInt(numStr, 10);
  if (!sessionMemory.pendingSelection || sessionMemory.pendingSelection.length === 0) {
    const reply = language === 'hindi'
      ? `अभी कोई विकल्प चयन लंबित नहीं है।`
      : language === 'hinglish'
        ? `Abhi koi selection pending nahi hai.`
        : `There is no pending selection right now.`;
    return { success: false, reply, spokenText: reply };
  }

  const selectedOption = sessionMemory.pendingSelection.find(opt => opt.index === num);
  if (!selectedOption) {
    const reply = language === 'hindi'
      ? `अमान्य संख्या। कृपया 1 से ${sessionMemory.pendingSelection.length} के बीच चुनें।`
      : language === 'hinglish'
        ? `Invalid number. Kripya 1 se ${sessionMemory.pendingSelection.length} ke beech chuniye.`
        : `Invalid selection. Please choose a number between 1 and ${sessionMemory.pendingSelection.length}.`;
    return { success: false, reply, spokenText: reply };
  }

  // Clear pending selection
  sessionMemory.pendingSelection = null;
  sessionMemory.selectionSource = null;
  sessionMemory.taskState = 'completed';

  if (selectedOption.type === 'file') {
    const file = virtualFiles.find(f => f.id === selectedOption.targetValue);
    if (file) {
      sessionMemory.currentFile = file;
      sessionMemory.runningApps.add('files');
      sessionMemory.currentApp = 'files';
      sessionMemory.lastAction = `Opened ${file.name}`;

      const reply = language === 'hindi'
        ? `विकल्प ${num} चुना गया: '${file.name}' खोल दिया गया है।`
        : language === 'hinglish'
          ? `Option ${num} select kiya: '${file.name}' open kar diya hai.`
          : `Selected option ${num}: opened '${file.name}'.`;

      return { success: true, file, reply, spokenText: reply };
    }
  }

  if (selectedOption.type === 'app') {
    const appDef = registeredApps.find(a => a.id === selectedOption.targetValue);
    if (appDef) {
      sessionMemory.runningApps.add(appDef.id);
      sessionMemory.currentApp = appDef.id;
      sessionMemory.lastAction = `Opened ${appDef.name}`;

      const reply = language === 'hindi'
        ? `विकल्प ${num} चुना गया: ${appDef.name} खोल दिया गया है।`
        : language === 'hinglish'
          ? `Option ${num} select kiya: ${appDef.name} open kar diya hai.`
          : `Selected option ${num}: opened ${appDef.name}.`;

      return { success: true, appId: appDef.id, reply, spokenText: reply };
    }
  }

  return { success: true, reply: `Selected option ${num}.`, spokenText: `Option ${num} selected.` };
}

function executeConversation(target: string, language: 'hindi' | 'hinglish' | 'english') {
  sessionMemory.taskState = 'completed';

  if (target === 'greeting') {
    const reply = language === 'hindi'
      ? `नमस्ते! मैं व्योम (Vyom AI) हूँ। आपका व्यक्तिगत ऑटोनॉमस असिस्टेंट। मैं आपकी क्या सहायता कर सकता हूँ?`
      : language === 'hinglish'
        ? `Namaste! Main Vyom AI hoon. Bataiye aaj main aapke desktop ya tasks me kya madad kar sakta hoon?`
        : `Hello! I am Vyom AI, your autonomous assistant. How can I help you today?`;
    return { reply, spokenText: reply };
  }

  if (target === 'identity') {
    const reply = language === 'hindi'
      ? `मैं व्योम हूँ—एक स्वायत्त और बुद्धिमान AI सहायक। मैं प्राकृतिक भाषा समझकर आपके सिस्टम के ऐप्स शुरू कर सकता हूँ, फाइल्स प्रबंधित कर सकता हूँ और जटिल कार्यों को पूरा कर सकता हूँ।`
      : language === 'hinglish'
        ? `Main Vyom hoon—aapka intelligent desktop companion. Main Hindi, Hinglish aur English commands samajh kar apps launch kar sakta hoon, files search kar sakta hoon, aur calculations automate kar sakta hoon.`
      : `I am Vyom, an autonomous multilingual AI assistant engineered for seamless workflow execution, desktop application orchestration, and contextual intelligence.`;
    return { reply, spokenText: reply };
  }

  if (target === 'capabilities') {
    const reply = language === 'hindi'
      ? `मैं निम्नलिखित कार्य कर सकता हूँ:\n1. ऐप्स खोलना और बंद करना (जैसे नोटपैड, कैलकुलेटर, टर्मिनल, वेब ब्राउज़र)\n2. फाइल्स खोजना और उनका पूर्वावलोकन दिखाना\n3. वॉइस और टेक्स्ट से हिंदी, हिंग्लिश और अंग्रेज़ी में संवाद करना\n4. सिस्टम मेट्रिक्स और टास्क प्रोसेस की निगरानी करना`
      : language === 'hinglish'
        ? `Main ye sab kar sakta hoon:\n1. Apps open aur close karna (Notepad, Calculator, Terminal, Browser, File Explorer)\n2. Files search aur open karna (.docx, .pdf, .txt, .jpg)\n3. Voice ya text me Hindi, Hinglish aur English me baat karna\n4. Real-time CPU, RAM aur processes monitor karna`
        : `Here is what I can do for you:\n1. Launch and terminate applications (Notepad, Calculator, Terminal, Browser, File Explorer)\n2. Search and inspect local files & documents\n3. Multilingual voice and text processing (Hindi, Hinglish, English)\n4. Real-time system monitoring & task execution tracking`;
    return { reply, spokenText: reply };
  }

  if (target === 'status') {
    const runningList = Array.from(sessionMemory.runningApps).join(', ') || 'None';
    const reply = language === 'hindi'
      ? `सिस्टम सामान्य है। सक्रिय ऐप्स: ${runningList}। सीपीयू और मेमोरी उपयोग सुरक्षित सीमा में हैं।`
      : language === 'hinglish'
        ? `System bilkul fit hai! Active apps: ${runningList}. Session memory active hai.`
        : `All systems nominal. Running apps: ${runningList}. Cognitive reasoning engine active.`;
    return { reply, spokenText: reply };
  }

  if (target === 'thanks') {
    const reply = language === 'hindi'
      ? `आपका स्वागत है! यदि आपको किसी और चीज़ की आवश्यकता हो तो अवश्य बताएं।`
      : language === 'hinglish'
        ? `Always welcome! Kisi aur madad ki zaroorat ho to batayiye.`
        : `You are welcome! Let me know whenever you need anything else.`;
    return { reply, spokenText: reply };
  }

  return { reply: `I am here to assist.`, spokenText: `I am here to assist.` };
}

// ==========================================
// API ROUTES
// ==========================================

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY)
  });
});

// 2. Chat / Voice Command Endpoint
app.post('/api/chat', async (req, res) => {
  const startTime = Date.now();
  const { message } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  const rawInput = message.trim();
  sessionMemory.conversationHistory.push({
    role: 'user',
    text: rawInput,
    timestamp: new Date().toISOString()
  });

  // Multilingual Intent Detection
  const parsed = parseMultilingualCommand(rawInput);
  sessionMemory.currentGoal = rawInput;
  sessionMemory.lastInstruction = rawInput;

  let executionResult: any = null;
  const reasoningSteps: string[] = [
    `Detected language: ${parsed.language.toUpperCase()}`,
    `Parsed Intent: ${parsed.intent} (Confidence: ${(parsed.confidence * 100).toFixed(0)}%)`,
    `Extracted Target: "${parsed.target || 'N/A'}"`
  ];

  let reply = '';
  let spokenText = '';
  let openedAppId: string | undefined;
  let closedAppId: string | undefined;
  let openedFile: VFile | undefined;
  const actionsExecuted: string[] = [];

  switch (parsed.intent) {
    case 'open':
      reasoningSteps.push(`Routing to UniversalAppLauncher & UniversalResolver`);
      executionResult = executeOpen(parsed.target, parsed.language);
      reply = executionResult.reply;
      spokenText = executionResult.spokenText;
      if (executionResult.appId) {
        openedAppId = executionResult.appId;
        actionsExecuted.push(`Launched application: ${executionResult.appId}`);
      }
      if (executionResult.file) {
        openedFile = executionResult.file;
        actionsExecuted.push(`Opened file: ${executionResult.file.name}`);
      }
      break;

    case 'close_app':
      reasoningSteps.push(`Routing to ProcessManager`);
      executionResult = executeClose(parsed.target, parsed.language);
      reply = executionResult.reply;
      spokenText = executionResult.spokenText;
      if (executionResult.appId) {
        closedAppId = executionResult.appId;
        actionsExecuted.push(`Terminated process: ${executionResult.appId}`);
      }
      break;

    case 'search_file':
    case 'open_file':
    case 'search_and_open_file':
      reasoningSteps.push(`Routing to FileManager search and verification`);
      executionResult = executeSearchFile(parsed.target, parsed.language);
      reply = executionResult.reply;
      spokenText = executionResult.spokenText;
      if (executionResult.file) {
        openedFile = executionResult.file;
        actionsExecuted.push(`Located file: ${executionResult.file.name}`);
      }
      break;

    case 'selection':
      reasoningSteps.push(`Resolving pending selection option #${parsed.target}`);
      executionResult = executeSelection(parsed.target, parsed.language);
      reply = executionResult.reply;
      spokenText = executionResult.spokenText;
      if (executionResult.appId) openedAppId = executionResult.appId;
      if (executionResult.file) openedFile = executionResult.file;
      actionsExecuted.push(`Resolved selection #${parsed.target}`);
      break;

    case 'conversation':
      reasoningSteps.push(`Handling conversational intent: ${parsed.target}`);
      executionResult = executeConversation(parsed.target, parsed.language);
      reply = executionResult.reply;
      spokenText = executionResult.spokenText;
      actionsExecuted.push(`Conversational response formulated`);
      break;

    case 'deep_reasoning':
    default:
      reasoningSteps.push(`Forwarding query to Cognitive Reasoning Gateway`);
      reply = await reasonWithAI(rawInput, parsed.language);
      spokenText = reply;
      actionsExecuted.push(`Synthesized cognitive response`);
      break;
  }

  const executionTimeMs = Date.now() - startTime;
  reasoningSteps.push(`Execution completed in ${executionTimeMs}ms`);

  sessionMemory.conversationHistory.push({
    role: 'vyom',
    text: reply,
    timestamp: new Date().toISOString()
  });

  const cognitiveTrace = {
    rawInput,
    language: parsed.language,
    intent: parsed.intent,
    target: parsed.target,
    reasoningSteps,
    actionTaken: actionsExecuted.join('; ') || 'Processed command',
    status: executionResult?.needsSelection ? 'pending_selection' : (executionResult?.success === false ? 'clarification_needed' : 'success'),
    verification: executionResult?.success === false ? 'Action requires clarification or missing target' : 'Action verified by ObservationVerifier',
    executionTimeMs
  };

  const systemState = {
    metrics: {
      cpuUsage: Math.floor(15 + Math.random() * 20),
      memoryUsage: Math.floor(38 + Math.random() * 10),
      uptimeSeconds: Math.floor(process.uptime()),
      activeTasks: sessionMemory.runningApps.size
    },
    activeApp: sessionMemory.currentApp,
    runningApps: Array.from(sessionMemory.runningApps),
    pendingSelection: sessionMemory.pendingSelection,
    lastAction: sessionMemory.lastAction,
    lastGoal: sessionMemory.currentGoal,
    taskState: sessionMemory.taskState,
    geminiActive: Boolean(process.env.GEMINI_API_KEY)
  };

  res.json({
    reply,
    spokenText,
    intent: parsed.intent,
    target: parsed.target,
    cognitiveTrace,
    actionsExecuted,
    selectionOptions: sessionMemory.pendingSelection || undefined,
    systemState,
    openedAppId,
    closedAppId,
    openedFile
  });
});

// 3. System state endpoint
app.get('/api/system/state', (req, res) => {
  res.json({
    metrics: {
      cpuUsage: Math.floor(15 + Math.random() * 20),
      memoryUsage: Math.floor(38 + Math.random() * 10),
      uptimeSeconds: Math.floor(process.uptime()),
      activeTasks: sessionMemory.runningApps.size
    },
    activeApp: sessionMemory.currentApp,
    runningApps: Array.from(sessionMemory.runningApps),
    registeredApps,
    pendingSelection: sessionMemory.pendingSelection,
    lastAction: sessionMemory.lastAction,
    lastGoal: sessionMemory.currentGoal,
    taskState: sessionMemory.taskState,
    geminiActive: Boolean(process.env.GEMINI_API_KEY)
  });
});

// 4. App Launch endpoint
app.post('/api/apps/launch', (req, res) => {
  const { appId } = req.body;
  const appDef = registeredApps.find(a => a.id === appId);
  if (!appDef) {
    return res.status(404).json({ error: 'App not found' });
  }

  sessionMemory.runningApps.add(appId);
  sessionMemory.currentApp = appId;
  sessionMemory.lastAction = `Launched ${appDef.name}`;

  res.json({
    success: true,
    runningApps: Array.from(sessionMemory.runningApps),
    activeApp: appId
  });
});

// 5. App Close endpoint
app.post('/api/apps/close', (req, res) => {
  const { appId } = req.body;
  sessionMemory.runningApps.delete(appId);
  if (sessionMemory.currentApp === appId) {
    sessionMemory.currentApp = sessionMemory.runningApps.size > 0 ? Array.from(sessionMemory.runningApps)[0] : null;
  }
  sessionMemory.lastAction = `Closed ${appId}`;

  res.json({
    success: true,
    runningApps: Array.from(sessionMemory.runningApps),
    activeApp: sessionMemory.currentApp
  });
});

// 6. Files list and search endpoint
app.get('/api/files', (req, res) => {
  const { q, folder } = req.query;
  let results = virtualFiles;

  if (folder && typeof folder === 'string') {
    results = results.filter(f => f.folder.toLowerCase() === folder.toLowerCase());
  }

  if (q && typeof q === 'string') {
    const cleanQ = q.toLowerCase();
    results = results.filter(f =>
      f.name.toLowerCase().includes(cleanQ) ||
      f.content.toLowerCase().includes(cleanQ)
    );
  }

  res.json({ files: results });
});

// 7. Save / update file content
app.post('/api/files/save', (req, res) => {
  const { name, content, folder } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });

  const existingIndex = virtualFiles.findIndex(f => f.name.toLowerCase() === name.toLowerCase());
  if (existingIndex >= 0) {
    virtualFiles[existingIndex].content = content || '';
    virtualFiles[existingIndex].updatedAt = new Date().toISOString().split('T')[0];
    return res.json({ success: true, file: virtualFiles[existingIndex] });
  }

  const newFile: VFile = {
    id: 'f_' + Date.now(),
    name,
    path: `C:\\Users\\User\\${folder || 'Documents'}\\${name}`,
    folder: folder || 'Documents',
    type: name.endsWith('.txt') ? 'text' : (name.endsWith('.docx') ? 'document' : 'code'),
    size: `${Math.ceil((content?.length || 10) / 1024)} KB`,
    content: content || '',
    updatedAt: new Date().toISOString().split('T')[0]
  };
  virtualFiles.push(newFile);
  res.json({ success: true, file: newFile });
});

// 8. Session reset endpoint
app.post('/api/session/reset', (req, res) => {
  sessionMemory.reset();
  res.json({ success: true, message: 'Session memory reset.' });
});

// ==========================================
// VITE OR STATIC SERVING
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Vyom AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
