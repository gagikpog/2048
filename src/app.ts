import { Game } from './game';
import { initServiceWorker } from './serviceWorkerInit';
import './styles.scss';
// @ts-ignore
window.game = new Game();
initServiceWorker();
