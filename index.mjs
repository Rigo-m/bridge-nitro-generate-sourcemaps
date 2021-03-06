import { resolve, dirname, relative, join, extname } from 'pathe';
import consola from 'consola';
import * as rollup from 'rollup';
import fse from 'fs-extra';
import { promises, readFileSync, statSync, createWriteStream, existsSync } from 'fs';
import globby from 'globby';
import prettyBytes from 'pretty-bytes';
import { gzipSize } from 'gzip-size';
import chalk from 'chalk';
import { isTest, isDebug } from 'std-env';
import { fileURLToPath, pathToFileURL } from 'url';
import { createRequire } from 'module';
import defu from 'defu';
import { terser } from 'rollup-plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import alias from '@rollup/plugin-alias';
import json from '@rollup/plugin-json';
import replace from '@rollup/plugin-replace';
import virtual$1 from '@rollup/plugin-virtual';
import wasmPlugin from '@rollup/plugin-wasm';
import inject from '@rollup/plugin-inject';
import { visualizer } from 'rollup-plugin-visualizer';
import * as unenv from 'unenv';
import { sanitizeFilePath } from 'mlly';
import jiti from 'jiti';
import { mergeHooks, createHooks } from 'hookable';
import dotProp from 'dot-prop';
import { nodeFileTrace } from '@vercel/nft';
import createEtag from 'etag';
import mime from 'mime';
import hasha from 'hasha';
import table from 'table';
import isPrimitive from 'is-primitive';
import { transform } from 'esbuild';
import { createFilter } from '@rollup/pluginutils';
import { joinURL } from 'ufo';
import chokidar, { watch } from 'chokidar';
import { tryResolvePath } from '@nuxt/kit';
import archiver from 'archiver';
import { readPackageJSON } from 'pkg-types';
import { Worker } from 'worker_threads';
import { loading } from '@nuxt/design';
import debounce from 'p-debounce';
import { createError, createApp, useBase, promisifyHandle } from 'h3';
import httpProxy from 'http-proxy';
import { listen } from 'listhen';
import servePlaceholder from 'serve-placeholder';
import serveStatic from 'serve-static';
import connect from 'connect';

/** SOURCEMAP DEBUGGING */
const SM = false
function logMemory(key) {
const used = process.memoryUsage().heapUsed / 1024 / 1024;
console.log(`Using ${Math.round(used * 100) / 100} MB`, key);
}

async function printFSTree(dir) {
  if (isTest) {
    return;
  }
  const files = await globby("**/*.*", { cwd: dir });
  const items = (await Promise.all(files.map(async (file) => {
    const path = resolve(dir, file);
    const src = await promises.readFile(path);
    const size = src.byteLength;
    const gzip = await gzipSize(src);
    return { file, path, size, gzip };
  }))).sort((a, b) => b.path.localeCompare(a.path));
  let totalSize = 0;
  let totalGzip = 0;
  let totalNodeModulesSize = 0;
  let totalNodeModulesGzip = 0;
  items.forEach((item, index) => {
    dirname(item.file);
    const rpath = relative(process.cwd(), item.path);
    const treeChar = index === items.length - 1 ? "\u2514\u2500" : "\u251C\u2500";
    const isNodeModules = item.file.includes("node_modules");
    if (isNodeModules) {
      totalNodeModulesSize += item.size;
      totalNodeModulesGzip += item.gzip;
      return;
    }
    process.stdout.write(chalk.gray(`  ${treeChar} ${rpath} (${prettyBytes(item.size)}) (${prettyBytes(item.gzip)} gzip)
`));
    totalSize += item.size;
    totalGzip += item.gzip;
  });
  process.stdout.write(`${chalk.cyan("\u03A3 Total size:")} ${prettyBytes(totalSize + totalNodeModulesSize)} (${prettyBytes(totalGzip + totalNodeModulesGzip)} gzip)
`);
}

function hl(str) {
  return chalk.cyan(str);
}
function prettyPath(p, highlight = true) {
  p = relative(process.cwd(), p);
  return highlight ? hl(p) : p;
}
function compileTemplate(contents) {
  return (params) => contents.replace(/{{ ?([\w.]+) ?}}/g, (_, match) => {
    const val = dotProp.get(params, match);
    if (!val) {
      consola.warn(`cannot resolve template param '${match}' in ${contents.substr(0, 20)}`);
    }
    return val || `${match}`;
  });
}
function serializeTemplate(contents) {
  return `(params) => \`${contents.replace(/{{ (\w+) }}/g, "${params.$1}")}\``;
}
function jitiImport(dir, path) {
  return jiti(dir, { interopDefault: true })(path);
}
function tryImport(dir, path) {
  try {
    return jitiImport(dir, path);
  } catch (_err) {
  }
}
async function writeFile(file, contents, log = false) {
  await fse.mkdirp(dirname(file));
  await fse.writeFile(file, contents, "utf-8");
  if (log) {
    consola.info("Generated", prettyPath(file));
  }
}
function resolvePath(nitroContext, path, resolveBase = "") {
  if (typeof path === "function") {
    path = path(nitroContext);
  }
  if (typeof path !== "string") {
    throw new TypeError("Invalid path: " + path);
  }
  path = compileTemplate(path)(nitroContext);
  return resolve(resolveBase, path);
}
function detectTarget() {
  if (process.env.NETLIFY || process.env.NETLIFY_LOCAL) {
    return "netlify";
  }
  if (process.env.NOW_BUILDER) {
    return "vercel";
  }
  if (process.env.INPUT_AZURE_STATIC_WEB_APPS_API_TOKEN) {
    return "azure";
  }
}
async function isDirectory(path) {
  try {
    return (await fse.stat(path)).isDirectory();
  } catch (_err) {
    return false;
  }
}
function extendPreset(base, preset) {
  return (config) => {
    if (typeof preset === "function") {
      preset = preset(config);
    }
    if (typeof base === "function") {
      base = base(config);
    }
    return defu({
      hooks: mergeHooks(base.hooks, preset.hooks)
    }, preset, base);
  };
}
createRequire(import.meta.url);
function serializeImportName(id) {
  return "_" + id.replace(/[^a-zA-Z0-9_$]/g, "_");
}
function readDirRecursively(dir) {
  return fse.readdirSync(dir).reduce((files, file) => {
    const name = join(dir, file);
    const isDirectory2 = fse.statSync(name).isDirectory();
    return isDirectory2 ? [...files, ...readDirRecursively(name)] : [...files, name];
  }, []);
}

const distDir = dirname(fileURLToPath(import.meta.url));
const pkgDir = resolve(distDir, "..");
const runtimeDir = resolve(distDir, "runtime");

const PLUGIN_NAME = "dynamic-require";
const HELPER_DYNAMIC = `\0${PLUGIN_NAME}.mjs`;
const DYNAMIC_REQUIRE_RE = /import\("\.\/" ?\+(.*)\).then/g;
function dynamicRequire({ dir, ignore, inline }) {
  return {
    name: PLUGIN_NAME,
    transform(code, _id) {
      return {
        code: code.replace(DYNAMIC_REQUIRE_RE, `import('${HELPER_DYNAMIC}').then(r => r.default || r).then(dynamicRequire => dynamicRequire($1)).then`),
        map: null
      };
    },
    resolveId(id) {
      return id === HELPER_DYNAMIC ? id : null;
    },
    async load(_id) {
      if (_id !== HELPER_DYNAMIC) {
        return null;
      }
      let files = [];
      try {
        const wpManifest = resolve(dir, "./server.manifest.json");
        files = await import(pathToFileURL(wpManifest).href).then((r) => Object.keys(r.files).filter((file) => !ignore.includes(file)));
      } catch {
        files = await globby("**/*.{cjs,mjs,js}", { cwd: dir, absolute: false, ignore });
      }
      const chunks = (await Promise.all(files.map(async (id) => ({
        id,
        src: resolve(dir, id).replace(/\\/g, "/"),
        name: serializeImportName(id),
        meta: await getWebpackChunkMeta(resolve(dir, id))
      })))).filter((chunk) => chunk.meta);
      return inline ? TMPL_INLINE({ chunks }) : TMPL_LAZY({ chunks });
    }
  };
}
async function getWebpackChunkMeta(src) {
  const chunk = await import(pathToFileURL(src).href).then((r) => r.default || r || {});
  const { id, ids, modules } = chunk;
  if (!id && !ids) {
    return null;
  }
  return {
    id,
    ids,
    moduleIds: Object.keys(modules || {})
  };
}
function TMPL_INLINE({ chunks }) {
  return `${chunks.map((i) => `import * as ${i.name} from '${i.src}'`).join("\n")}
const dynamicChunks = {
  ${chunks.map((i) => ` ['${i.id}']: ${i.name}`).join(",\n")}
};

export default function dynamicRequire(id) {
  return Promise.resolve(dynamicChunks[id]);
};`;
}
function TMPL_LAZY({ chunks }) {
  return `
const dynamicChunks = {
${chunks.map((i) => ` ['${i.id}']: () => import('${i.src}')`).join(",\n")}
};

export default function dynamicRequire(id) {
  return dynamicChunks[id]();
};`;
}

