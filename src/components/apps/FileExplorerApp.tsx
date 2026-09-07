import React, { useState, useEffect } from 'react';
import { Folder, FileText, Image as ImageIcon, Code, FileSpreadsheet, Search, Eye, ExternalLink, HardDrive } from 'lucide-react';
import { VirtualFile } from '../../types';

interface FileExplorerAppProps {
  onOpenFileInNotepad?: (file: VirtualFile) => void;
  selectedFile?: VirtualFile | null;
}

export const FileExplorerApp: React.FC<FileExplorerAppProps> = ({
  onOpenFileInNotepad,
  selectedFile: externalSelected
}) => {
  const [files, setFiles] = useState<VirtualFile[]>([]);
  const [activeFolder, setActiveFolder] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [previewFile, setPreviewFile] = useState<VirtualFile | null>(null);
  const [loading, setLoading] = useState(false);

  const folders = ['All', 'Documents', 'Desktop', 'Pictures', 'Projects', 'Downloads'];

  const fetchFiles = async () => {
    setLoading(true);
    try {
      let url = '/api/files';
      const params = new URLSearchParams();
      if (activeFolder !== 'All') params.append('folder', activeFolder);
      if (searchQuery.trim()) params.append('q', searchQuery.trim());
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      const data = await res.json();
      setFiles(data.files || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [activeFolder, searchQuery]);

  useEffect(() => {
    if (externalSelected) {
      setPreviewFile(externalSelected);
    }
  }, [externalSelected]);

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="w-5 h-5 text-emerald-400" />;
      case 'spreadsheet':
        return <FileSpreadsheet className="w-5 h-5 text-green-400" />;
      case 'code':
        return <Code className="w-5 h-5 text-cyan-400" />;
      case 'pdf':
        return <FileText className="w-5 h-5 text-rose-400" />;
      default:
        return <FileText className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <div id="file-explorer-container" className="flex h-full bg-slate-900 text-slate-100 select-none">
      {/* Sidebar Folders */}
      <div id="file-explorer-sidebar" className="w-44 border-r border-slate-800 bg-slate-950/60 p-2 flex flex-col gap-1">
        <div className="flex items-center gap-2 px-2 py-1.5 text-xs font-semibold text-slate-400 tracking-wider uppercase">
          <HardDrive className="w-3.5 h-3.5" /> Virtual Drive
        </div>
        {folders.map(folder => (
          <button
            key={folder}
            id={`folder-btn-${folder.toLowerCase()}`}
            onClick={() => {
              setActiveFolder(folder);
              setPreviewFile(null);
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-left transition ${
              activeFolder === folder
                ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-800/60'
                : 'text-slate-300 hover:bg-slate-800/60'
            }`}
          >
            <Folder className={`w-3.5 h-3.5 ${activeFolder === folder ? 'text-cyan-400' : 'text-slate-500'}`} />
            {folder}
          </button>
        ))}

        <div className="mt-auto p-2 bg-slate-900/80 rounded border border-slate-800 text-[11px] text-slate-400">
          <div className="font-semibold text-slate-300">Vyom Storage</div>
          <div className="text-slate-500 text-[10px]">Indexed by UniversalResolver</div>
        </div>
      </div>

      {/* Main File View & Preview Pane */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Search & Breadcrumbs */}
        <div id="file-explorer-nav" className="flex items-center justify-between p-2.5 border-b border-slate-800 bg-slate-900/90 gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>C:</span>
            <span>/</span>
            <span>Users</span>
            <span>/</span>
            <span>User</span>
            <span>/</span>
            <span className="text-cyan-400 font-semibold">{activeFolder}</span>
          </div>

          <div className="relative flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              id="file-explorer-search-input"
              type="text"
              placeholder="Search files or speak to Vyom..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* File Grid */}
          <div id="file-explorer-grid" className="flex-1 p-3 overflow-y-auto grid grid-cols-2 md:grid-cols-3 gap-2.5 content-start">
            {loading ? (
              <div className="col-span-full py-12 text-center text-xs text-slate-500">Searching files...</div>
            ) : files.length === 0 ? (
              <div className="col-span-full py-12 text-center text-xs text-slate-500">No files match your query</div>
            ) : (
              files.map(file => (
                <div
                  key={file.id}
                  id={`file-item-${file.id}`}
                  onClick={() => setPreviewFile(file)}
                  className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-left cursor-pointer transition ${
                    previewFile?.id === file.id
                      ? 'bg-cyan-950/40 border-cyan-500/50 shadow-sm'
                      : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700'
                  }`}
                >
                  <div className="mt-0.5">{getFileIcon(file.type)}</div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium text-slate-200 truncate">{file.name}</div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                      <span>{file.size}</span>
                      <span>•</span>
                      <span>{file.folder}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* File Preview Pane */}
          {previewFile && (
            <div id="file-preview-pane" className="w-72 border-l border-slate-800 bg-slate-950/80 p-3 flex flex-col justify-between overflow-y-auto">
              <div>
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                  {getFileIcon(previewFile.type)}
                  <span className="text-xs font-semibold text-slate-200 truncate">{previewFile.name}</span>
                </div>

                <div className="mt-3 text-[11px] text-slate-400 space-y-1">
                  <div><span className="text-slate-500">Location:</span> {previewFile.path}</div>
                  <div><span className="text-slate-500">Size:</span> {previewFile.size}</div>
                  <div><span className="text-slate-500">Modified:</span> {previewFile.updatedAt}</div>
                </div>

                <div className="mt-3">
                  <div className="text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
                    <Eye className="w-3 h-3 text-cyan-400" /> Preview
                  </div>
                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300 max-h-56 overflow-y-auto whitespace-pre-wrap select-text leading-relaxed">
                    {previewFile.content}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 mt-3">
                <button
                  id="open-in-notepad-btn"
                  onClick={() => onOpenFileInNotepad?.(previewFile)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition shadow-sm"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Edit in Notepad
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
