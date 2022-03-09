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

var test1$1 = {};

var ids = test1$1.ids = [2];
var modules = test1$1.modules = {

/***/ 60:
/***/ (function(module, __webpack_exports__, __webpack_require__) {
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return useTest; });
/* harmony import */ var _app__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);

const useTest = () => {
  return {
    state: Object(_app__WEBPACK_IMPORTED_MODULE_0__[/* useState */ "h"])('test', () => 'something')
  };
};

/***/ }),

/***/ 61:
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
    state = Object(_app__WEBPACK_IMPORTED_MODULE_0__[/* useState */ "h"])(stateName, () => false);
  } else {
    state = Object(_app__WEBPACK_IMPORTED_MODULE_0__[/* ref */ "e"])(false);
  }

  const isOpen = Object(_app__WEBPACK_IMPORTED_MODULE_0__[/* computed */ "b"])(() => state.value);

  const switchState = to => {
    state.value = typeof to === 'undefined' ? !state.value : !!to;
  };

  return {
    isOpen,
    switchState
  };
};

/***/ }),

/***/ 62:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(64);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add CSS to SSR context
var add = __webpack_require__(12).default;
module.exports.__inject__ = function (context) {
  add("5e63ec8a", content, true, context);
};

/***/ }),

/***/ 63:
/***/ (function(module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _node_modules_vue_style_loader_index_js_ref_8_oneOf_1_0_node_modules_nuxt_postcss8_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_nuxt_postcss8_node_modules_postcss_loader_dist_cjs_js_ref_8_oneOf_1_2_node_modules_sass_loader_dist_cjs_js_ref_8_oneOf_1_3_node_modules_nuxt_components_dist_loader_js_ref_1_0_node_modules_vue_loader_lib_index_js_vue_loader_options_Test1_vue_vue_type_style_index_0_id_317a2b85_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(62);
/* harmony reexport (unknown) */ for(var __WEBPACK_IMPORT_KEY__ in _node_modules_vue_style_loader_index_js_ref_8_oneOf_1_0_node_modules_nuxt_postcss8_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_nuxt_postcss8_node_modules_postcss_loader_dist_cjs_js_ref_8_oneOf_1_2_node_modules_sass_loader_dist_cjs_js_ref_8_oneOf_1_3_node_modules_nuxt_components_dist_loader_js_ref_1_0_node_modules_vue_loader_lib_index_js_vue_loader_options_Test1_vue_vue_type_style_index_0_id_317a2b85_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0__) if(["default"].indexOf(__WEBPACK_IMPORT_KEY__) < 0) (function(key) { __webpack_require__.d(__webpack_exports__, key, function() { return _node_modules_vue_style_loader_index_js_ref_8_oneOf_1_0_node_modules_nuxt_postcss8_node_modules_css_loader_dist_cjs_js_ref_8_oneOf_1_1_node_modules_vue_loader_lib_loaders_stylePostLoader_js_node_modules_nuxt_postcss8_node_modules_postcss_loader_dist_cjs_js_ref_8_oneOf_1_2_node_modules_sass_loader_dist_cjs_js_ref_8_oneOf_1_3_node_modules_nuxt_components_dist_loader_js_ref_1_0_node_modules_vue_loader_lib_index_js_vue_loader_options_Test1_vue_vue_type_style_index_0_id_317a2b85_lang_scss_scoped_true___WEBPACK_IMPORTED_MODULE_0__[key]; }); }(__WEBPACK_IMPORT_KEY__));


/***/ }),

/***/ 64:
/***/ (function(module, exports, __webpack_require__) {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(11);
var ___CSS_LOADER_EXPORT___ = ___CSS_LOADER_API_IMPORT___(function(i){return i[1]});
// Module
___CSS_LOADER_EXPORT___.push([module.i, ".test[data-v-317a2b85]{transform:scale(1.5);transform-origin:left center}", ""]);
// Exports
___CSS_LOADER_EXPORT___.locals = {};
module.exports = ___CSS_LOADER_EXPORT___;


/***/ }),

/***/ 65:
/***/ (function(module, __webpack_exports__, __webpack_require__) {
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// CONCATENATED MODULE: ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/@nuxt/components/dist/loader.js??ref--1-0!./node_modules/vue-loader/lib??vue-loader-options!./components/Test1.vue?vue&type=template&id=317a2b85&scoped=true&
var render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',[_vm._ssrNode(_vm._ssrEscape(_vm._s(_vm.testState)+" -- "+_vm._s(_vm.shared)+" -- "+_vm._s(_vm.isOpen ? 'open' : 'closed')))])};
var staticRenderFns = [];


// CONCATENATED MODULE: ./components/Test1.vue?vue&type=template&id=317a2b85&scoped=true&

// EXTERNAL MODULE: ./composables/test.js
var test = __webpack_require__(60);

// EXTERNAL MODULE: ./node_modules/@nuxt/bridge/dist/runtime/index.mjs + 6 modules
var runtime = __webpack_require__(3);

// EXTERNAL MODULE: ./composables/useUIState.js
var useUIState = __webpack_require__(61);

// CONCATENATED MODULE: ./node_modules/babel-loader/lib??ref--3-0!./node_modules/@nuxt/components/dist/loader.js??ref--1-0!./node_modules/vue-loader/lib??vue-loader-options!./components/Test1.vue?vue&type=script&lang=js&
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
    Object(runtime["d" /* onMounted */])(() => {
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
  
  var style0 = __webpack_require__(63);
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
  "29defc44"
  
);

/* harmony default export */ __webpack_exports__["default"] = (component.exports);

/***/ })

};

const test1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/_mergeNamespaces({
  __proto__: null,
  'default': test1$1,
  ids: ids,
  modules: modules
}, [test1$1]));

export { test1 as t };