function externals(opts) {
  const trackedExternals = /* @__PURE__ */ new Set();
  return {
    name: "node-externals",
    async resolveId(id, importer, options) {
      if (!id || id.startsWith("\0") || id.includes("?") || id.startsWith("#")) {
        return null;
      }
      const originalId = id;
      if (process.platform === "win32") {
        if (id.startsWith("/")) {
          id = resolve(id);
        }
        id = id.replace(/\\/g, "/");
      }
      const _id = id.split("node_modules/").pop();
      if (!opts.external.find((i) => _id.startsWith(i) || id.startsWith(i))) {
        if (_id.startsWith(".") || opts.inline.find((i) => _id.startsWith(i) || id.startsWith(i))) {
          return null;
        }
        if (/\.(ts|wasm|json)$/.test(_id)) {
          return null;
        }
      }
      if (opts.trace !== false) {
        const resolved = await this.resolve(originalId, importer, { ...options, skipSelf: true });
        if (!resolved) {
          console.warn(`Could not resolve \`${originalId}\`. Have you installed it?`);
        } else {
          trackedExternals.add(resolved.id);
        }
      }
      return {
        id: _id,
        external: true
      };
    },
    async buildEnd() {
      if (opts.trace !== false) {
        const tracedFiles = await nodeFileTrace(Array.from(trackedExternals), opts.traceOptions).then((r) => Array.from(r.fileList).map((f) => resolve(opts.traceOptions.base, f))).then((r) => r.filter((file) => file.includes("node_modules")));
        const pkgs = /* @__PURE__ */ new Set();
        for (const file of tracedFiles) {
          const [, baseDir, pkgName, _importPath] = /^(.+\/node_modules\/)([^@/]+|@[^/]+\/[^/]+)(\/?.*?)?$/.exec(file);
          pkgs.add(resolve(baseDir, pkgName, "package.json"));
        }
        for (const pkg of pkgs) {
          if (!tracedFiles.includes(pkg)) {
            tracedFiles.push(pkg);
          }
        }
        const writeFile = async (file) => {
          if (!await isFile(file)) {
            return;
          }
          const src = resolve(opts.traceOptions.base, file);
          const dst = resolve(opts.outDir, "node_modules", file.replace(/^.*?node_modules[\\/](.*)$/, "$1"));
          await promises.mkdir(dirname(dst), { recursive: true });
          await promises.copyFile(src, dst);
        };
        if (process.platform === "win32") {
          for (const file of tracedFiles) {
            await writeFile(file);
          }
        } else {
          await Promise.all(tracedFiles.map(writeFile));
        }
      }
    }
  };
}
async function isFile(file) {
  try {
    const stat = await promises.stat(file);
    return stat.isFile();
  } catch (err) {
    if (err.code === "ENOENT") {
      return false;
    }
    throw err;
  }
}

const TIMING = "globalThis.__timing__";
const iife = (code) => `(function() { ${code.trim()} })();`.replace(/\n/g, "");
const HELPER = iife(`
const start = () => Date.now();
const end = s => Date.now() - s;
const _s = {};
const metrics = [];
const logStart = id => { _s[id] = Date.now(); };
const logEnd = id => { const t = end(_s[id]); delete _s[id]; metrics.push([id, t]); console.debug('>', id + ' (' + t + 'ms)'); };
${TIMING} = { start, end, metrics, logStart, logEnd };
`);
function timing(_opts = {}) {
  return {
    name: "timing",
    renderChunk(code, chunk) {
      let name = chunk.fileName || "";
      name = name.replace(extname(name), "");
      const logName = name === "index" ? "Cold Start" : "Load " + name;
      return {
        code: (chunk.isEntry ? HELPER : "") + `${TIMING}.logStart('${logName}');` + code + `;${TIMING}.logEnd('${logName}');`,
        map: null
      };
    }
  };
}

function staticAssets(context) {
  const assets = {};
  const files = globby.sync("**/*.*", { cwd: context.output.publicDir, absolute: false });
  for (const id of files) {
    let type = mime.getType(id) || "text/plain";
    if (type.startsWith("text")) {
      type += "; charset=utf-8";
    }
    const fullPath = resolve(context.output.publicDir, id);
    const etag = createEtag(readFileSync(fullPath));
    const stat = statSync(fullPath);
    assets["/" + id] = {
      type,
      etag,
      mtime: stat.mtime.toJSON(),
      path: relative(context.output.serverDir, fullPath)
    };
  }
  return virtual$1({
    "#static-assets": `export default ${JSON.stringify(assets, null, 2)};`,
    "#static": `
import { promises } from 'fs'
import { resolve } from 'pathe'
import { dirname } from 'pathe'
import { fileURLToPath } from 'url'
import assets from '#static-assets'

const mainDir = dirname(fileURLToPath(globalThis.entryURL))

export function readAsset (id) {
  return promises.readFile(resolve(mainDir, getAsset(id).path))
}

export function getAsset (id) {
  return assets[id]
}
`
  });
}
function dirnames() {
  return {
    name: "dirnames",
    renderChunk(code, chunk) {
      return {
        code: (chunk.isEntry ? "globalThis.entryURL = import.meta.url;" : "") + code,
        map: null
      };
    }
  };
}

const PREFIX = "\0virtual:";
function virtual(modules) {
  const _modules = /* @__PURE__ */ new Map();
  for (const [id, mod] of Object.entries(modules)) {
    _modules.set(id, mod);
    _modules.set(resolve(id), mod);
  }
  return {
    name: "virtual",
    resolveId(id, importer) {
      if (id in modules) {
        return PREFIX + id;
      }
      if (importer) {
        const importerNoPrefix = importer.startsWith(PREFIX) ? importer.slice(PREFIX.length) : importer;
        const resolved = resolve(dirname(importerNoPrefix), id);
        if (_modules.has(resolved)) {
          return PREFIX + resolved;
        }
      }
      return null;
    },
    async load(id) {
      if (!id.startsWith(PREFIX)) {
        return null;
      }
      const idNoPrefix = id.slice(PREFIX.length);
      if (!_modules.has(idNoPrefix)) {
        return null;
      }
      let m = _modules.get(idNoPrefix);
      if (typeof m !== "string" && typeof m.load === "function") {
        m = await m.load();
      }
      return {
        code: m,
        map: null
      };
    }
  };
}

