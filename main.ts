// Emberfall — Duel of the Four Winds. The entry program (Node 22,
// standard library only): it hands the game in by copying this
// repository's game/ and screenshots/ beside it into /output and writing
// /output/dossier.json with the vendored make.fun library, which the
// sealed scorer reads. No network, no installs, no build step — the
// game is plain static files, and so is this program.
//
// Run it locally with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'game'), join(outputDir, 'game'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

// The scorer's caps, from the kit's RULES.txt: keep the dossier's text
// under 160 KiB, at most 4 screenshots of 256 KiB each, and game/ under
// 993 files and 48 MiB, so the whole of /output stays inside its own
// 1,000-entry, 64 MiB cap.
writeFileSync(
  join(outputDir, 'dossier.json'),
  buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
