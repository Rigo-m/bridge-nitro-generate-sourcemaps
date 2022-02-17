function _mergeNamespaces(n, m) {
  for (var i = 0; i < m.length; i++) {
    const e = m[i];
    if (typeof e !== 'string' && !Array.isArray(e)) { for (const k in e) {
      if (k !== 'default' && !(k in n)) {
        const d = Object.getOwnPropertyDescriptor(e, k);
        if (d) {
          Object.defineProperty(n, k, d.get ? d : {
            enumerable: true,
            get: function () { return e[k]; }
          });
        }
      }
    } }
  }
  return Object.freeze(n);
}

var pages = {};

var ids = pages.ids = [5,2,3,4];
var modules = pages.modules = {

/***/ 59:
/***/ (function(module, __webpack_exports__, __webpack_require__) {
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return useTest; });
/* harmony import */ var _app__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);

const shared = Object(_app__WEBPACK_IMPORTED_MODULE_0__[/* ref */ "d"])('test');
const useTest = () => {
  return {
    state: Object(_app__WEBPACK_IMPORTED_MODULE_0__[/* useState */ "g"])('test', () => 'something'),
    shared
  };
};

/***/ }),

/***/ 60:
/***/ (function(module, __webpack_exports__, __webpack_require__) {
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return useUIState; });
/* harmony import */ var _app__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);

/**
 * Simple state management for UI purposes. Tightly adapted from a small utility in shopware-pwa repo
 *
 * @remarks
 * You can decide to not pass stateName to keep the UIState internally in the component.
 *
 * @example
 * ```js
 * // Component 1
 * const {isOpen, switchState} = useUIState('OVERLAY_STATE')
 * switchState()
 * // Component 2
 * const {isOpen} = useUIState('OVERLAY_STATE')
 * // isOpen will be true
 * ```
 * @param {string} stateName - represents the name that gets shared as a boolean state between components
 * @link https://github.com/vuestorefront/shopware-pwa/blob/master/packages/composables/src/logic/useUIState.ts
 * @return { isOpen: boolean, switchState: function }
 */

const useUIState = stateName => {
  let state;

  if (stateName) {
    state = Object(_app__WEBPACK_IMPORTED_MODULE_0__[/* useState */ "g"])(stateName, () => false);
  } else {
    state = Object(_app__WEBPACK_IMPORTED_MODULE_0__[/* ref */ "d"])(false);
  }

  const isOpen = Object(_app__WEBPACK_IMPORTED_MODULE_0__[/* computed */ "a"])(() => state.value);

  const switchState = to => {
    state.value = typeof to === 'undefined' ? !state.value : !!to;
  };

  return {
    isOpen,
    switchState
  };
};

/***/ }),

/***/ 61:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(63);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add CSS to SSR context
var add = __webpack_require__(10).default;
module.exports.__inject__ = function (context) {
  add("dfe0e63e", content, true, context);
};

/***/ }),

/***/ 62:
/***/ (function(module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _node_modules_vue_style_loader_index_js_ref_8_oneOf_1_0_node_modules_nuxt_postcss8_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_nuxt_postcss8_node_modules_postcss_loader_dist_cjs_js_ref_8_oneOf_1_2_node_modules_sass_loader_dist_cjs_js_ref_8_oneOf_1_3_node_modules_nuxt_components_dist_loader_js_ref_1_0_node_modules_vue_loader_lib_index_js_vue_loader_options_node_modules_unplugin_dist_webpack_loaders_transform_js_ref_30_0_Test1_vue_vue_type_style_index_0_id_317a2b85_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(61);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _node_modules_vue_style_loader_index_js_ref_8_oneOf_1_0_node_modules_nuxt_postcss8_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_nuxt_postcss8_node_modules_postcss_loader_dist_cjs_js_ref_8_oneOf_1_2_node_modules_sass_loader_dist_cjs_js_ref_8_oneOf_1_3_node_modules_nuxt_components_dist_loader_js_ref_1_0_node_modules_vue_loader_lib_index_js_vue_loader_options_node_modules_unplugin_dist_webpack_loaders_transform_js_ref_30_0_Test1_vue_vue_type_style_index_0_id_317a2b85_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0__) if(["default"].indexOf(__WEBPACK_IMPORT_KEY__) < 0) (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _node_modules_vue_style_loader_index_js_ref_8_oneOf_1_0_node_modules_nuxt_postcss8_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_nuxt_postcss8_node_modules_postcss_loader_dist_cjs_js_ref_8_oneOf_1_2_node_modules_sass_loader_dist_cjs_js_ref_8_oneOf_1_3_node_modules_nuxt_components_dist_loader_js_ref_1_0_node_modules_vue_loader_lib_index_js_vue_loader_options_node_modules_unplugin_dist_webpack_loaders_transform_js_ref_30_0_Test1_vue_vue_type_style_index_0_id_317a2b85_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0__[key]; }); }(__WEBPACK_IMPORT_KEY__));