function assets(opts) {
  if (!opts.inline) {
    return virtual({ "#assets": getAssetsDev(opts.dirs) });
  }
  return virtual({
    "#assets": {
      async load() {
        const assets2 = {};
        for (const assetdir in opts.dirs) {
          const dirOpts = opts.dirs[assetdir];
          const files = globby.sync("**/*.*", { cwd: dirOpts.dir, absolute: false });
          for (const _id of files) {
            const fsPath = resolve(dirOpts.dir, _id);
            const id = assetdir + "/" + _id;
            assets2[id] = { fsPath, meta: {} };
            if (dirOpts.meta) {
              let type = mime.getType(id) || "text/plain";
              if (type.startsWith("text")) {
                type += "; charset=utf-8";
              }
              const etag = createEtag(await promises.readFile(fsPath));
              const mtime = await promises.stat(fsPath).then((s) => s.mtime.toJSON());
              assets2[id].meta = { type, etag, mtime };
            }
          }
        }
        return getAssetProd(assets2);
      }
    }
  });
}
function getAssetsDev(dirs) {
  return `
import { createStorage } from 'unstorage'
import fsDriver from 'unstorage/drivers/fs'

const dirs = ${JSON.stringify(dirs)}

export const assets = createStorage()

for (const [dirname, dirOpts] of Object.entries(dirs)) {
  assets.mount(dirname, fsDriver({ base: dirOpts.dir }))
}
  `;
}
function normalizeKey(key) {
  return key.replace(/[/\\]/g, ":").replace(/^:|:$/g, "");
}
function getAssetProd(assets2) {
  return `
const _assets = {
${Object.entries(assets2).map(([id, asset]) => `  ['${normalizeKey(id)}']: {
    import: () => import('${asset.fsPath}').then(r => r.default || r),
    meta: ${JSON.stringify(asset.meta)}
  }`).join(",\n")}
}

${normalizeKey.toString()}

export const assets = {
  getKeys() {
    return Object.keys(_assets)
  },
  hasItem (id) {
    id = normalizeKey(id)
    return id in _assets
  },
  getItem (id) {
    id = normalizeKey(id)
    return _assets[id] ? _assets[id].import() : null
  },
  getMeta (id) {
    id = normalizeKey(id)
    return _assets[id] ? _assets[id].meta : {}
  }
}
`;
}

const unique = (arr) => Array.from(new Set(arr));
function middleware(getMiddleware) {
  const getImportId = (p) => "_" + hasha(p).substr(0, 6);
  let lastDump = "";
  return virtual({
    "#server-middleware": {
      load: () => {
        const middleware2 = getMiddleware();
        if (isDebug) {
          const dumped = dumpMiddleware(middleware2);
          if (dumped !== lastDump) {
            lastDump = dumped;
            if (middleware2.length) {
              console.log(dumped);
            }
          }
        }
        const imports = unique(middleware2.filter((m) => m.lazy === false).map((m) => m.handle));
        const lazyImports = unique(middleware2.filter((m) => m.lazy !== false && !imports.includes(m.handle)).map((m) => m.handle));
        return `
  ${imports.map((handle) => `import ${getImportId(handle)} from '${handle}';`).join("\n")}

  ${lazyImports.map((handle) => `const ${getImportId(handle)} = () => import('${handle}');`).join("\n")}

  const middleware = [
    ${middleware2.map((m) => `{ route: '${m.route}', handle: ${getImportId(m.handle)}, lazy: ${m.lazy || true}, promisify: ${m.promisify !== void 0 ? m.promisify : true} }`).join(",\n")}
  ];

  export default middleware
  `;
      }
    }
  });
}
function dumpMiddleware(middleware2) {
  const data = middleware2.map(({ route, handle, ...props }) => {
    return [
      route && route !== "/" ? route : "*",
      relative(process.cwd(), handle),
      dumpObject(props)
    ];
  });
  return table.table([
    ["Route", "Handle", "Options"],
    ...data
  ], {
    singleLine: true,
    border: table.getBorderCharacters("norc")
  });
}
function dumpObject(obj) {
  const items = [];
  for (const key in obj) {
    const val = obj[key];
    items.push(`${key}: ${isPrimitive(val) ? val : JSON.stringify(val)}`);
  }
  return items.join(", ");
}

const defaultLoaders = {
  ".ts": "ts",
  ".js": "js"
};
function esbuild(options = {}) {
  let target;
  const loaders = {
    ...defaultLoaders
  };
  if (options.loaders) {
    for (const key of Object.keys(options.loaders)) {
      const value = options.loaders[key];
      if (typeof value === "string") {
        loaders[key] = value;
      } else if (value === false) {
        delete loaders[key];
      }
    }
  }
  const extensions = Object.keys(loaders);
  const INCLUDE_REGEXP = new RegExp(`\\.(${extensions.map((ext) => ext.slice(1)).join("|")})$`);
  const EXCLUDE_REGEXP = /node_modules/;
  const filter = createFilter(options.include || INCLUDE_REGEXP, options.exclude || EXCLUDE_REGEXP);
  return {
    name: "esbuild",
    async transform(code, id) {
      if (!filter(id)) {
        return null;
      }
      const ext = extname(id);
      const loader = loaders[ext];
      if (!loader) {
        return null;
      }
      target = options.target || "node12";
      const result = await transform(code, {
        loader,
        target,
        define: options.define,
        sourcemap: options.sourceMap !== false,
        sourcefile: id
      });
      printWarnings(id, result, this);
      return result.code && {
        code: result.code,
        map: result.map || null
      };
    },
    async renderChunk(code) {
      if (options.minify) {
        const result = await transform(code, {
          loader: "js",
          minify: true,
          target
        });
        if (result.code) {
          return {
            code: result.code,
            map: result.map || null
          };
        }
      }
      return null;
    }
  };
}
function printWarnings(id, result, plugin) {
  if (result.warnings) {
    for (const warning of result.warnings) {
      let message = "[esbuild]";
      if (warning.location) {
        message += ` (${relative(process.cwd(), id)}:${warning.location.line}:${warning.location.column})`;
      }
      message += ` ${warning.text}`;
      plugin.warn(message);
    }
  }
}

function raw(opts = {}) {
  const extensions = new Set([".md", ".mdx", ".yml", ".txt", ".css", ".htm", ".html"].concat(opts.extensions || []));
  return {
    name: "raw",
    transform(code, id) {
      if (id[0] !== "\0" && extensions.has(extname(id))) {
        return {
          code: `// ${id}
export default ${JSON.stringify(code)}`,
          map: null
        };
      }
    }
  };
}

const drivers = {
  fs: "unstorage/drivers/fs",
  http: "unstorage/drivers/http",
  memory: "unstorage/drivers/memory"
};
function storage(opts) {
  const mounts = [];
  for (const path in opts.mounts) {
    const mount = opts.mounts[path];
    mounts.push({
      path,
      driver: drivers[mount.driver] || mount.driver,
      opts: mount.driverOptions || {}
    });
  }
  const driverImports = Array.from(new Set(mounts.map((m) => m.driver)));
  return virtual$1({
    "#storage": `
import { createStorage } from 'unstorage'
import { assets } from '#assets'

${driverImports.map((i) => `import ${serializeImportName(i)} from '${i}'`).join("\n")}

export const storage = createStorage({})

storage.mount('/assets', assets)

${mounts.map((m) => `storage.mount('${m.path}', ${serializeImportName(m.driver)}(${JSON.stringify(m.opts)}))`).join("\n")}
`
  });
}

