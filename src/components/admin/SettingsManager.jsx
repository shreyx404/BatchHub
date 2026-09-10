import { useState, useEffect } from 'react';
import { ExternalLink, RotateCcw, Check, Save, FolderOpen, AlertCircle, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCollegeMaterial } from '../../hooks/useCollegeMaterial';
import { DEFAULT_COLLEGE_MATERIAL_URL } from '../../lib/constants';
import { LoadingSpinner } from '../ui/LoadingState';

function isValidUrl(string) {
  if (!string || typeof string !== 'string') return false;
  try {
    const url = new URL(string.trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export default function SettingsManager() {
  const { materialUrl, loading, updateUrl, refetch } = useCollegeMaterial();
  const [urlInput, setUrlInput] = useState(materialUrl || DEFAULT_COLLEGE_MATERIAL_URL);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync state if initial fetch completes after mount
  useEffect(() => {
    if (materialUrl) {
      setUrlInput(materialUrl);
    }
  }, [materialUrl]);

  const isChanged = urlInput.trim() !== (materialUrl || '').trim();
  const isDefault = urlInput.trim() === DEFAULT_COLLEGE_MATERIAL_URL;
  const urlValid = isValidUrl(urlInput);

  const handleSave = async (e) => {
    e?.preventDefault();
    const trimmed = urlInput.trim();

    if (!trimmed) {
      toast.error('The link cannot be empty.');
      return;
    }

    if (!isValidUrl(trimmed)) {
      toast.error('Please enter a valid URL starting with https:// or http://');
      return;
    }

    setSaving(true);
    setSavedSuccess(false);

    try {
      await updateUrl(trimmed);
      setSavedSuccess(true);
      toast.success('College Material link updated successfully!');
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      toast.error(err.message || 'Failed to update link');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setUrlInput(DEFAULT_COLLEGE_MATERIAL_URL);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6 sm:space-y-8 animate-fade-in">
      {/* Page Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-display font-medium text-[var(--color-text)] tracking-[-0.01em]">
          App Settings
        </h2>
        <p className="text-[var(--text-xs)] sm:text-[var(--text-sm)] text-[var(--color-text-muted)] mt-1 font-light">
          Manage system configurations, global batch resource links, and navigation items.
        </p>
      </div>

      {/* College Material Section */}
      <div className="border border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:p-6 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[var(--color-amber-dim)] flex items-center justify-center shrink-0 border border-[var(--color-border)]">
              <FolderOpen size={18} className="text-[var(--color-amber)]" />
            </div>
            <div>
              <h3 className="text-[var(--text-sm)] sm:text-[var(--text-base)] font-medium text-[var(--color-text)] tracking-[0.005em]">
                College Study Material & Resources Link
              </h3>
              <p className="text-[11px] sm:text-[var(--text-xs)] text-[var(--color-text-muted)] mt-0.5 font-light">
                Visible to all students in the top header between <span className="font-medium text-[var(--color-text)]">Archive</span> and <span className="font-medium text-[var(--color-text)]">Theme</span> toggle.
              </p>
            </div>
          </div>
          {isDefault && (
            <span className="hidden sm:inline-flex text-[9px] px-2 py-0.5 bg-[var(--color-surface-2)] text-[var(--color-text-dim)] border border-[var(--color-border)] uppercase tracking-[0.06em] font-medium shrink-0">
              Default Link
            </span>
          )}
        </div>

        {/* Informational callout */}
        <div className="p-3 bg-[var(--color-surface-2)]/60 border-l-2 border-[var(--color-amber)] text-[var(--text-xs)] text-[var(--color-text-muted)] leading-relaxed">
          Students can click this header button at any time to open the centralized Google Drive folder or batch repository containing semester notes, syllabus, and study material.
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="material-url"
              className="block text-[11px] uppercase tracking-[0.08em] font-medium text-[var(--color-text-dim)]"
            >
              Google Drive or Vault URL
            </label>
            <div className="relative">
              <input
                id="material-url"
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://drive.google.com/drive/folders/..."
                className={`w-full h-10 px-3 bg-[var(--color-surface-2)] border text-[var(--text-xs)] sm:text-[var(--text-sm)] text-[var(--color-text)] placeholder:text-[var(--color-text-dim)] focus:outline-none transition-colors font-mono ${
                  urlInput && !urlValid
                    ? 'border-red-500 focus:border-red-400'
                    : 'border-[var(--color-border)] focus:border-[var(--color-border-light)]'
                }`}
              />
            </div>
            {urlInput && !urlValid && (
              <p className="flex items-center gap-1.5 text-red-400 text-[11px] mt-1">
                <AlertCircle size={13} />
                Please enter a valid URL starting with http:// or https://
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              {/* Test link button */}
              <a
                href={urlValid ? urlInput.trim() : '#'}
                target={urlValid ? '_blank' : undefined}
                rel={urlValid ? 'noopener noreferrer' : undefined}
                className={`inline-flex items-center gap-1.5 px-3 py-2 text-[var(--text-xs)] border transition-colors ${
                  urlValid
                    ? 'border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-surface-2)] active:scale-[0.98]'
                    : 'border-[var(--color-border)] text-[var(--color-text-dim)] cursor-not-allowed opacity-50'
                }`}
                onClick={(e) => {
                  if (!urlValid) e.preventDefault();
                }}
                title={urlValid ? 'Open link in a new tab to test' : 'Enter valid URL to test'}
              >
                <ExternalLink size={14} />
                Test Link
              </a>

              {/* Reset to Default */}
              {!isDefault && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-[var(--text-xs)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)] transition-colors active:scale-[0.98]"
                  title="Reset to original Google Drive link"
                >
                  <RotateCcw size={13} />
                  Reset to Default
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={saving || !urlValid || !isChanged}
                className={`inline-flex items-center gap-2 px-4 py-2 text-[var(--text-xs)] sm:text-[var(--text-sm)] font-medium transition-all ${
                  savedSuccess
                    ? 'bg-emerald-600 text-white'
                    : isChanged && urlValid
                    ? 'btn-primary active:scale-[0.98]'
                    : 'bg-[var(--color-surface-2)] text-[var(--color-text-dim)] border border-[var(--color-border)] cursor-not-allowed opacity-60'
                }`}
              >
                {saving ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent animate-spin" />
                    Saving...
                  </>
                ) : savedSuccess ? (
                  <>
                    <Check size={14} />
                    Saved!
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Live Preview Card */}
        <div className="pt-4 border-t border-[var(--color-border)]">
          <span className="text-[10px] font-medium tracking-[0.08em] uppercase text-[var(--color-text-dim)] block mb-2">
            Header Placement Preview
          </span>
          <div className="flex items-center gap-2 p-3 bg-[var(--color-bg)] border border-[var(--color-border)]">
            <span className="text-[11px] font-light text-[var(--color-text-dim)]">Header bar:</span>
            <div className="flex items-center gap-1.5 ml-auto">
              <span className="px-2 py-1 text-[10px] border border-[var(--color-border)] text-[var(--color-text-dim)]">
                Archive
              </span>
              <div
                className="p-2 bg-[var(--color-amber-dim)] border border-[var(--color-amber)] text-[var(--color-amber)] flex items-center justify-center"
                title="College Study Material"
              >
                <FolderOpen size={16} />
              </div>
              <span className="px-2 py-1 text-[10px] border border-[var(--color-border)] text-[var(--color-text-dim)]">
                Theme
              </span>
              <span className="px-2 py-1 text-[10px] border border-[var(--color-border)] text-[var(--color-text-dim)]">
                Admin
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
