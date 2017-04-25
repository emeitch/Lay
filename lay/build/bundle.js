/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 12);
/******/ })
/************************************************************************/
/******/ ({

/***/ 12:
/* unknown exports provided */
/* all exports used */
/*!********************!*\
  !*** ./src/app.js ***!
  \********************/
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__uuid__ = __webpack_require__(/*! ./uuid */ 17);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__link__ = __webpack_require__(/*! ./link */ 19);



console.assert(__WEBPACK_IMPORTED_MODULE_0__uuid__["a" /* default */].generate().str.match(/^urn:uuid:.*$/));

const type = __WEBPACK_IMPORTED_MODULE_0__uuid__["a" /* default */].generate();
const from = __WEBPACK_IMPORTED_MODULE_0__uuid__["a" /* default */].generate();
const to = __WEBPACK_IMPORTED_MODULE_0__uuid__["a" /* default */].generate();
const ln = new __WEBPACK_IMPORTED_MODULE_1__link__["a" /* default */](type, from, to);
console.assert(ln.type == type);
console.assert(ln.from == from);
console.assert(ln.to == to);

console.log("all tests succeeded.");

/***/ }),

/***/ 17:
/* exports provided: default */
/* exports used: default */
/*!*********************!*\
  !*** ./src/uuid.js ***!
  \*********************/
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
class UUID {
  static generateUUIDString() {
    // UUID ver 4 / RFC 4122
    var uuid = "", i, random;
    for (i = 0; i < 32; i++) {
      random = Math.random() * 16 | 0;
      
      if (i == 8 || i == 12 || i == 16 || i == 20) {
        uuid += "-"
      }
      uuid += (i == 12 ? 4 : (i == 16 ? (random & 3 | 8) : random)).toString(16);
    }
    return uuid;
  }
  
  static uuid() {
    return "urn:uuid:" + this.generateUUIDString();
  }

  static generate() {
    return new this();
  }
  
  constructor() {
    this.str = this.constructor.uuid();
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = UUID;


/***/ }),

/***/ 19:
/* exports provided: default */
/* exports used: default */
/*!*********************!*\
  !*** ./src/link.js ***!
  \*********************/
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__uuid__ = __webpack_require__(/*! ./uuid */ 17);


class Link {
  constructor(type, from, to, id=__WEBPACK_IMPORTED_MODULE_0__uuid__["a" /* default */].generate()) {
    this.type = type;
    this.from = from;
    this.to = to;
    this.id = id;
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Link;


/***/ })

/******/ });
//# sourceMappingURL=bundle.js.map