const getRollupConfig = (nitroContext) => {
  const extensions = [".ts", ".mjs", ".js", ".json", ".node"];
  const nodePreset = nitroContext.node === false ? unenv.nodeless : unenv.node;
  const builtinPreset = {
    alias: {
      debug: "unenv/runtime/npm/debug",
      consola: "unenv/runtime/npm/consola",
      encoding: "unenv/runtime/mock/proxy",
      he: "unenv/runtime/mock/proxy",
      resolve: "unenv/runtime/mock/proxy",
      "source-map": "unenv/runtime/mock/proxy",
      "lodash.template": "unenv/runtime/mock/proxy",
      "serialize-javascript": "unenv/runtime/mock/proxy",
      "estree-walker": "unenv/runtime/mock/proxy",
      "@babel/parser": "unenv/runtime/mock/proxy",
      "@vue/compiler-core": "unenv/runtime/mock/proxy",
      "@vue/compiler-dom": "unenv/runtime/mock/proxy",
      "@vue/compiler-ssr": "unenv/runtime/mock/proxy",
      ...nitroContext.alias
    }
  };
  const env = unenv.env(nodePreset, builtinPreset, nitroContext.env);
  if (nitroContext.sourceMap) {
    env.polyfill.push("source-map-support/register.js");
  }
  const _require = createRequire(import.meta.url);
  if (nitroContext._nuxt.majorVersion === 3) {
    env.alias["vue/server-renderer"] = "vue/server-renderer";
    env.alias["vue/compiler-sfc"] = "vue/compiler-sfc";
    env.alias.vue = _require.resolve(`vue/dist/vue.cjs${nitroContext._nuxt.dev ? "" : ".prod"}.js`);
  }
  const buildServerDir = join(nitroContext._nuxt.buildDir, "dist/server");
  const runtimeAppDir = join(nitroContext._internal.runtimeDir, "app");
  const rollupConfig = {
    input: resolvePath(nitroContext, nitroContext.entry),
    output: {
      dir: nitroContext.output.serverDir,
      entryFileNames: "index.mjs",
      chunkFileNames(chunkInfo) {
        let prefix = "";
        const modules = Object.keys(chunkInfo.modules);
        const lastModule = modules[modules.length - 1];
        if (lastModule.startsWith(buildServerDir)) {
          prefix = join("app", relative(buildServerDir, dirname(lastModule)));
        } else if (lastModule.startsWith(runtimeAppDir)) {
          prefix = "app";
        } else if (lastModule.startsWith(nitroContext._nuxt.buildDir)) {
          prefix = "nuxt";
        } else if (lastModule.startsWith(nitroContext._internal.runtimeDir)) {
          prefix = "nitro";
        } else if (nitroContext.middleware.find((m) => lastModule.startsWith(m.handle))) {
          prefix = "middleware";
        } else if (lastModule.includes("assets")) {
          prefix = "assets";
        }
        return join("chunks", prefix, "[name].mjs");
      },
      inlineDynamicImports: nitroContext.inlineDynamicImports,
      format: "esm",
      exports: "auto",
      intro: "",
      outro: "",
      preferConst: true,
      sanitizeFileName: sanitizeFilePath,
      sourcemap: nitroContext.sourceMap,
      sourcemapExcludeSources: true,
      sourcemapPathTransform(relativePath, sourcemapPath) {
        return resolve(dirname(sourcemapPath), relativePath);
      }
    },
    external: env.external,
    makeAbsoluteExternalsRelative: false,
    plugins: [],
    onwarn(warning, rollupWarn) {
      if (!["CIRCULAR_DEPENDENCY", "EVAL"].includes(warning.code) && !warning.message.includes("Unsupported source map comment")) {
        rollupWarn(warning);
      }
    },
    treeshake: {
      moduleSideEffects(id) {
        return nitroContext.moduleSideEffects.some((match) => id.startsWith(match));
      }
    }
  };
  if (nitroContext.timing) {
    rollupConfig.plugins.push(timing());
  }
  rollupConfig.plugins.push(raw());
  if (nitroContext.experiments.wasm) {
    rollupConfig.plugins.push(wasmPlugin());
  }
  rollupConfig.plugins.push(replace({
    sourceMap: SM,
    preventAssignment: true,
    values: {
      "process.env.NODE_ENV": nitroContext._nuxt.dev ? '"development"' : '"production"',
      "typeof window": '"undefined"',
      "global.": "globalThis.",
      "process.server": "true",
      "process.client": "false",
      "process.env.NUXT_NO_SSR": JSON.stringify(!nitroContext._nuxt.ssr),
      "process.env.ROUTER_BASE": JSON.stringify(nitroContext._nuxt.routerBase),
      "process.env.PUBLIC_PATH": JSON.stringify(nitroContext._nuxt.publicPath),
      "process.env.NUXT_STATIC_BASE": JSON.stringify(nitroContext._nuxt.staticAssets.base),
      "process.env.NUXT_STATIC_VERSION": JSON.stringify(nitroContext._nuxt.staticAssets.version),
      "process.env.NUXT_FULL_STATIC": nitroContext._nuxt.fullStatic,
      "process.env.NITRO_PRESET": JSON.stringify(nitroContext.preset),
      "process.env.RUNTIME_CONFIG": JSON.stringify(nitroContext._nuxt.runtimeConfig),
      "process.env.DEBUG": JSON.stringify(nitroContext._nuxt.dev)
    }
  }));
  rollupConfig.plugins.push(esbuild({
    target: "es2019",
    sourceMap: true,
    ...nitroContext.esbuild?.options
  }));
  rollupConfig.plugins.push(dynamicRequire({
    dir: resolve(nitroContext._nuxt.buildDir, "dist/server"),
    inline: nitroContext.node === false || nitroContext.inlineDynamicImports,
    ignore: [
      "client.manifest.mjs",
      "server.js",
      "server.cjs",
      "server.mjs",
      "server.manifest.mjs"
    ]
  }));
  rollupConfig.plugins.push(assets(nitroContext.assets));
  if (nitroContext.serveStatic) {
    rollupConfig.plugins.push(dirnames());
    rollupConfig.plugins.push(staticAssets(nitroContext));
  }
  rollupConfig.plugins.push(storage(nitroContext.storage));
  rollupConfig.plugins.push(middleware(() => {
    const _middleware = [
      ...nitroContext.scannedMiddleware,
      ...nitroContext.middleware
    ];
    if (nitroContext.serveStatic) {
      _middleware.unshift({ route: "/", handle: "#nitro/server/static" });
    }
    return _middleware;
  }));
  rollupConfig.plugins.push(virtual$1({
    "#polyfill": env.polyfill.map((p) => `import '${p}';`).join("\n")
  }));
  const renderer = nitroContext.renderer || (nitroContext._nuxt.majorVersion === 3 ? "vue3" : "vue2");
  const vue2ServerRenderer = "vue-server-renderer/" + (nitroContext._nuxt.dev ? "build.dev.js" : "build.prod.js");
  rollupConfig.plugins.push(alias({
    entries: {
      "#nitro": nitroContext._internal.runtimeDir,
      "#nitro-renderer": resolve(nitroContext._internal.runtimeDir, "app", renderer),
      "#config": resolve(nitroContext._internal.runtimeDir, "app/config"),
      "#nitro-vue-renderer": vue2ServerRenderer,
      "#build": nitroContext._nuxt.dev && process.platform === "win32" ? pathToFileURL(nitroContext._nuxt.buildDir).href : nitroContext._nuxt.buildDir,
      "~": nitroContext._nuxt.srcDir,
      "@/": nitroContext._nuxt.srcDir,
      "~~": nitroContext._nuxt.rootDir,
      "@@/": nitroContext._nuxt.rootDir,
      ...env.alias
    }
  }));
  const moduleDirectories = [
    resolve(nitroContext._nuxt.rootDir, "node_modules"),
    ...nitroContext._nuxt.modulesDir,
    resolve(pkgDir, "../node_modules"),
    "node_modules"
  ];
  if (nitroContext.externals) {
    rollupConfig.plugins.push(externals(defu(nitroContext.externals, {
      outDir: nitroContext.output.serverDir,
      moduleDirectories,
      external: [
        ...nitroContext._nuxt.dev ? [nitroContext._nuxt.buildDir] : []
      ],
      inline: [
        "#",
        "~",
        "@/",
        "~~",
        "@@/",
        "virtual:",
        nitroContext._internal.runtimeDir,
        nitroContext._nuxt.srcDir,
        nitroContext._nuxt.rootDir,
        nitroContext._nuxt.serverDir,
        ...nitroContext.middleware.map((m) => m.handle),
        ...nitroContext._nuxt.dev ? [] : ["vue", "@vue/", "@nuxt/"]
      ],
      traceOptions: {
        base: "/",
        processCwd: nitroContext._nuxt.rootDir,
        exportsOnly: true
      }
    })));
  }
  rollupConfig.plugins.push(nodeResolve({
    extensions,
    preferBuiltins: true,
    rootDir: nitroContext._nuxt.rootDir,
    moduleDirectories,
    mainFields: ["main"],
    exportConditions: [
      "default",
      "module",
      "node",
      "import"
    ]
  }));
  rollupConfig.plugins.push(commonjs({
    sourceMap: SM,
    esmExternals: (id) => !id.startsWith("unenv/"),
    requireReturnsDefault: "auto"
  }));
  rollupConfig.plugins.push(json());
  rollupConfig.plugins.push(inject({...env.inject, sourceMap: SM }));
  if (nitroContext.minify) {
    rollupConfig.plugins.push(terser({
      mangle: {
        keep_fnames: true,
        keep_classnames: true
      },
      format: {
        comments: false
      }
    }));
  }
  if (nitroContext.analyze) {
    rollupConfig.plugins.push(visualizer({
      ...nitroContext.analyze,
      filename: nitroContext.analyze.filename.replace("{name}", "nitro"),
      title: "Nitro Server bundle stats"
    }));
  }
  return rollupConfig;
};

