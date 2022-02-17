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

/***/ 59:
/***/ (function(module, __webpack_exports__, __webpack_require__) {
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return useTest; });
/* harmony import */ var _app__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(4);

const shared = Object(_app__WEBPACK_IMPORTED_MODULE_0__[/* ref */ "c"])('test');
const useTest = () => {
  return {
    state: Object(_app__WEBPACK_IMPORTED_MODULE_0__[/* useState */ "f"])('test', () => 'something'),
    shared
  };
};

/***/ }),

/***/ 61:
/***/ (function(module, __webpack_exports__, __webpack_require__) {
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// CONCATENATED MODULE: ./node_modules/unplugin/dist/webpack/loaders/transform.js??ref--31-0!./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/@nuxt/components/dist/loader.js??ref--1-0!./node_modules/vue-loader/lib??vue-loader-options!./node_modules/unplugin/dist/webpack/loaders/transform.js??ref--30-0!./components/Test2.vue?vue&type=template&id=ca275d90&scoped=true&
var render = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',[_vm._ssrNode(_vm._ssrEscape(_vm._s(_vm.testState)))])};
var staticRenderFns = [];


// CONCATENATED MODULE: ./components/Test2.vue?vue&type=template&id=ca275d90&scoped=true&

// EXTERNAL MODULE: ./composables/test.js
var test = __webpack_require__(59);

// EXTERNAL MODULE: ./node_modules/@nuxt/bridge/dist/runtime/index.mjs + 5 modules
var runtime = __webpack_require__(4);

// CONCATENATED MODULE: ./node_modules/unplugin/dist/webpack/loaders/transform.js??ref--31-0!./node_modules/babel-loader/lib??ref--3-0!./node_modules/@nuxt/components/dist/loader.js??ref--1-0!./node_modules/vue-loader/lib??vue-loader-options!./node_modules/unplugin/dist/webpack/loaders/transform.js??ref--30-0!./components/Test2.vue?vue&type=script&lang=js&
//
//
//
//


/* harmony default export */ var Test2vue_type_script_lang_js_ = ({
  setup() {
    const {
      state: testState
    } = Object(test["a" /* useTest */])();
    Object(runtime["b" /* onMounted */])(() => {
      setTimeout(() => {
        testState.value = 'something else 2';
      }, 10000);
    });
    return {
      testState
    };
  }

});
// CONCATENATED MODULE: ./components/Test2.vue?vue&type=script&lang=js&
 /* harmony default export */ var components_Test2vue_type_script_lang_js_ = (Test2vue_type_script_lang_js_); 
// EXTERNAL MODULE: ./node_modules/vue-loader/lib/runtime/componentNormalizer.js
var componentNormalizer = __webpack_require__(3);

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
  "ca275d90",
  "249aac1c"
  
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
