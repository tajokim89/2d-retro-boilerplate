// 진입점. index.html 에서 type="module" 로 로드됨.
// 모든 부팅 로직은 game/App.ts 안에.

import { startApp } from './game/App';

const parent = document.getElementById('app');
if (!parent) {
  throw new Error('#app element not found in index.html');
}

startApp(parent).catch((err) => {
  console.error('App failed to start', err);
  parent.innerHTML = `<pre style="color:#f55;padding:24px;">App failed to start.\n${(err as Error)?.stack ?? err}</pre>`;
});