function filesToMiddleware(files, baseDir, basePath, overrides) {
  return files.map((file) => {
    const route = joinURL(basePath, file.substr(0, file.length - extname(file).length).replace(/\/index$/, ""));
    const handle = resolve(baseDir, file);
    return {
      route,
      handle
    };
  }).sort((a, b) => b.route.localeCompare(a.route)).map((m) => ({ ...m, ...overrides }));
}
function scanMiddleware(serverDir, onChange) {
  const pattern = "**/*.{ts,mjs,js,cjs}";
  const globalDir = resolve(serverDir, "middleware");
  const apiDir = resolve(serverDir, "api");
  const scan = async () => {
    const globalFiles = await globby(pattern, { cwd: globalDir });
    const apiFiles = await globby(pattern, { cwd: apiDir });
    return [
      ...filesToMiddleware(globalFiles, globalDir, "/", { route: "/" }),
      ...filesToMiddleware(apiFiles, apiDir, "/api", { lazy: true })
    ];
  };
  if (typeof onChange === "function") {
    const watcher = watch([
      join(globalDir, pattern),
      join(apiDir, pattern)
    ], { ignoreInitial: true });
    watcher.on("all", async (event, file) => {
      onChange(await scan(), event, file);
    });
  }
  return scan();
}
function resolveMiddleware(nuxt) {
  const middleware = [];
  const legacyMiddleware = [];
  for (let m of nuxt.options.serverMiddleware) {
    if (typeof m === "string") {
      m = { handler: m };
    }
    const route = m.path || m.route || "/";
    const handle = m.handler || m.handle;
    if (typeof handle !== "string" || typeof route !== "string") {
      legacyMiddleware.push(m);
    } else {
      delete m.handler;
      delete m.path;
      middleware.push({
        ...m,
        handle: tryResolvePath(handle, {
          extensions: [".ts", ".mjs", ".js", ".cjs"],
          alias: nuxt.options.alias,
          base: nuxt.options.srcDir
        }),
        route
      });
    }
  }
  return {
    middleware,
    legacyMiddleware
  };
}

async function prepare(nitroContext) {
  consola.info(`Nitro preset is ${hl(nitroContext.preset)}`);
  await cleanupDir(nitroContext.output.dir);
  if (!nitroContext.output.publicDir.startsWith(nitroContext.output.dir)) {
    await cleanupDir(nitroContext.output.publicDir);
  }
  if (!nitroContext.output.serverDir.startsWith(nitroContext.output.dir)) {
    await cleanupDir(nitroContext.output.serverDir);
  }
}
async function cleanupDir(dir) {
  consola.info("Cleaning up", prettyPath(dir));
  await fse.emptyDir(dir);
}
async function generate(nitroContext) {
  consola.start("Generating public...");
  const publicDir = nitroContext._nuxt.publicDir;
  let publicFiles = [];
  if (await isDirectory(publicDir)) {
    publicFiles = readDirRecursively(publicDir).map((r) => r.replace(publicDir, ""));
    await fse.copy(publicDir, nitroContext.output.publicDir);
  }
  const clientDist = resolve(nitroContext._nuxt.buildDir, "dist/client");
  if (await isDirectory(clientDist)) {
    await fse.copy(clientDist, join(nitroContext.output.publicDir, nitroContext._nuxt.publicPath), {
      filter: (src) => !publicFiles.includes(src.replace(clientDist, ""))
    });
  }
  consola.success("Generated public " + prettyPath(nitroContext.output.publicDir));
}
async function build(nitroContext) {
  const htmlSrc = resolve(nitroContext._nuxt.buildDir, `views/${{ 2: "app", 3: "document" }[2]}.template.html`);
  const htmlTemplate = { src: htmlSrc, contents: "", dst: "" };
  htmlTemplate.dst = htmlTemplate.src.replace(/.html$/, ".mjs").replace("app.template.mjs", "document.template.mjs");
  htmlTemplate.contents = nitroContext.vfs[htmlTemplate.src] || await fse.readFile(htmlTemplate.src, "utf-8");
  await nitroContext._internal.hooks.callHook("nitro:document", htmlTemplate);
  const compiled = "export default " + serializeTemplate(htmlTemplate.contents);
  await writeFile(htmlTemplate.dst, compiled);
  nitroContext.rollupConfig = getRollupConfig(nitroContext);
  await nitroContext._internal.hooks.callHook("nitro:rollup:before", nitroContext);
  return nitroContext._nuxt.dev ? _watch(nitroContext) : _build(nitroContext);
}
async function writeTypes(nitroContext) {
  const routeTypes = {};
  const middleware = [
    ...nitroContext.scannedMiddleware,
    ...nitroContext.middleware
  ];
  for (const mw of middleware) {
    if (typeof mw.handle !== "string") {
      continue;
    }
    const relativePath = relative(nitroContext._nuxt.buildDir, mw.handle).replace(/\.[a-z]+$/, "");
    routeTypes[mw.route] = routeTypes[mw.route] || [];
    routeTypes[mw.route].push(`Awaited<ReturnType<typeof import('${relativePath}').default>>`);
  }
  const lines = [
    "// Generated by nitro",
    "declare module '@nuxt/nitro' {",
    "  type Awaited<T> = T extends PromiseLike<infer U> ? Awaited<U> : T",
    "  interface InternalApi {",
    ...Object.entries(routeTypes).map(([path, types]) => `    '${path}': ${types.join(" | ")}`),
    "  }",
    "}",
    "export {}"
  ];
  await writeFile(join(nitroContext._nuxt.buildDir, "nitro.d.ts"), lines.join("\n"));
}
async function _build(nitroContext) {
  nitroContext.scannedMiddleware = await scanMiddleware(nitroContext._nuxt.serverDir);
  await writeTypes(nitroContext);
  consola.start("Building server...");
  logMemory('before')
  const build2 = await rollup.rollup(nitroContext.rollupConfig).catch((error) => {
    consola.error("Rollup error: " + error.message);
    throw error;
  });
  logMemory('after rollupping')
  consola.start("Writing server bundle...");
  await build2.write(nitroContext.rollupConfig.output);
  logMemory('after writing bundle')
  consola.success("Server built");
  await printFSTree(nitroContext.output.serverDir);
  await nitroContext._internal.hooks.callHook("nitro:compiled", nitroContext);
  return {
    entry: resolve(nitroContext.rollupConfig.output.dir, nitroContext.rollupConfig.output.entryFileNames)
  };
}
function startRollupWatcher(nitroContext) {
  const watcher = rollup.watch(nitroContext.rollupConfig);
  let start;
  watcher.on("event", (event) => {
    switch (event.code) {
      case "START":
        return;
      case "BUNDLE_START":
        start = Date.now();
        return;
      case "END":
        nitroContext._internal.hooks.callHook("nitro:compiled", nitroContext);
        consola.success("Nitro built", start ? `in ${Date.now() - start} ms` : "");
        return;
      case "ERROR":
        consola.error("Rollup error: " + event.error);
    }
  });
  return watcher;
}
async function _watch(nitroContext) {
  let watcher = startRollupWatcher(nitroContext);
  nitroContext.scannedMiddleware = await scanMiddleware(nitroContext._nuxt.serverDir, (middleware, event) => {
    nitroContext.scannedMiddleware = middleware;
    if (["add", "addDir"].includes(event)) {
      watcher.close();
      writeTypes(nitroContext).catch(console.error);
      watcher = startRollupWatcher(nitroContext);
    }
  });
  await writeTypes(nitroContext);
}

