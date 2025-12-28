import React, { useState, useCallback, useRef, DragEvent } from 'react';

interface PreviewProps {
  onClose: () => void;
}

interface FileInfo {
  name: string;
  type: string;
  size: number;
  content?: string;
  url?: string;
}

const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
};

const getFileIcon = (type: string, name: string): string => {
  if (type.startsWith('image/')) return '🖼️';
  if (type.startsWith('video/')) return '🎬';
  if (type.startsWith('audio/')) return '🎵';
  if (type === 'application/pdf') return '📕';
  if (type.includes('json')) return '📋';
  if (type.includes('javascript') || type.includes('typescript')) return '💛';
  if (type.includes('html')) return '🌐';
  if (type.includes('css')) return '🎨';
  if (type.includes('markdown') || name.endsWith('.md')) return '📝';
  if (type.includes('zip') || type.includes('tar') || type.includes('gz')) return '📦';
  if (type.startsWith('text/')) return '📄';
  return '📎';
};

const Preview: React.FC<PreviewProps> = ({ onClose }) => {
  const [file, setFile] = useState<FileInfo | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [zoom, setZoom] = useState(100);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (f: File) => {
    const info: FileInfo = {
      name: f.name,
      type: f.type || 'application/octet-stream',
      size: f.size,
    };

    if (f.type.startsWith('image/') || f.type.startsWith('video/') || f.type.startsWith('audio/')) {
      info.url = URL.createObjectURL(f);
    } else if (f.type.startsWith('text/') || f.type.includes('json') || f.type.includes('javascript') ||
               f.type.includes('html') || f.type.includes('css') || f.type.includes('markdown') ||
               f.name.endsWith('.md') || f.name.endsWith('.tsx') || f.name.endsWith('.ts') ||
               f.name.endsWith('.jsx') || f.name.endsWith('.py') || f.name.endsWith('.go') ||
               f.name.endsWith('.rs') || f.name.endsWith('.sh')) {
      info.content = await f.text();
    } else if (f.type === 'application/pdf') {
      info.url = URL.createObjectURL(f);
    }

    setFile(info);
    setZoom(100);
  }, []);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) processFile(f);
  }, [processFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) processFile(f);
  }, [processFile]);

  // Preview content renderer
  const renderPreview = () => {
    if (!file) return null;

    // Image
    if (file.type.startsWith('image/') && file.url) {
      return (
        <div className="flex-1 flex items-center justify-center p-4 overflow-auto bg-[repeating-conic-gradient(#333_0%_25%,#222_0%_50%)] bg-[length:20px_20px]">
          <img
            src={file.url}
            alt={file.name}
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center' }}
            className="max-w-full max-h-full object-contain transition-transform"
          />
        </div>
      );
    }

    // Video
    if (file.type.startsWith('video/') && file.url) {
      return (
        <div className="flex-1 flex items-center justify-center p-4 bg-black">
          <video
            src={file.url}
            controls
            autoPlay
            className="max-w-full max-h-full"
          />
        </div>
      );
    }

    // Audio
    if (file.type.startsWith('audio/') && file.url) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-purple-900 to-gray-900">
          <div className="text-8xl mb-6 animate-pulse">🎵</div>
          <h2 className="text-xl font-bold text-white mb-4">{file.name}</h2>
          <audio src={file.url} controls autoPlay className="w-full max-w-md" />
        </div>
      );
    }

    // PDF
    if (file.type === 'application/pdf' && file.url) {
      return (
        <iframe
          src={file.url}
          className="flex-1 w-full border-0"
          title={file.name}
        />
      );
    }

    // Text/Code
    if (file.content) {
      const isCode = file.name.match(/\.(tsx?|jsx?|py|go|rs|sh|json|html|css|md)$/);
      return (
        <div className="flex-1 overflow-auto">
          <pre
            className={`p-4 text-sm ${isCode ? 'bg-gray-900 text-green-400' : 'bg-white text-gray-900'}`}
            style={{ fontSize: `${zoom}%` }}
          >
            <code>{file.content}</code>
          </pre>
        </div>
      );
    }

    // Unknown binary
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-gray-500">
        <div className="text-8xl mb-4">{getFileIcon(file.type, file.name)}</div>
        <h2 className="text-xl font-bold mb-2">{file.name}</h2>
        <p className="text-sm">{file.type}</p>
        <p className="text-sm">{formatSize(file.size)}</p>
        <p className="mt-4 text-sm">No preview available for this file type</p>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-gray-900 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <span className="text-2xl">👁️</span>
          <div>
            <h1 className="font-bold text-white">Preview</h1>
            {file && <p className="text-xs text-gray-500">{file.name}</p>}
          </div>
        </div>

        {file && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoom(z => Math.max(25, z - 25))}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded"
            >
              −
            </button>
            <span className="text-white w-14 text-center">{zoom}%</span>
            <button
              onClick={() => setZoom(z => Math.min(400, z + 25))}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded"
            >
              +
            </button>
            <button
              onClick={() => setZoom(100)}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded ml-2"
            >
              Reset
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded"
          >
            Open File
          </button>
        </div>
      </div>

      {/* Content */}
      {file ? (
        renderPreview()
      ) : (
        <div
          onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={e => { e.preventDefault(); setIsDragging(false); }}
          onDrop={handleDrop}
          className={`flex-1 flex flex-col items-center justify-center transition-all ${
            isDragging ? 'bg-blue-900/30 border-blue-500' : 'bg-gray-800'
          }`}
        >
          <div className={`text-8xl mb-6 ${isDragging ? 'scale-110' : ''} transition-transform`}>
            {isDragging ? '📥' : '👁️'}
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {isDragging ? 'Drop to Preview' : 'Quick Look'}
          </h2>
          <p className="text-gray-500 mb-6">
            Drag and drop a file or click Open File to preview
          </p>

          <div className="flex flex-wrap gap-2 justify-center text-sm text-gray-600 max-w-md">
            <span className="px-2 py-1 bg-gray-700 rounded">Images</span>
            <span className="px-2 py-1 bg-gray-700 rounded">Videos</span>
            <span className="px-2 py-1 bg-gray-700 rounded">Audio</span>
            <span className="px-2 py-1 bg-gray-700 rounded">PDF</span>
            <span className="px-2 py-1 bg-gray-700 rounded">Code</span>
            <span className="px-2 py-1 bg-gray-700 rounded">Text</span>
            <span className="px-2 py-1 bg-gray-700 rounded">JSON</span>
            <span className="px-2 py-1 bg-gray-700 rounded">Markdown</span>
          </div>
        </div>
      )}

      {/* Footer */}
      {file && (
        <div className="p-2 bg-gray-900 border-t border-gray-700 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span>{getFileIcon(file.type, file.name)} {file.name}</span>
            <span>{file.type}</span>
            <span>{formatSize(file.size)}</span>
          </div>
          <button
            onClick={() => setFile(null)}
            className="text-gray-400 hover:text-white"
          >
            Close Preview
          </button>
        </div>
      )}
    </div>
  );
};

export default Preview;