/***/ }),

/***/ 63:
/***/ (function(module, exports, __webpack_require__) {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(9);
var ___CSS_LOADER_EXPORT___ = ___CSS_LOADER_API_IMPORT___(function(i){return i[1]});
// Module
___CSS_LOADER_EXPORT___.push([module.i, ".test[data-v-317a2b85]{transform:scale(1.5);transform-origin:left center}", ""]);
// Exports
___CSS_LOADER_EXPORT___.locals = {};
module.exports = ___CSS_LOADER_EXPORT___;


/***/ }),

/***/ 64:
/***/ (function(module, __webpack_exports__, __webpack_require__) {
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// CONCATENATED MODULE: ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/@nuxt/components/dist/loader.js??ref--1-0!./node_modules/vue-loader/lib??vue-loader-options!./node_modules/unplugin/dist/webpack/loaders/transform.js??ref--30-0!./components/Test1.vue?vue&type=template&id=317a2b85&scoped=true&
var render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',[_vm._ssrNode(_vm._ssrEscape(_vm._s(_vm.testState)+" -- "+_vm._s(_vm.shared)+" -- "+_vm._s(_vm.isOpen ? 'open' : 'closed')))])};
var staticRenderFns = [];


// CONCATENATED MODULE: ./components/Test1.vue?vue&type=template&id=317a2b85&scoped=true&

// EXTERNAL MODULE: ./composables/test.js
var test = __webpack_require__(59);

// EXTERNAL MODULE: ./node_modules/@nuxt/bridge/dist/runtime/index.mjs + 5 modules
var runtime = __webpack_require__(3);

// EXTERNAL MODULE: ./composables/useUIState.js
var useUIState = __webpack_require__(60);

// CONCATENATED MODULE: ./node_modules/babel-loader/lib??ref--3-0!./node_modules/@nuxt/components/dist/loader.js??ref--1-0!./node_modules/vue-loader/lib??vue-loader-options!./node_modules/unplugin/dist/webpack/loaders/transform.js??ref--30-0!./components/Test1.vue?vue&type=script&lang=js&
//
//
//
//



/* harmony default export */ var Test1vue_type_script_lang_js_ = ({
  setup() {
    const {
      state: testState,
      shared
    } = Object(test["a" /* useTest */])();
    const {
      isOpen
    } = Object(useUIState["a" /* useUIState */])('TEST_STATE');
    Object(runtime["c" /* onMounted */])(() => {
      setTimeout(() => {
        testState.value = 'something else';
      }, 5000);
    });
    return {
      testState,
      shared,
      isOpen
    };
  }

});
// CONCATENATED MODULE: ./components/Test1.vue?vue&type=script&lang=js&
 /* harmony default export */ var components_Test1vue_type_script_lang_js_ = (Test1vue_type_script_lang_js_); 
// EXTERNAL MODULE: ./node_modules/vue-loader/lib/runtime/componentNormalizer.js
var componentNormalizer = __webpack_require__(4);

// CONCATENATED MODULE: ./components/Test1.vue



function injectStyles (context) {
  
  var style0 = __webpack_require__(62);
if (style0.__inject__) style0.__inject__(context);

}

/* normalize component */

var component = Object(componentNormalizer["a" /* default */])(
  components_Test1vue_type_script_lang_js_,
  render,
  staticRenderFns,
  false,
  injectStyles,
  "317a2b85",
  "7dc4f703"
  
);

/* harmony default export */ __webpack_exports__["default"] = (component.exports);

/***/ }),

/***/ 65:
/***/ (function(module, __webpack_exports__, __webpack_require__) {
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// CONCATENATED MODULE: ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/@nuxt/components/dist/loader.js??ref--1-0!./node_modules/vue-loader/lib??vue-loader-options!./node_modules/unplugin/dist/webpack/loaders/transform.js??ref--30-0!./components/Test2.vue?vue&type=template&id=3e70295e&scoped=true&
var render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',[_vm._ssrNode(_vm._ssrEscape(_vm._s(_vm.testState)+" ")+"<span data-v-3e70295e>click me</span>")])};
var staticRenderFns = [];


// CONCATENATED MODULE: ./components/Test2.vue?vue&type=template&id=3e70295e&scoped=true&

// EXTERNAL MODULE: ./composables/test.js
var test = __webpack_require__(59);

// EXTERNAL MODULE: ./node_modules/@nuxt/bridge/dist/runtime/index.mjs + 5 modules
var runtime = __webpack_require__(3);

// EXTERNAL MODULE: ./composables/useUIState.js
var useUIState = __webpack_require__(60);

// CONCATENATED MODULE: ./node_modules/babel-loader/lib??ref--3-0!./node_modules/@nuxt/components/dist/loader.js??ref--1-0!./node_modules/vue-loader/lib??vue-loader-options!./node_modules/unplugin/dist/webpack/loaders/transform.js??ref--30-0!./components/Test2.vue?vue&type=script&lang=js&
//
//
//
//
// some extra comment here



/* harmony default export */ var Test2vue_type_script_lang_js_ = ({
  setup() {
    const {
      state: testState
    } = Object(test["a" /* useTest */])(); // test of a single line comment

    const {
      switchState
    } = Object(useUIState["a" /* useUIState */])('TEST_STATE'); // test2

    Object(runtime["c" /* onMounted */])(() => {
      setTimeout(() => {
        testState.value = 'something else 2';
      }, 10000);
    });
    return {
      testState,
      switchState
    };
  }

});
// CONCATENATED MODULE: ./components/Test2.vue?vue&type=script&lang=js&
 /* harmony default export */ var components_Test2vue_type_script_lang_js_ = (Test2vue_type_script_lang_js_); 
// EXTERNAL MODULE: ./node_modules/vue-loader/lib/runtime/componentNormalizer.js
var componentNormalizer = __webpack_require__(4);

// CONCATENATED MODULE: ./components/Test2.vue



function injectStyles (context) {
  
  
}

/* normalize component */

var component = Object(componentNormalizer["a" /* default */])(
  components_Test2vue_type_script_lang_js_,
  render,
  staticRenderFns,
  false,
  injectStyles,
  "3e70295e",
  "7dd30e84"
  
);

/* harmony default export */ __webpack_exports__["default"] = (component.exports);

/***/ }),