const azure_functions = {
  serveStatic: true,
  entry: "{{ _internal.runtimeDir }}/entries/azure_functions",
  externals: true,
  hooks: {
    async "nitro:compiled"(ctx) {
      await writeRoutes$3(ctx);
    }
  }
};
function zipDirectory(dir, outfile) {
  const archive = archiver("zip", { zlib: { level: 9 } });
  const stream = createWriteStream(outfile);
  return new Promise((resolve2, reject) => {
    archive.directory(dir, false).on("error", (err) => reject(err)).pipe(stream);
    stream.on("close", () => resolve2(void 0));
    archive.finalize();
  });
}
async function writeRoutes$3({ output: { dir, serverDir } }) {
  const host = {
    version: "2.0",
    extensions: { http: { routePrefix: "" } }
  };
  const functionDefinition = {
    entryPoint: "handle",
    bindings: [
      {
        authLevel: "anonymous",
        type: "httpTrigger",
        direction: "in",
        name: "req",
        route: "{*url}",
        methods: [
          "delete",
          "get",
          "head",
          "options",
          "patch",
          "post",
          "put"
        ]
      },
      {
        type: "http",
        direction: "out",
        name: "res"
      }
    ]
  };
  await writeFile(resolve(serverDir, "function.json"), JSON.stringify(functionDefinition));
  await writeFile(resolve(dir, "host.json"), JSON.stringify(host));
  await zipDirectory(dir, join(dir, "deploy.zip"));
  const zipPath = prettyPath(resolve(dir, "deploy.zip"));
  consola.success(`Ready to run \`az functionapp deployment source config-zip -g <resource-group> -n <app-name> --src ${zipPath}\``);
}

const azure = {
  entry: "{{ _internal.runtimeDir }}/entries/azure",
  externals: true,
  output: {
    serverDir: "{{ output.dir }}/server/functions"
  },
  hooks: {
    async "nitro:compiled"(ctx) {
      await writeRoutes$2(ctx);
    }
  }
};
async function writeRoutes$2({ output }) {
  const host = {
    version: "2.0"
  };
  const config = {
    routes: [],
    navigationFallback: {
      rewrite: "/api/server"
    }
  };
  const indexPath = resolve(output.publicDir, "index.html");
  const indexFileExists = fse.existsSync(indexPath);
  if (!indexFileExists) {
    config.routes.unshift({
      route: "/index.html",
      redirect: "/"
    }, {
      route: "/",
      rewrite: "/api/server"
    });
  }
  const folderFiles = await globby([
    join(output.publicDir, "index.html"),
    join(output.publicDir, "**/index.html")
  ]);
  const prefix = output.publicDir.length;
  const suffix = "/index.html".length;
  folderFiles.forEach((file) => config.routes.unshift({
    route: file.slice(prefix, -suffix) || "/",
    rewrite: file.slice(prefix)
  }));
  const otherFiles = await globby([join(output.publicDir, "**/*.html"), join(output.publicDir, "*.html")]);
  otherFiles.forEach((file) => {
    if (file.endsWith("index.html")) {
      return;
    }
    const route = file.slice(prefix, ".html".length);
    const existingRouteIndex = config.routes.findIndex((_route) => _route.route === route);
    if (existingRouteIndex > -1) {
      config.routes.splice(existingRouteIndex, 1);
    }
    config.routes.unshift({
      route,
      rewrite: file.slice(prefix)
    });
  });
  const functionDefinition = {
    entryPoint: "handle",
    bindings: [
      {
        authLevel: "anonymous",
        type: "httpTrigger",
        direction: "in",
        name: "req",
        route: "{*url}",
        methods: ["delete", "get", "head", "options", "patch", "post", "put"]
      },
      {
        type: "http",
        direction: "out",
        name: "res"
      }
    ]
  };
  await writeFile(resolve(output.serverDir, "function.json"), JSON.stringify(functionDefinition));
  await writeFile(resolve(output.serverDir, "../host.json"), JSON.stringify(host));
  await writeFile(resolve(output.publicDir, "staticwebapp.config.json"), JSON.stringify(config));
  if (!indexFileExists) {
    await writeFile(indexPath, "");
  }
  const apiDir = resolve(output.serverDir, "..");
  consola.success("Ready to run", hl("npx @azure/static-web-apps-cli start " + prettyPath(output.publicDir) + " --api-location " + prettyPath(apiDir)), "for local testing");
}

const worker = {
  entry: null,
  node: false,
  minify: true,
  externals: false,
  inlineDynamicImports: true
};

