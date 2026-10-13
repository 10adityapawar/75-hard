// Runs after `expo export -p web`: turns dist/ into an installable home-screen app.
import { copyFileSync, readFileSync, writeFileSync } from 'node:fs';

const app = JSON.parse(readFileSync('app.json', 'utf8')).expo;
const base = app.experiments?.baseUrl ?? '';
const file = 'dist/index.html';
let html = readFileSync(file, 'utf8');

html = html.replace(
  /<meta name="viewport"[^>]*>/,
  '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />',
);

const head = `
    <link rel="manifest" href="${base}/manifest.webmanifest" />
    <link rel="apple-touch-icon" href="${base}/apple-touch-icon.png" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-title" content="75 Hard" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <style>html, body { background: #0B0B0D; }</style>
    <script>
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => navigator.serviceWorker.register('${base}/sw.js', { scope: '${base}/' }));
      }
    </script>
  `;
html = html.replace('</head>', `${head}</head>`);

writeFileSync(file, html);
// GitHub Pages serves 404.html for unknown paths, so deep links like /diet still load the app.
copyFileSync(file, 'dist/404.html');
writeFileSync('dist/.nojekyll', '');
console.log(`PWA files written (base path "${base}")`);
