import { copyFile, mkdir } from 'node:fs/promises';

await mkdir('dist/tokens/styles', { recursive: true });
await copyFile('src/tokens/styles/tokens.css', 'dist/tokens/styles/tokens.css');
