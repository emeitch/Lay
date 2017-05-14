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
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/* unknown exports provided */
/* all exports used */
/*!*********************!*\
  !*** ./src/uuid.js ***!
  \*********************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var UUID = function () {
  _createClass(UUID, null, [{
    key: "generateUUIDString",
    value: function generateUUIDString() {
      // UUID ver 4 / RFC 4122
      var uuid = "",
          i,
          random;
      for (i = 0; i < 32; i++) {
        random = Math.random() * 16 | 0;

        if (i == 8 || i == 12 || i == 16 || i == 20) {
          uuid += "-";
        }
        uuid += (i == 12 ? 4 : i == 16 ? random & 3 | 8 : random).toString(16);
      }
      return uuid;
    }
  }]);

  function UUID() {
    _classCallCheck(this, UUID);

    this.origin = this.constructor.generateUUIDString();
  }

  _createClass(UUID, [{
    key: "toString",
    value: function toString() {
      return this.origin;
    }
  }, {
    key: "urn",
    get: function get() {
      return "urn:uuid:" + this.origin;
    }
  }]);

  return UUID;
}();

exports.default = UUID;

/***/ }),
/* 1 */
/* unknown exports provided */
/* all exports used */
/*!*********************!*\
  !*** ./src/link.js ***!
  \*********************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _uuid = __webpack_require__(/*! ./uuid */ 0);

var _uuid2 = _interopRequireDefault(_uuid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Link = function Link(type, from, to, place, transaction) {
  var id = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : new _uuid2.default();

  _classCallCheck(this, Link);

  this.id = id;
  this.type = type;
  this.from = from;
  this.to = to;
  this.in = place;
  this.transaction = transaction;
};

exports.default = Link;

/***/ }),
/* 2 */
/* unknown exports provided */
/* all exports used */
/*!**********************!*\
  !*** ./src/store.js ***!
  \**********************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _uuid = __webpack_require__(/*! ./uuid */ 0);

var _uuid2 = _interopRequireDefault(_uuid);

var _link = __webpack_require__(/*! ./link */ 1);

var _link2 = _interopRequireDefault(_link);

var _ontology = __webpack_require__(/*! ./ontology */ 4);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Store = function () {
  function Store() {
    _classCallCheck(this, Store);

    this.links = {};
  }

  _createClass(Store, [{
    key: 'get',
    value: function get(id) {
      return this.links[id];
    }
  }, {
    key: 'set',
    value: function set(id, link) {
      this.links[id] = link;
    }
  }, {
    key: 'append',
    value: function append(link) {
      this.set(link.id, link);
    }
  }, {
    key: 'addLink',
    value: function addLink(type, from, to, place, tid) {
      var link = new _link2.default(type, from, to, place, tid);
      this.append(link);
      return link;
    }
  }, {
    key: 'transaction',
    value: function transaction(block) {
      // todo: アトミックな操作に修正する
      var tid = new _uuid2.default();
      this.addLink(_ontology.transactionTimeUUID, tid, new Date(), undefined, tid);
      return block(tid);
    }
  }, {
    key: 'add',
    value: function add(type, from, to, place) {
      var _this = this;

      return this.transaction(function (tid) {
        return _this.addLink(type, from, to, place, tid);
      });
    }
  }]);

  return Store;
}();

exports.default = Store;

/***/ }),
/* 3 */
/* unknown exports provided */
/* all exports used */
/*!********************!*\
  !*** ./src/app.js ***!
  \********************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _uuid = __webpack_require__(/*! ./uuid */ 0);

var _uuid2 = _interopRequireDefault(_uuid);

var _link = __webpack_require__(/*! ./link */ 1);

var _link2 = _interopRequireDefault(_link);

var _store = __webpack_require__(/*! ./store */ 2);

var _store2 = _interopRequireDefault(_store);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

console.log("Lay: Hello, world!");

/***/ }),
/* 4 */
/* unknown exports provided */
/* all exports used */
/*!*************************!*\
  !*** ./src/ontology.js ***!
  \*************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.transactionTimeUUID = undefined;

var _uuid = __webpack_require__(/*! ./uuid */ 0);

var _uuid2 = _interopRequireDefault(_uuid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var transactionTimeUUID = exports.transactionTimeUUID = new _uuid2.default();

/***/ })
/******/ ]);
//# sourceMappingURL=bundle.js.map