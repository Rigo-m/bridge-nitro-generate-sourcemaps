import '@netlify/functions';
export { h as handler } from './chunks/nitro/netlify_builder.mjs';
import 'unenv/runtime/polyfill/fetch.node';
import 'ufo';
import 'h3';
import 'ohmyfetch';
import 'destr';
import 'unenv/runtime/fetch/index';
import 'defu';
