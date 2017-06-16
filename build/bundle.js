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
    key: "toJSON",
    value: function toJSON() {
      return this.urn;
    }
  }, {
    key: "toString",
    value: function toString() {
      return this.urn;
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
/*!*************************!*\
  !*** ./src/ontology.js ***!
  \*************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.transactionTime = exports.transaction = exports.nameKey = exports.invalidate = undefined;

var _uuid = __webpack_require__(/*! ./uuid */ 0);

var _uuid2 = _interopRequireDefault(_uuid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var invalidate = exports.invalidate = new _uuid2.default();

var nameKey = exports.nameKey = new _uuid2.default();

var transaction = exports.transaction = new _uuid2.default();

var transactionTime = exports.transactionTime = new _uuid2.default();

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

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _uuid = __webpack_require__(/*! ./uuid */ 0);

var _uuid2 = _interopRequireDefault(_uuid);

var _log = __webpack_require__(/*! ./log */ 4);

var _log2 = _interopRequireDefault(_log);

var _obj = __webpack_require__(/*! ./obj */ 5);

var _obj2 = _interopRequireDefault(_obj);

var _ontology = __webpack_require__(/*! ./ontology */ 1);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Store = function () {
  function Store() {
    _classCallCheck(this, Store);

    this.logs = {};
    this.activeLogsCache = {};
    this.invalidationLogsCache = {};
  }

  _createClass(Store, [{
    key: 'getLog',
    value: function getLog(logid) {
      return this.logs[logid];
    }
  }, {
    key: 'findLogs',
    value: function findLogs(cond) {
      var _this = this;

      var logs = [];

      // todo: 線形探索になっているので高速化する
      for (var logid in this.logs) {
        if (this.logs.hasOwnProperty(logid)) {
          (function () {
            var log = _this.logs[logid];

            var keys = Object.keys(cond);
            if (keys.every(function (k) {
              return JSON.stringify(log[k]) == JSON.stringify(cond[k]);
            })) {
              logs.push(log);
            }
          })();
        }
      }

      return logs;
    }
  }, {
    key: 'cacheIndex',
    value: function cacheIndex(id, key) {
      return id + "__" + key;
    }
  }, {
    key: 'activeLogs',
    value: function activeLogs(id, key) {
      var at = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : new Date();

      var i = this.cacheIndex(id, key);
      var alogs = new Map(this.activeLogsCache[i]);
      var ilogs = new Map(this.invalidationLogsCache[i]);
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = ilogs[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var _step$value = _slicedToArray(_step.value, 2),
              _ = _step$value[0],
              ilog = _step$value[1];

          var log = alogs.get(ilog.id);
          if (log && (!ilog.at || ilog.at <= at)) {
            alogs.delete(ilog.id);
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return Array.from(alogs.values());
    }
  }, {
    key: 'activeLog',
    value: function activeLog(id, key) {
      var at = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : new Date();

      var actives = this.activeLogs(id, key, at);
      return actives[actives.length - 1];
    }
  }, {
    key: 'obj',
    value: function obj(id) {
      return new _obj2.default(this, id);
    }
  }, {
    key: 'transactionObj',
    value: function transactionObj(log) {
      var tlogs = this.findLogs({ id: log.logid, key: _ontology.transaction });

      if (tlogs.length > 1) {
        throw "too many transaction logs";
      }

      if (tlogs.length == 0) {
        return undefined;
      }

      var tlog = tlogs[tlogs.length - 1];
      var tid = tlog.val;
      return this.obj(tid);
    }
  }, {
    key: 'ref',
    value: function ref(name) {
      var logs = this.findLogs({ key: _ontology.nameKey, val: name });
      var log = logs[logs.length - 1];
      return log ? log.id : undefined;
    }
  }, {
    key: 'assign',
    value: function assign(name, id) {
      // todo: ユニーク制約をかけたい
      this.log(id, _ontology.nameKey, name);
    }
  }, {
    key: 'syncCache',
    value: function syncCache(log) {
      var i = this.cacheIndex(log.id, log.key);
      var al = this.activeLogsCache[i] || new Map();
      al.set(log.logid, log);
      this.activeLogsCache[i] = al;

      if (log.key == _ontology.invalidate) {
        var positive = this.getLog(log.id);
        var _i = this.cacheIndex(positive.id, positive.key);
        var il = this.invalidationLogsCache[_i] || new Map();
        il.set(log.logid, log);
        this.invalidationLogsCache[_i] = il;
      }
    }
  }, {
    key: 'doTransaction',
    value: function doTransaction(block) {
      var _this2 = this;

      // todo: アトミックな操作に修正する
      var addLog = function addLog(log) {
        _this2.logs[log.logid] = log;
        _this2.syncCache(log);
      };
      var tid = new _uuid2.default();
      var ttlog = new _log2.default(tid, _ontology.transactionTime, new Date());

      addLog(ttlog);

      var logWithTransaction = function logWithTransaction() {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        var log = new (Function.prototype.bind.apply(_log2.default, [null].concat(args)))();
        addLog(log);
        var tlog = new _log2.default(log.logid, _ontology.transaction, tid);
        addLog(tlog);
        return log;
      };
      return block(logWithTransaction);
    }
  }, {
    key: 'log',
    value: function log() {
      for (var _len2 = arguments.length, attrs = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        attrs[_key2] = arguments[_key2];
      }

      return this.doTransaction(function (logWithTransaction) {
        return logWithTransaction.apply(undefined, attrs);
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

var _store = __webpack_require__(/*! ./store */ 2);

var _store2 = _interopRequireDefault(_store);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

console.log("Lay: Hello, world!");

/***/ }),
/* 4 */
/* unknown exports provided */
/* all exports used */
/*!********************!*\
  !*** ./src/log.js ***!
  \********************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _uuid = __webpack_require__(/*! ./uuid */ 0);

var _uuid2 = _interopRequireDefault(_uuid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Log = function Log(id, key, val, at_, in_) {
  _classCallCheck(this, Log);

  if (!id) {
    throw "id is required";
  }

  if (!key) {
    throw "key is required";
  }

  this.logid = new _uuid2.default();
  this.id = id;
  this.key = key;
  this.val = val;
  this.at = at_;
  this.in = in_;
};

exports.default = Log;

/***/ }),
/* 5 */
/* unknown exports provided */
/* all exports used */
/*!********************!*\
  !*** ./src/obj.js ***!
  \********************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _uuid = __webpack_require__(/*! ./uuid */ 0);

var _uuid2 = _interopRequireDefault(_uuid);

var _ontology = __webpack_require__(/*! ../src/ontology */ 1);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Obj = function () {
  function Obj(store, id) {
    _classCallCheck(this, Obj);

    this.store = store;
    this.id = id;
  }

  _createClass(Obj, [{
    key: 'get',
    value: function get(key) {
      var log = this.store.activeLog(this.id, key);
      if (!log) {
        return undefined;
      }

      var val = log.val;
      if (val.constructor === _uuid2.default) {
        return this.store.obj(val);
      } else {
        return val;
      }
    }
  }]);

  return Obj;
}();

exports.default = Obj;

/***/ })
/******/ ]);
//# sourceMappingURL=bundle.js.map