/***/ 67:
/***/ (function(module, __webpack_exports__, __webpack_require__) {
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// CONCATENATED MODULE: ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/@nuxt/components/dist/loader.js??ref--1-0!./node_modules/vue-loader/lib??vue-loader-options!./node_modules/unplugin/dist/webpack/loaders/transform.js??ref--30-0!./components/Tutorial.vue?vue&type=template&id=41c97d4c&
var render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"relative flex items-top justify-center min-h-screen bg-gray-100 sm:items-center sm:pt-0"},[_c('Test1'),_vm._ssrNode(" "),_c('Test2')],2)};
var staticRenderFns = [];


// CONCATENATED MODULE: ./components/Tutorial.vue?vue&type=template&id=41c97d4c&

// EXTERNAL MODULE: ./node_modules/vue-loader/lib/runtime/componentNormalizer.js
var componentNormalizer = __webpack_require__(4);

// CONCATENATED MODULE: ./components/Tutorial.vue

var script = {};


/* normalize component */

var component = Object(componentNormalizer["a" /* default */])(
  script,
  render,
  staticRenderFns,
  false,
  null,
  null,
  "93d8952c"
  
);

/* harmony default export */ __webpack_exports__["default"] = (component.exports);

/* nuxt-component-imports */
installComponents(component, {Test1: __webpack_require__(64).default,Test2: __webpack_require__(65).default});


/***/ }),

/***/ 70:
/***/ (function(module, __webpack_exports__, __webpack_require__) {
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// CONCATENATED MODULE: ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/@nuxt/components/dist/loader.js??ref--1-0!./node_modules/vue-loader/lib??vue-loader-options!./node_modules/unplugin/dist/webpack/loaders/transform.js??ref--30-0!./pages/index.vue?vue&type=template&id=e08b07de&
var render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',[_c('Tutorial'),_vm._ssrNode(" "),_c('Tutorial')],2)};
var staticRenderFns = [];


// CONCATENATED MODULE: ./pages/index.vue?vue&type=template&id=e08b07de&

// CONCATENATED MODULE: ./node_modules/babel-loader/lib??ref--3-0!./node_modules/@nuxt/components/dist/loader.js??ref--1-0!./node_modules/vue-loader/lib??vue-loader-options!./node_modules/unplugin/dist/webpack/loaders/transform.js??ref--30-0!./pages/index.vue?vue&type=script&lang=js&
//
//
//
//
//
//
//
/* harmony default export */ var transform_ref_30_0_pagesvue_type_script_lang_js_ = ({});
// CONCATENATED MODULE: ./pages/index.vue?vue&type=script&lang=js&
 /* harmony default export */ var pagesvue_type_script_lang_js_ = (transform_ref_30_0_pagesvue_type_script_lang_js_); 
// EXTERNAL MODULE: ./node_modules/vue-loader/lib/runtime/componentNormalizer.js
var componentNormalizer = __webpack_require__(4);

// CONCATENATED MODULE: ./pages/index.vue





/* normalize component */

var component = Object(componentNormalizer["a" /* default */])(
  pagesvue_type_script_lang_js_,
  render,
  staticRenderFns,
  false,
  null,
  null,
  "5ba39cda"
  
);

/* harmony default export */ __webpack_exports__["default"] = (component.exports);

/* nuxt-component-imports */
installComponents(component, {Tutorial: __webpack_require__(67).default});


/***/ })

};

const index = /*#__PURE__*/Object.freeze(/*#__PURE__*/_mergeNamespaces({
  __proto__: null,
  'default': pages,
  ids: ids,
  modules: modules
}, [pages]));

export { index as i };
