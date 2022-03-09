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

var test2$1 = {};

var ids = test2$1.ids = [3];
var modules = test2$1.modules = {

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

/***/ 66:
/***/ (function(module, __webpack_exports__, __webpack_require__) {
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// CONCATENATED MODULE: ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/@nuxt/components/dist/loader.js??ref--1-0!./node_modules/vue-loader/lib??vue-loader-options!./components/Test2.vue?vue&type=template&id=3e70295e&scoped=true&
var render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',[_vm._ssrNode(_vm._ssrEscape(_vm._s(_vm.testState)+" ")+"<span data-v-3e70295e>click me</span>")])};
var staticRenderFns = [];


// CONCATENATED MODULE: ./components/Test2.vue?vue&type=template&id=3e70295e&scoped=true&

// EXTERNAL MODULE: ./composables/test.js
var test = __webpack_require__(60);

// EXTERNAL MODULE: ./node_modules/@nuxt/bridge/dist/runtime/index.mjs + 6 modules
var runtime = __webpack_require__(3);

// EXTERNAL MODULE: ./composables/useUIState.js
var useUIState = __webpack_require__(61);

// CONCATENATED MODULE: ./node_modules/babel-loader/lib??ref--3-0!./node_modules/@nuxt/components/dist/loader.js??ref--1-0!./node_modules/vue-loader/lib??vue-loader-options!./components/Test2.vue?vue&type=script&lang=js&
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

    Object(runtime["d" /* onMounted */])(() => {
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
  "29ed13c5"
  
);

/* harmony default export */ __webpack_exports__["default"] = (component.exports);

/***/ })

};

const test2 = /*#__PURE__*/Object.freeze(/*#__PURE__*/_mergeNamespaces({
  __proto__: null,
  'default': test2$1,
  ids: ids,
  modules: modules
}, [test2$1]));

export { test2 as t };
