import { copyFileSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoDir = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function copyTree(source: string, destination: string): number {
  mkdirSync(destination, { recursive: true });
  let count = 0;
  const entries = readdirSync(source, { withFileTypes: true })
    .sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
  for (const entry of entries) {
    const from = join(source, entry.name);
    const to = join(destination, entry.name);
    if (entry.isDirectory()) count += copyTree(from, to);
    else if (entry.isFile()) {
      copyFileSync(from, to);
      count++;
    }
  }
  return count;
}

mkdirSync(outDir, { recursive: true });
for (const entry of readdirSync(outDir).sort()) {
  rmSync(join(outDir, entry), { recursive: true, force: true });
}
const gameFiles = copyTree(join(repoDir, 'game'), join(outDir, 'game'));
const screenshotFiles = copyTree(join(repoDir, 'screenshots'), join(outDir, 'screenshots'));
writeFileSync(join(outDir, 'dossier.json'), buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
}));
console.log(`Copied ${gameFiles} game files and ${screenshotFiles} screenshot files.`);
