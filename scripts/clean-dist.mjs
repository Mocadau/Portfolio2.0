import { rm, readdir } from 'node:fs/promises';
import { join } from 'node:path';

await removeNamedFiles('dist', '.DS_Store');

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
