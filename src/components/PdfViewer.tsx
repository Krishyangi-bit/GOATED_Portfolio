import { useEffect, useRef } from 'react';
import { gsap } from '../lib/gsap';
import { EASE } from '../lib/motion';
import { useReducedMotion } from '../hooks/useReducedMotion';
import './PdfViewer.css';

export type PdfDoc = {
  title: string;
  src: string;
  /** name for the downloaded file */
  fileName: string;
};

const IconDownload = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 19.5h14" />
  </svg>
);
const IconExternal = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14 5h5v5M19 5l-8 8M18 14v5H5V6h5" />
  </svg>
);

/**
 * Full-screen PDF reader in a native <dialog> (focus trap + Esc for free).
 * The document fills the page; a side rail holds Download and Open-in-new-tab
 * (always visible — some mobile browsers can't render PDFs inline).
 */
export function PdfViewer({ doc, onClose }: { doc: PdfDoc | null; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (doc && !d.open) {
      d.showModal();
      if (!reduced) {
        gsap.fromTo(
          d.querySelector('.pdfv__sheet'),
          { y: 60, rotation: -2, opacity: 0 },
          { y: 0, rotation: 0, opacity: 1, duration: 0.5, ease: EASE.settle },
        );
      }
    }
    if (!doc && d.open) d.close();
  }, [doc, reduced]);

  return (
    <dialog
      ref={ref}
      className="pdfv"
      aria-labelledby="pdfv-title"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      {doc && (
        <div className="pdfv__sheet">
          <iframe className="pdfv__frame" src={`${doc.src}#view=FitH`} title={doc.title} />
          <aside className="pdfv__rail">
            <button type="button" className="pdfv__close" onClick={onClose} aria-label="Close">
              ✕
            </button>
            <h2 id="pdfv-title" className="pdfv__title">
              {doc.title}
            </h2>
            <a className="pdfv__btn pdfv__btn--hot" href={doc.src} download={doc.fileName}>
              <IconDownload /> Download PDF
            </a>
            <a className="pdfv__btn" href={doc.src} target="_blank" rel="noopener noreferrer">
              <IconExternal /> Open in new tab<span className="sr-only"> (opens in a new tab)</span>
            </a>
          </aside>
        </div>
      )}
    </dialog>
  );
}
