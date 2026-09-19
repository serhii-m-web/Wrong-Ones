import { readFileSync } from 'fs';
import { basename, resolve } from 'path';
import Handlebars from 'handlebars';
import { defineConfig, loadEnv, normalizePath, type Plugin, type ViteDevServer } from 'vite';
import handlebars from 'vite-plugin-handlebars';
import { htmlFiles } from './getHTMLFileNames';
import {
  run as runWebpConversion,
  startWatch as startWebpWatch,
} from './scripts/convertToWebp';
import { pictureHelper } from './scripts/pictureHelper';

const input: Record<string, string> = {
  main: resolve(__dirname, 'src/index.html'),
};

htmlFiles.forEach((file) => {
  input[file.replace('.html', '')] = resolve(__dirname, 'src', file);
});

const webpPlugin = (): Plugin => ({
  name: 'webp-convert',
  async buildStart() {
    await runWebpConversion();
  },
  configureServer() {
    startWebpWatch();
  },
});

const isHandlebarsPartial = (file: string): boolean => {
  const normalizedPath = normalizePath(file);
  return (
    (normalizedPath.includes('/templates/') || normalizedPath.includes('/sections/')) &&
    /\.(html|hbs)$/i.test(normalizedPath)
  );
};

const reRegisterPartial = (file: string): void => {
  const partialName = basename(file).replace(/\.(html|hbs)$/i, '');
  const content = readFileSync(file, 'utf-8');
  Handlebars.registerPartial(partialName, content);
};

const invalidateHtmlModules = (server: ViteDevServer): void => {
  for (const [url, mod] of server.moduleGraph.urlToModuleMap.entries()) {
    if (
      mod &&
      (url === '/' || url.endsWith('.html') || (mod.id != null && /\.html$/i.test(mod.id)))
    ) {
      server.moduleGraph.invalidateModule(mod);
    }
  }

  for (const mod of server.moduleGraph.idToModuleMap.values()) {
    if (mod.id && /\.html$/i.test(mod.id)) {
      server.moduleGraph.invalidateModule(mod);
    }
  }
};

/**
 * vite-plugin-handlebars caches partials and its handleHotUpdate returns []
 * without invalidating HTML modules, so the browser reloads stale markup.
 */
const handlebarsReloadPlugin = (): Plugin => ({
  name: 'handlebars-reload',
  enforce: 'pre',
  configureServer(server: ViteDevServer) {
    const templatesDir = resolve(__dirname, 'src/templates');
    const sectionsDir = resolve(__dirname, 'src/sections');

    server.watcher.add([templatesDir, sectionsDir]);
  },
  handleHotUpdate({ file, server }) {
    if (!isHandlebarsPartial(file)) {
      return;
    }

    try {
      reRegisterPartial(file);
    } catch {
      // Ignore transient read errors while the editor is still writing the file.
    }

    invalidateHtmlModules(server);
    server.ws.send({ type: 'full-reload', path: '*' });
    return [];
  },
});

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const enableWebpConvert = env.VITE_WEBP_CONVERT !== 'false';

  return {
    base: './',
    root: 'src',
    publicDir: '../public',
    plugins: [
      handlebars({
        partialDirectory: [
          resolve(__dirname, 'src/templates'),
          resolve(__dirname, 'src/sections'),
        ],
        // Custom handlebars-reload plugin handles this more reliably on Windows.
        reloadOnPartialChange: false,
        helpers: {
          picture: pictureHelper,
          array: function (...args: unknown[]) {
            const items = args.slice(0, -1);
            return items;
          },
          object: function (...args: unknown[]) {
            const options = args[args.length - 1] as { hash?: Record<string, unknown> };
            return options.hash || {};
          },
        },
      }),
      handlebarsReloadPlugin(),
      ...(enableWebpConvert ? [webpPlugin()] : []),
    ],
    build: {
      rollupOptions: {
        input,
      },
      outDir: '../dist/',
      emptyOutDir: true,
    },
    server: {
      host: true,
      open: true,
    },
  };
});