const browser = extendPreset(worker, (input) => {
  const routerBase = input._nuxt.routerBase;
  const script = `<script>
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('${routerBase}sw.js');
  });
}
<\/script>`;
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link rel="prefetch" href="${routerBase}sw.js">
  <link rel="prefetch" href="${routerBase}_server/index.mjs">
  <script>
  async function register () {
    const registration = await navigator.serviceWorker.register('${routerBase}sw.js')
    await navigator.serviceWorker.ready
    registration.active.addEventListener('statechange', (event) => {
      if (event.target.state === 'activated') {
        window.location.reload()
      }
    })
  }
  if (location.hostname !== 'localhost' && location.protocol === 'http:') {
    location.replace(location.href.replace('http://', 'https://'))
  } else {
    register()
  }
  <\/script>
</head>

<body>
  Loading...
</body>

</html>`;
  return {
    entry: "{{ _internal.runtimeDir }}/entries/service-worker",
    output: {
      serverDir: "{{ output.dir }}/public/_server"
    },
    nuxtHooks: {
      "generate:page"(page) {
        page.html = page.html.replace("</body>", script + "</body>");
      }
    },
    hooks: {
      "nitro:document"(tmpl) {
        tmpl.contents = tmpl.contents.replace("</body>", script + "</body>");
      },
      async "nitro:compiled"({ output }) {
        await promises.writeFile(resolve(output.publicDir, "sw.js"), `self.importScripts('${input._nuxt.routerBase}_server/index.mjs');`, "utf8");
        if (!existsSync(resolve(output.publicDir, "index.html"))) {
          await promises.writeFile(resolve(output.publicDir, "index.html"), html, "utf8");
        }
        if (!existsSync(resolve(output.publicDir, "200.html"))) {
          await promises.writeFile(resolve(output.publicDir, "200.html"), html, "utf8");
        }
        if (!existsSync(resolve(output.publicDir, "404.html"))) {
          await promises.writeFile(resolve(output.publicDir, "404.html"), html, "utf8");
        }
        consola.info("Ready to deploy to static hosting:", prettyPath(output.publicDir));
      }
    }
  };
});

const cloudflare = extendPreset(worker, {
  entry: "{{ _internal.runtimeDir }}/entries/cloudflare",
  ignore: [
    "wrangler.toml"
  ],
  hooks: {
    async "nitro:compiled"({ output, _nuxt }) {
      await writeFile(resolve(output.dir, "package.json"), JSON.stringify({ private: true, main: "./server/index.mjs" }, null, 2));
      await writeFile(resolve(output.dir, "package-lock.json"), JSON.stringify({ lockfileVersion: 1 }, null, 2));
      let inDir = prettyPath(_nuxt.rootDir);
      if (inDir) {
        inDir = "in " + inDir;
      }
      consola.success("Ready to run", hl("npx wrangler publish " + inDir), "or", hl("npx miniflare " + prettyPath(output.serverDir) + "/index.mjs --site " + prettyPath(output.publicDir)), "for local testing");
    }
  }
});

const firebase = {
  entry: "{{ _internal.runtimeDir }}/entries/firebase",
  externals: true,
  hooks: {
    async "nitro:compiled"(ctx) {
      await writeRoutes$1(ctx);
    }
  }
};
async function writeRoutes$1({ output: { publicDir, serverDir }, _nuxt: { rootDir, modulesDir } }) {
  if (!fse.existsSync(join(rootDir, "firebase.json"))) {
    const firebase2 = {
      functions: {
        source: relative(rootDir, serverDir)
      },
      hosting: [
        {
          site: "<your_project_id>",
          public: relative(rootDir, publicDir),
          cleanUrls: true,
          rewrites: [
            {
              source: "**",
              function: "server"
            }
          ]
        }
      ]
    };
    await writeFile(resolve(rootDir, "firebase.json"), JSON.stringify(firebase2));
  }
  const _require = createRequire(import.meta.url);
  const jsons = await globby(`${serverDir}/node_modules/**/package.json`);
  const prefixLength = `${serverDir}/node_modules/`.length;
  const suffixLength = "/package.json".length;
  const dependencies = jsons.reduce((obj, packageJson) => {
    const dirname = packageJson.slice(prefixLength, -suffixLength);
    if (!dirname.includes("node_modules")) {
      obj[dirname] = _require(packageJson).version;
    }
    return obj;
  }, {});
  let nodeVersion = "14";
  try {
    const currentNodeVersion = fse.readJSONSync(join(rootDir, "package.json")).engines.node;
    if (["16", "14"].includes(currentNodeVersion)) {
      nodeVersion = currentNodeVersion;
    }
  } catch {
  }
  const getPackageVersion = async (id) => {
    const pkg = await readPackageJSON(id, { url: modulesDir });
    return pkg.version;
  };
  await writeFile(resolve(serverDir, "package.json"), JSON.stringify({
    private: true,
    type: "module",
    main: "./index.mjs",
    dependencies,
    devDependencies: {
      "firebase-functions-test": "latest",
      "firebase-admin": await getPackageVersion("firebase-admin"),
      "firebase-functions": await getPackageVersion("firebase-functions")
    },
    engines: { node: nodeVersion }
  }, null, 2));
  consola.success("Ready to run `firebase deploy`");
}

const lambda = {
  entry: "{{ _internal.runtimeDir }}/entries/lambda",
  externals: true
};

const netlify = extendPreset(lambda, {
  output: {
    dir: "{{ _nuxt.rootDir }}/.netlify/functions-internal",
    publicDir: "{{ _nuxt.rootDir }}/dist"
  },
  hooks: {
    async "nitro:compiled"(ctx) {
      const redirectsPath = join(ctx.output.publicDir, "_redirects");
      let contents = "/* /.netlify/functions/server 200";
      if (existsSync(redirectsPath)) {
        const currentRedirects = await promises.readFile(redirectsPath, "utf-8");
        if (currentRedirects.match(/^\/\* /m)) {
          consola.info("Not adding Nitro fallback to `_redirects` (as an existing fallback was found).");
          return;
        }
        consola.info("Adding Nitro fallback to `_redirects` to handle all unmatched routes.");
        contents = currentRedirects + "\n" + contents;
      }
      await promises.writeFile(redirectsPath, contents);
    },
    "nitro:rollup:before"(ctx) {
      ctx.rollupConfig.output.entryFileNames = "server.ts";
    }
  },
  ignore: [
    "netlify.toml",
    "_redirects"
  ]
});
const netlify_builder = extendPreset(netlify, {
  entry: "{{ _internal.runtimeDir }}/entries/netlify_builder"
});

const node = {
  entry: "{{ _internal.runtimeDir }}/entries/node",
  externals: true
};

const dev = extendPreset(node, {
  entry: "{{ _internal.runtimeDir }}/entries/dev",
  output: {
    serverDir: "{{ _nuxt.buildDir }}/nitro"
  },
  externals: { trace: false },
  inlineDynamicImports: true,
  sourceMap: true
});

const server = extendPreset(node, {
  entry: "{{ _internal.runtimeDir }}/entries/server",
  serveStatic: true,
  hooks: {
    "nitro:compiled"({ output }) {
      consola.success("Ready to run", hl("node " + prettyPath(output.serverDir) + "/index.mjs"));
    }
  }
});

const cli = extendPreset(node, {
  entry: "{{ _internal.runtimeDir }}/entries/cli",
  hooks: {
    "nitro:compiled"({ output }) {
      consola.info("Run with `node " + prettyPath(output.serverDir) + " [route]`");
    }
  }
});

const vercel = extendPreset(node, {
  entry: "{{ _internal.runtimeDir }}/entries/vercel",
  output: {
    dir: "{{ _nuxt.rootDir }}/.vercel_build_output",
    serverDir: "{{ output.dir }}/functions/node/server",
    publicDir: "{{ output.dir }}/static"
  },
  ignore: [
    "vercel.json"
  ],
  hooks: {
    async "nitro:compiled"(ctx) {
      await writeRoutes(ctx);
    }
  }
});
async function writeRoutes({ output }) {
  const routes = [
    {
      src: "/sw.js",
      headers: {
        "cache-control": "public, max-age=0, must-revalidate"
      },
      continue: true
    },
    {
      src: "/_nuxt/(.*)",
      headers: {
        "cache-control": "public,max-age=31536000,immutable"
      },
      continue: true
    },
    {
      handle: "filesystem"
    },
    {
      src: "(.*)",
      dest: "/.vercel/functions/server/index"
    }
  ];
  await writeFile(resolve(output.dir, "config/routes.json"), JSON.stringify(routes, null, 2));
}

const PRESETS = {
  __proto__: null,
  azure_functions: azure_functions,
  azure: azure,
  browser: browser,
  cloudflare: cloudflare,
  firebase: firebase,
  lambda: lambda,
  netlify: netlify,
  netlify_builder: netlify_builder,
  node: node,
  dev: dev,
  server: server,
  cli: cli,
  vercel: vercel,
  worker: worker
};

function getNitroContext(nuxtOptions, input) {
  const defaults = {
    alias: {},
    timing: void 0,
    inlineDynamicImports: void 0,
    minify: void 0,
    sourceMap: void 0,
    externals: void 0,
    analyze: nuxtOptions.build.analyze,
    entry: void 0,
    node: void 0,
    preset: void 0,
    rollupConfig: void 0,
    experiments: {},
    moduleSideEffects: ["unenv/runtime/polyfill/"],
    renderer: void 0,
    serveStatic: void 0,
    middleware: [],
    scannedMiddleware: [],
    ignore: [],
    env: {},
    vfs: {},
    hooks: {},
    nuxtHooks: {},
    output: {
      dir: "{{ _nuxt.rootDir }}/.output",
      serverDir: "{{ output.dir }}/server",
      publicDir: "{{ output.dir }}/public"
    },
    storage: { mounts: {} },
    assets: {
      inline: !nuxtOptions.dev,
      dirs: {}
    },
    _nuxt: {
      majorVersion: nuxtOptions._majorVersion || 2,
      dev: nuxtOptions.dev,
      ssr: nuxtOptions.ssr,
      rootDir: nuxtOptions.rootDir,
      srcDir: nuxtOptions.srcDir,
      buildDir: nuxtOptions.buildDir,
      generateDir: nuxtOptions.generate.dir,
      publicDir: resolve(nuxtOptions.srcDir, nuxtOptions.dir.public || nuxtOptions.dir.static),
      serverDir: resolve(nuxtOptions.srcDir, nuxtOptions.dir.server || "server"),
      routerBase: nuxtOptions.router.base,
      publicPath: nuxtOptions.app.assetsPath,
      isStatic: nuxtOptions.target === "static" && !nuxtOptions.dev,
      fullStatic: nuxtOptions.target === "static" && !nuxtOptions._legacyGenerate,
      staticAssets: nuxtOptions.generate.staticAssets,
      modulesDir: nuxtOptions.modulesDir,
      runtimeConfig: {
        public: nuxtOptions.publicRuntimeConfig,
        private: nuxtOptions.privateRuntimeConfig
      }
    },
    _internal: {
      runtimeDir,
      hooks: createHooks()
    }
  };
  defaults.preset = input.preset || process.env.NITRO_PRESET || detectTarget() || "server";
  let presetDefaults = PRESETS[defaults.preset] || tryImport(nuxtOptions.rootDir, defaults.preset);
  if (!presetDefaults) {
    throw new Error("Cannot resolve preset: " + defaults.preset);
  }
  presetDefaults = presetDefaults.default || presetDefaults;
  const _presetInput = defu(input, defaults);
  const _preset = extendPreset(presetDefaults, input)(_presetInput);
  const nitroContext = defu(_preset, defaults);
  nitroContext.output.dir = resolvePath(nitroContext, nitroContext.output.dir);
  nitroContext.output.publicDir = resolvePath(nitroContext, nitroContext.output.publicDir);
  nitroContext.output.serverDir = resolvePath(nitroContext, nitroContext.output.serverDir);
  nitroContext._internal.hooks.addHooks(nitroContext.hooks);
  if (nitroContext._nuxt.dev) {
    const fsMounts = {
      root: resolve(nitroContext._nuxt.rootDir),
      src: resolve(nitroContext._nuxt.srcDir),
      build: resolve(nitroContext._nuxt.buildDir),
      cache: resolve(nitroContext._nuxt.rootDir, ".nuxt/nitro/cache")
    };
    for (const p in fsMounts) {
      nitroContext.storage.mounts[p] = nitroContext.storage.mounts[p] || {
        driver: "fs",
        driverOptions: { base: fsMounts[p] }
      };
    }
  }
  nitroContext.assets.dirs.server = {
    dir: resolve(nitroContext._nuxt.srcDir, "server/assets"),
    meta: true
  };
  return nitroContext;
}

function handleVfs(ctx) {
  return (req) => {
    if (req.url === "/") {
      const items = Object.keys(ctx.vfs).filter((i) => !i.startsWith("#")).map((key) => `<li><a href="/_vfs/${encodeURIComponent(key)}">${key.replace(ctx._nuxt.rootDir, "")}</a></li>`).join("\n");
      return `<!doctype html><html><body><ul>${items}</ul></body></html>`;
    }
    const param = decodeURIComponent(req.url.slice(1));
    if (param in ctx.vfs) {
      return editorTemplate({
        readOnly: true,
        language: param.endsWith("html") ? "html" : "javascript",
        theme: "vs-dark",
        value: ctx.vfs[param]
      });
    }
    return createError({ message: "File not found", statusCode: 404 });
  };
}
const monacoVersion = "0.30.0";
const monacoUrl = `https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/${monacoVersion}/min`;
const vsUrl = `${monacoUrl}/vs`;
const editorTemplate = (options) => `
<!doctype html>
<html>
<head>
    <link rel="stylesheet" data-name="vs/editor/editor.main" href="${vsUrl}/editor/editor.main.min.css">
</head>
<body style="margin: 0">
<div id="editor" style="height:100vh"></div>
<script src="${vsUrl}/loader.min.js"><\/script>
<script>
  require.config({ paths: { vs: '${vsUrl}' } })

  const proxy = URL.createObjectURL(new Blob([\`
    self.MonacoEnvironment = { baseUrl: '${monacoUrl}' }
    importScripts('${vsUrl}/base/worker/workerMain.min.js')
  \`], { type: 'text/javascript' }))
  window.MonacoEnvironment = { getWorkerUrl: () => proxy }

  require(['vs/editor/editor.main'], function () {
    monaco.editor.create(document.getElementById('editor'), ${JSON.stringify(options)})
  })
<\/script>
</body>
</html>
`;

function initWorker(filename) {
  return new Promise((resolve2, reject) => {
    const worker = new Worker(filename);
    worker.once("exit", (code) => {
      if (code) {
        reject(new Error("[worker] exited with code: " + code));
      }
    });
    worker.on("error", (err) => {
      console.error("[worker]", err);
      err.message = "[worker] " + err.message;
      reject(err);
    });
    worker.on("message", (event) => {
      if (event && event.address) {
        resolve2({
          worker,
          address: event.address
        });
      }
    });
  });
}
async function killWorker(worker) {
  if (!worker) {
    return;
  }
  await worker.worker?.terminate();
  worker.worker = null;
  if (worker.address && existsSync(worker.address)) {
    await promises.rm(worker.address).catch(() => {
    });
  }
}
function createDevServer(nitroContext) {
  const workerEntry = resolve(nitroContext.output.dir, nitroContext.output.serverDir, "index.mjs");
  let currentWorker;
  async function reload() {
    const newWorker = await initWorker(workerEntry);
    killWorker(currentWorker).catch((err) => console.error(err));
    currentWorker = newWorker;
  }
  const app = createApp();
  app.use(nitroContext._nuxt.publicPath, serveStatic(resolve(nitroContext._nuxt.buildDir, "dist/client")));
  app.use(nitroContext._nuxt.routerBase, serveStatic(resolve(nitroContext._nuxt.publicDir)));
  app.use("/_vfs", useBase("/_vfs", handleVfs(nitroContext)));
  const legacyMiddleware = createDynamicMiddleware();
  const devMiddleware = createDynamicMiddleware();
  app.use(legacyMiddleware.middleware);
  app.use(devMiddleware.middleware);
  app.use(nitroContext._nuxt.publicPath, servePlaceholder());
  const proxy = httpProxy.createProxy();
  const proxyHandle = promisifyHandle((req, res) => {
    proxy.web(req, res, { target: currentWorker.address }, (error) => {
      console.error("[proxy]", error);
    });
  });
  app.use((req, res) => {
    if (currentWorker?.address) {
      if (req.spa) {
        req.headers["x-nuxt-no-ssr"] = "true";
      }
      return proxyHandle(req, res);
    } else {
      res.setHeader("Content-Type", "text/html; charset=UTF-8");
      res.end(loading({}));
    }
  });
  let listeners = [];
  const _listen = async (port, opts) => {
    const listener = await listen(app, { port, ...opts });
    listeners.push(listener);
    return listener;
  };
  const pattern = "**/*.{js,json,cjs,mjs}";
  const events = ["add", "change"];
  let watcher;
  function watch() {
    if (watcher) {
      return;
    }
    const dReload = debounce(() => reload().catch(console.warn), 200, { before: true });
    watcher = chokidar.watch([
      resolve(nitroContext.output.serverDir, pattern),
      resolve(nitroContext._nuxt.buildDir, "dist/server", pattern)
    ]).on("all", (event) => events.includes(event) && dReload());
  }
  async function close() {
    if (watcher) {
      await watcher.close();
    }
    await killWorker(currentWorker);
    await Promise.all(listeners.map((l) => l.close()));
    listeners = [];
  }
  nitroContext._internal.hooks.hook("close", close);
  return {
    reload,
    listen: _listen,
    app,
    close,
    watch,
    setLegacyMiddleware: legacyMiddleware.set,
    setDevMiddleware: devMiddleware.set
  };
}
function createDynamicMiddleware() {
  let middleware;
  return {
    set: (input) => {
      if (!Array.isArray(input)) {
        middleware = input;
        return;
      }
      const app = connect();
      for (const m of input) {
        app.use(m.path || m.route || "/", m.handler || m.handle);
      }
      middleware = app;
    },
    middleware: (req, res, next) => middleware ? middleware(req, res, next) : next()
  };
}

const wpfs = {
  ...fse,
  join
};

export { build, createDevServer, generate, getNitroContext, prepare, resolveMiddleware, scanMiddleware, wpfs };
