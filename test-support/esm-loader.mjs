import { access, stat } from 'node:fs/promises';
import { dirname, extname, join, resolve as resolvePath } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const loaderDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolvePath(loaderDir, '..');

const aliasMap = {
  '@asheville-music-chart/core': resolvePath(repoRoot, 'packages/core/dist/index.js'),
  '@asheville-music-chart/application': resolvePath(repoRoot, 'packages/application/dist/index.js'),
  '@asheville-music-chart/infrastructure': resolvePath(repoRoot, 'packages/infrastructure/dist/index.js'),
};

async function pathExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function resolveAsFileOrDirectory(candidatePath, context, defaultResolve) {
  if (await pathExists(`${candidatePath}.js`)) {
    return defaultResolve(pathToFileURL(`${candidatePath}.js`).href, context, defaultResolve);
  }

  try {
    const stats = await stat(candidatePath);
    if (stats.isDirectory()) {
      const indexPath = join(candidatePath, 'index.js');
      if (await pathExists(indexPath)) {
        return defaultResolve(pathToFileURL(indexPath).href, context, defaultResolve);
      }
    }
  } catch {
    // ignore missing directory
  }

  return null;
}

export async function resolve(specifier, context, defaultResolve) {
  const aliasTarget = aliasMap[specifier];
  if (aliasTarget && (await pathExists(aliasTarget))) {
    return defaultResolve(pathToFileURL(aliasTarget).href, context, defaultResolve);
  }

  if ((specifier.startsWith('./') || specifier.startsWith('../')) && context.parentURL) {
    const parentPath = fileURLToPath(context.parentURL);
    const candidatePath = resolvePath(dirname(parentPath), specifier);

    if (!extname(candidatePath)) {
      const resolved = await resolveAsFileOrDirectory(candidatePath, context, defaultResolve);
      if (resolved) {
        return resolved;
      }
    }
  }

  return defaultResolve(specifier, context, defaultResolve);
}
