const dynamicChunks = {
 ['components/nuxt-logo.js']: () => import('./app/components/nuxt-logo.mjs').then(function (n) { return n.n; }),
 ['components/test1.js']: () => import('./app/components/test1.mjs').then(function (n) { return n.t; }),
 ['components/test2.js']: () => import('./app/components/test2.mjs').then(function (n) { return n.t; }),
 ['components/tutorial.js']: () => import('./app/components/tutorial.mjs').then(function (n) { return n.t; }),
 ['pages/index.js']: () => import('./app/pages/index.mjs').then(function (n) { return n.i; })
};

function dynamicRequire(id) {
  return dynamicChunks[id]();
}

export { dynamicRequire as default };
