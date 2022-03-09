const dynamicChunks = {
  "pages/_slug.js": () => import('./app/pages/_slug.mjs').then(function (n) { return n._; }),
  "pages/index.js": () => import('./app/pages/index.mjs').then(function (n) { return n.i; }),
  "components/nuxt-logo.js": () => import('./app/components/nuxt-logo.mjs').then(function (n) { return n.n; }),
  "components/test1.js": () => import('./app/components/test1.mjs').then(function (n) { return n.t; }),
  "components/test2.js": () => import('./app/components/test2.mjs').then(function (n) { return n.t; }),
  "components/tutorial.js": () => import('./app/components/tutorial.mjs').then(function (n) { return n.t; })
};

function dynamicRequire(id) {
  return dynamicChunks[id]();
}

export { dynamicRequire as default };
