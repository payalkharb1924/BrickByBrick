import { createPortal } from 'react-dom';

/**
 * Renders children into #modal-root via a portal,
 * so it escapes any overflow:hidden parent.
 */
export default function Modal({ children }) {
  const el = document.getElementById('modal-root');
  if (!el) return null;
  return createPortal(
    <div
      className="modal-enter"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.7)',
        padding: '1rem',
      }}
    >
      {children}
    </div>,
    el
  );
}
