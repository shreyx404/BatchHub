import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement;
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          onClose?.();
          return;
        }

        if (e.key === 'Tab' && modalRef.current) {
          const focusableElements = modalRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusableElements.length === 0) return;

          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];

          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              lastElement.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === lastElement) {
              firstElement.focus();
              e.preventDefault();
            }
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);

      // Auto-focus first input or close button
      setTimeout(() => {
        if (modalRef.current) {
          const autoFocusEl = modalRef.current.querySelector('[autofocus], input, button');
          if (autoFocusEl) autoFocusEl.focus();
        }
      }, 50);

      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
        if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
          previousFocusRef.current.focus();
        }
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Dialog'}
        className={`relative w-full ${maxWidth} bg-[var(--color-surface)] border border-[var(--color-border)] shadow-[var(--shadow-modal)] animate-fade-in-up overflow-hidden pb-safe`}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-[var(--color-border)]">
            <h2 className="text-base sm:text-lg font-display font-medium text-[var(--color-text)] tracking-[-0.01em]">{title}</h2>
            <button
              onClick={onClose}
              aria-label="Close dialog"
              className="p-2 min-h-[38px] min-w-[38px] flex items-center justify-center hover:bg-[var(--color-surface-2)] active:bg-[var(--color-surface-3)] transition-colors text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="px-4 sm:px-5 py-3 sm:py-4 max-h-[82dvh] sm:max-h-[75vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
