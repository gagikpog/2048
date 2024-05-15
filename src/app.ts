import { Game } from './game';
import { initServiceWorker } from './serviceWorkerInit';
import './styles.scss';
document.addEventListener('DOMContentLoaded', (event) => {
    // @ts-ignore
    window.game = new Game();
    initServiceWorker();
});
