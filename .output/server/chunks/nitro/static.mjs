import { createError } from 'h3';
import { withLeadingSlash, withoutTrailingSlash, parseURL } from 'ufo';
import { promises } from 'fs';
import { resolve, dirname } from 'pathe';
import { fileURLToPath } from 'url';

const assets = {
  "/200.html": {
    "type": "text/html; charset=utf-8",
    "etag": "\"1dec-GUgJI0gI1g/A7YVLPeKrfnMP2kU\"",
    "mtime": "2021-12-15T10:26:25.647Z",
    "path": "../public/200.html"
  },
  "/favicon.ico": {
    "type": "image/vnd.microsoft.icon",
    "etag": "\"21bc-XwkmumvsWAWQvKTShmzlcL3xoys\"",
    "mtime": "2021-12-15T10:26:24.653Z",
    "path": "../public/favicon.ico"
  },
  "/index.html": {
    "type": "text/html; charset=utf-8",
    "etag": "\"1dec-GUgJI0gI1g/A7YVLPeKrfnMP2kU\"",
    "mtime": "2021-12-15T10:26:25.636Z",
    "path": "../public/index.html"
  },
  "/_nuxt/06543a5.js": {
    "type": "application/javascript",
    "etag": "\"7e-inVmmigqHy03gccWcYjRuJsuWIA\"",
    "mtime": "2021-12-15T10:26:24.658Z",
    "path": "../public/_nuxt/06543a5.js"
  },
  "/_nuxt/47dd622.js": {
    "type": "application/javascript",
    "etag": "\"78e-KtftHoVDXGZRhi3sDbUa/XzohqE\"",
    "mtime": "2021-12-15T10:26:24.657Z",
    "path": "../public/_nuxt/47dd622.js"
  },
  "/_nuxt/61e1dbe.js": {
    "type": "application/javascript",
    "etag": "\"944-4cjMNlAT3TjPXBppRcIGdqd0+9I\"",
    "mtime": "2021-12-15T10:26:24.657Z",
    "path": "../public/_nuxt/61e1dbe.js"
  },
  "/_nuxt/71c7294.js": {
    "type": "application/javascript",
    "etag": "\"1a54-Jh39zMM40dil8ERjwc0Wb6jV8ZU\"",
    "mtime": "2021-12-15T10:26:24.657Z",
    "path": "../public/_nuxt/71c7294.js"
  },
  "/_nuxt/9931a07.js": {
    "type": "application/javascript",
    "etag": "\"1b5e-DuZQVnK2fgKrYZJ90Pi0jBi33gQ\"",
    "mtime": "2021-12-15T10:26:24.656Z",
    "path": "../public/_nuxt/9931a07.js"
  },
  "/_nuxt/beb5521.js": {
    "type": "application/javascript",
    "etag": "\"1c488-zWVl/1D9COjwEp/8jr9e9Kum0y0\"",
    "mtime": "2021-12-15T10:26:24.656Z",
    "path": "../public/_nuxt/beb5521.js"
  },
  "/_nuxt/f3fe67e.js": {
    "type": "application/javascript",
    "etag": "\"39dd2-/EE0+GiiQnrb7Dx+GBnVFap1ySg\"",
    "mtime": "2021-12-15T10:26:24.655Z",
    "path": "../public/_nuxt/f3fe67e.js"
  }
};

const mainDir = dirname(fileURLToPath(globalThis.entryURL));

function readAsset (id) {
  return promises.readFile(resolve(mainDir, getAsset(id).path))
}

function getAsset (id) {
  return assets[id]
}

const METHODS = ["HEAD", "GET"];
const PUBLIC_PATH = "/_nuxt/";
const TWO_DAYS = 2 * 60 * 60 * 24;
const STATIC_ASSETS_BASE = "/_nuxt/static" + "/" + "1639563984";
async function serveStatic(req, res) {
  if (!METHODS.includes(req.method)) {
    return;
  }
  let id = withLeadingSlash(withoutTrailingSlash(parseURL(req.url).pathname));
  let asset = getAsset(id);
  if (!asset) {
    const _id = id + "/index.html";
    const _asset = getAsset(_id);
    if (_asset) {
      asset = _asset;
      id = _id;
    }
  }
  if (!asset) {
    if (id.startsWith(PUBLIC_PATH) && !id.startsWith(STATIC_ASSETS_BASE)) {
      throw createError({
        statusMessage: "Cannot find static asset " + id,
        statusCode: 404
      });
    }
    return;
  }
  const ifNotMatch = req.headers["if-none-match"] === asset.etag;
  if (ifNotMatch) {
    res.statusCode = 304;
    return res.end("Not Modified (etag)");
  }
  const ifModifiedSinceH = req.headers["if-modified-since"];
  if (ifModifiedSinceH && asset.mtime) {
    if (new Date(ifModifiedSinceH) >= new Date(asset.mtime)) {
      res.statusCode = 304;
      return res.end("Not Modified (mtime)");
    }
  }
  if (asset.type) {
    res.setHeader("Content-Type", asset.type);
  }
  if (asset.etag) {
    res.setHeader("ETag", asset.etag);
  }
  if (asset.mtime) {
    res.setHeader("Last-Modified", asset.mtime);
  }
  if (id.startsWith(PUBLIC_PATH)) {
    res.setHeader("Cache-Control", `max-age=${TWO_DAYS}, immutable`);
  }
  const contents = await readAsset(id);
  return res.end(contents);
}

export { serveStatic as default };
