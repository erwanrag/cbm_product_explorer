// frontend/src/main.jsx - ENTRY POINT FINAL
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/app/App';

// Styles globaux
import '@/styles/global.css';

// Vérification de la compatibilité navigateur
if (!window.fetch || !window.Promise) {
    console.error('❌ Navigateur non supporté. Veuillez utiliser une version récente.');
}

// Point d'entrée avec gestion d'erreur
const root = ReactDOM.createRoot(document.getElementById('root'));

try {
    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
} catch (error) {
    console.error('❌ Erreur fatale au démarrage:', error);

    // Fallback d'urgence
    root.render(
        <div style={{
            padding: '2rem',
            textAlign: 'center',
            fontFamily: 'Arial, sans-serif'
        }}>
            <h1>❌ Erreur de Démarrage</h1>
            <p>L'application n'a pas pu se charger correctement.</p>
            <button onClick={() => window.location.reload()}>
                Recharger la page
            </button>
        </div>
    );
}

// Hot Module Replacement pour le développement
if (import.meta.hot) {
    import.meta.hot.accept();
}
