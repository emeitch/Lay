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
/* 1 */,
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

var _proposition = __webpack_require__(/*! ./proposition */ 5);

var _proposition2 = _interopRequireDefault(_proposition);

var _ontology = __webpack_require__(/*! ./ontology */ 4);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Store = function () {
  function Store() {
    _classCallCheck(this, Store);

    this.propositions = {};
  }

  _createClass(Store, [{
    key: 'get',
    value: function get(id) {
      return this.propositions[id];
    }
  }, {
    key: 'set',
    value: function set(id, p) {
      this.propositions[id] = p;
    }
  }, {
    key: 'append',
    value: function append(p) {
      this.set(p.id, p);
    }
  }, {
    key: 'addProposition',
    value: function addProposition(subj, rel, obj, tran, holder) {
      var p = new _proposition2.default(subj, rel, obj, tran, holder);
      this.append(p);
      return p;
    }
  }, {
    key: 'transaction',
    value: function transaction(block) {
      // todo: アトミックな操作に修正する
      var tran = new _uuid2.default();
      this.addProposition(tran, _ontology.transactionTimeUUID, new Date(), tran);
      return block(tran);
    }
  }, {
    key: 'add',
    value: function add(subj, rel, obj, holder) {
      var _this = this;

      return this.transaction(function (tran) {
        return _this.addProposition(subj, rel, obj, tran, holder);
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

var _proposition = __webpack_require__(/*! ./proposition */ 5);

var _proposition2 = _interopRequireDefault(_proposition);

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

/***/ }),
/* 5 */
/* unknown exports provided */
/* all exports used */
/*!****************************!*\
  !*** ./src/proposition.js ***!
  \****************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _uuid = __webpack_require__(/*! ./uuid */ 0);

var _uuid2 = _interopRequireDefault(_uuid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Proposition = function Proposition(subject, relation, object, transaction, holder) {
  var id = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : new _uuid2.default();

  _classCallCheck(this, Proposition);

  this.id = id;

  this.subject = subject;
  this.relation = relation;
  this.object = object;

  this.transaction = transaction;

  this.holder = holder;
};

exports.default = Proposition;

/***/ })
/******/ ]);
//# sourceMappingURL=bundle.js.map