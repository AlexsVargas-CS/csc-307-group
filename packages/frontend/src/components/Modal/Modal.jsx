import { useEffect } from "react";
import { createPortal } from "react-dom";

/**
 * Generic modal wrapper.
 *
 * Props:
 *  - isOpen   : boolean
 *  - onClose  : () => void
 *  - children : modal content
 */
export default function Modal({ isOpen, onClose, children }) {
  // Lock body scroll and handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", handleKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Content */}
      <div
        className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-[#1a1a1a] p-6 shadow-2xl mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-2xl text-gray-400 transition-colors hover:text-white"
          aria-label="Close"
        >
          ✕
        </button>
        {children}
      </div>
    </div>,
    document.body,
  );
}
