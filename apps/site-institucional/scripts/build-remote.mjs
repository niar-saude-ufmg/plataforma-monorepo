import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const appDir = path.dirname(fileURLToPath(import.meta.url));
const buildDir = path.resolve(appDir, '../build');
const assetsDir = path.join(buildDir, 'assets');

await mkdir(assetsDir, { recursive: true });

const indexHtml = await readFile(path.join(buildDir, 'index.html'), 'utf8');
const startMatch = indexHtml.match(/import\(["'](\/[^"']*\/entry\/start\.[^"']+\.js)["']\)/);
const appMatch = indexHtml.match(/import\(["'](\/[^"']*\/entry\/app\.[^"']+\.js)["']\)/);

if (!startMatch || !appMatch) {
	throw new Error('Não foi possível localizar os entrypoints client do SvelteKit no build.');
}

const startPath = `..${startMatch[1]}`;
const appPath = `..${appMatch[1]}`;
const immutableDir = path.join(buildDir, '_app/immutable');
const immutableFiles = await readdir(immutableDir, { recursive: true });
let runtimeConfigMatch;

for (const file of immutableFiles) {
	if (!file.endsWith('.js')) continue;
	const source = await readFile(path.join(immutableDir, file), 'utf8');
	runtimeConfigMatch = source.match(/globalThis\.(__sveltekit_[A-Za-z0-9]+)\?\.base/);
	if (runtimeConfigMatch) break;
}

if (!runtimeConfigMatch) {
	throw new Error('Não foi possível localizar a configuração global do runtime SvelteKit.');
}

const runtimeConfig = runtimeConfigMatch[1];

await writeFile(
	path.join(assetsDir, 'institutional-mount.js'),
	`import { start } from '${startPath}';
import * as app from '${appPath}';

globalThis.${runtimeConfig} ??= { base: '', env: {} };

function routeKey(pathname) {
  const normalized = pathname.replace(/\\/$/, '') || '/';
  const withoutLocale = normalized.replace(/^\\/en(?=\\/|$)/, '') || '/';

  if (withoutLocale.startsWith('/news/')) return '/news/[slug]';
  return withoutLocale;
}

export function mountInstitutional(target) {
  const pageNodeIds = app.dictionary[routeKey(window.location.pathname)] ?? app.dictionary['/'];
  const node_ids = [0, ...pageNodeIds];

  return start(app, target, {
    node_ids,
    data: node_ids.map(() => null),
    form: null,
    error: null
  });
}

export default { mountInstitutional };
`
);

await writeFile(
	path.join(assetsDir, 'remoteEntry.js'),
	`const moduleMap = {
  './mount': async () => {
    const module = await import('./institutional-mount.js');
    return () => module;
  }
};

export function get(module) {
  if (!moduleMap[module]) throw new Error('Can not find remote module ' + module);
  return moduleMap[module]();
}

export function init() {}
`
);
