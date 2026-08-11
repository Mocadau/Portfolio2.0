import { rm, readdir } from 'node:fs/promises';
import { join } from 'node:path';

await removeNamedFiles('dist', '.DS_Store');

await Promise.all([
  'Background',
  'Walking',
  'FinalIntro',
  'Laserpointer'
].map((directory) => removeFilesWithExtension(
  join('dist', 'portfolio-assets', directory),
  '.png'
)));

async function removeNamedFiles(root, fileName) {
  const entries = await readdir(root, { withFileTypes: true });

  await Promise.all(entries.map(async (entry) => {
    const entryPath = join(root, entry.name);
    if (entry.isDirectory()) {
      await removeNamedFiles(entryPath, fileName);
      return;
    }
    if (entry.name === fileName) {
      await rm(entryPath, { force: true });
    }
  }));
}

async function removeFilesWithExtension(root, extension) {
  const entries = await readdir(root, { withFileTypes: true });

  await Promise.all(entries.map(async (entry) => {
    if (!entry.isFile() || !entry.name.endsWith(extension)) {
      return;
    }

    await rm(join(root, entry.name), { force: true });
  }));
}
