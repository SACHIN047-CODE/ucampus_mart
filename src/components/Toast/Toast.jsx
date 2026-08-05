import { useApp } from '../../context/AppContext';
import './Toast.css';

export default function ToastContainer() {
  const { toasts } = useApp();
  return (
    <div className="cm-toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`cm-toast cm-toast--${t.type}`}>
          <span className="cm-toast__dot" />
          {t.message}
        </div>
      ))}
    </div>
  );
}
