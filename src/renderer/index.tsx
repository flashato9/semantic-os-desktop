import { createRoot } from 'react-dom/client';
import App from './App';
import log from 'loglevel';

log.setLevel('debug'); 
const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(<App />);
