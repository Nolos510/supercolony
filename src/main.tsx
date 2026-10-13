import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';
import { gameStore } from './game/store';

declare global { interface Window { __supercolony: typeof gameStore } }
if (import.meta.env.DEV) window.__supercolony = gameStore;

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
