import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@xyflow/react/dist/style.css';
import './index.css';
import App from '@/app/App';
import { useWorldStore } from '@/store/worldStore';
import { initPersistence } from '@/services/persistence/autosave';

// Hook de depuración (solo en desarrollo): expone el store para inspección y
// pruebas manuales desde la consola. Se elimina del bundle de producción.
if (import.meta.env.DEV) {
  (window as unknown as { worldStore: typeof useWorldStore }).worldStore =
    useWorldStore;
}

// Carga el universo guardado y activa el autosave. Fuera de React y una sola
// vez, evitando dobles ejecuciones por StrictMode.
void initPersistence();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
