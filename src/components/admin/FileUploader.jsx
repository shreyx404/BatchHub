import { useState, useRef } from 'react';
import { Upload, X, FileText, Image as ImageIcon, File, AlertCircle } from 'lucide-react';
import { MAX_FILE_SIZE } from '../../lib/constants';

export default function FileUploader({ files, onFilesChange }) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const handleFiles = (fileList) => {
    setError('');
    const newFiles = Array.from(fileList);
    const oversized = newFiles.find((f) => f.size > MAX_FILE_SIZE);
    if (oversized) {
      setError(`"${oversized.name}" exceeds 10MB limit.`);
      return;
    }
    onFilesChange([...files, ...newFiles]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeFile = (index) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          dragOver
            ? 'border-[var(--color-accent)] bg-[var(--color-accent-glow)]'
            : 'border-[var(--color-border)] hover:border-[var(--color-border-light)]'
        }`}
      >
        <Upload size={24} className="mx-auto mb-2 text-[var(--color-text-dim)]" />
        <p className="text-sm text-[var(--color-text-muted)]">
          Drop files here or <span className="text-[var(--color-accent-hover)] font-medium">browse</span>
        </p>
        <p className="text-xs text-[var(--color-text-dim)] mt-1">Max 10MB per file</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1">
          <AlertCircle size={12} /> {error}
        </p>
      )}

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)]"
            >
              <FileTypeIcon type={file.type} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--color-text)] truncate">
                  {file.name}
                </p>
                <p className="text-xs text-[var(--color-text-dim)]">
                  {formatBytes(file.size)}
                </p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                className="p-1 rounded hover:bg-[var(--color-surface-3)] text-[var(--color-text-dim)] hover:text-red-400 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FileTypeIcon({ type }) {
  if (type?.startsWith('image/')) return <ImageIcon size={16} className="text-blue-400 shrink-0" />;
  if (type === 'application/pdf') return <FileText size={16} className="text-red-400 shrink-0" />;
  return <File size={16} className="text-[var(--color-text-dim)] shrink-0" />;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
