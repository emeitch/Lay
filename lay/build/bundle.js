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
/******/ 	return __webpack_require__(__webpack_require__.s = 4);
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
/*!****************************!*\
  !*** ./src/proposition.js ***!
  \****************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _jssha = __webpack_require__(/*! jssha */ 3);

var _jssha2 = _interopRequireDefault(_jssha);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Proposition = function () {
  function Proposition(subject, relation, object, location) {
    _classCallCheck(this, Proposition);

    this.subject = subject;
    this.relation = relation;
    this.object = object;
    this.location = location;
  }

  _createClass(Proposition, [{
    key: "id",
    get: function get() {
      var str = JSON.stringify(this);
      var jssha = new _jssha2.default("SHA-256", "TEXT");
      jssha.update(str);
      var hash = jssha.getHash("HEX");
      return "urn:sha256:" + hash;
    }
  }]);

  return Proposition;
}();

exports.default = Proposition;

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

var _proposition = __webpack_require__(/*! ./proposition */ 1);

var _proposition2 = _interopRequireDefault(_proposition);

var _ontology = __webpack_require__(/*! ./ontology */ 5);

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
    value: function set(p) {
      this.propositions[p.id] = p;
    }
  }, {
    key: 'where',
    value: function where(cond) {
      var _this = this;

      var results = [];

      // todo: 線形探索になっているので高速化する
      for (var id in this.propositions) {
        if (this.propositions.hasOwnProperty(id)) {
          (function () {
            var p = _this.propositions[id];

            var keys = Object.keys(cond);
            if (keys.every(function (k) {
              return JSON.stringify(p[k]) == JSON.stringify(cond[k]);
            })) {
              results.push(p);
            }
          })();
        }
      }

      return results;
    }
  }, {
    key: 'addProposition',
    value: function addProposition(subj, rel, obj, loc, tid) {
      var p = new _proposition2.default(subj, rel, obj, loc);
      this.set(p);
      var t = new _proposition2.default(p.id, _ontology.transaction, tid);
      this.set(t);
      return p;
    }
  }, {
    key: 'transaction',
    value: function transaction(block) {
      // todo: アトミックな操作に修正する
      var tid = new _uuid2.default();
      var p = new _proposition2.default(tid, _ontology.transactionTime, new Date());
      this.set(p);
      return block(tid);
    }
  }, {
    key: 'add',
    value: function add(subj, rel, obj, loc) {
      var _this2 = this;

      return this.transaction(function (tid) {
        return _this2.addProposition(subj, rel, obj, loc, tid);
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
/*!****************************!*\
  !*** ./~/jssha/src/sha.js ***!
  \****************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var __WEBPACK_AMD_DEFINE_RESULT__;/*
 A JavaScript implementation of the SHA family of hashes, as
 defined in FIPS PUB 180-4 and FIPS PUB 202, as well as the corresponding
 HMAC implementation as defined in FIPS PUB 198a

 Copyright Brian Turek 2008-2017
 Distributed under the BSD License
 See http://caligatio.github.com/jsSHA/ for more information

 Several functions taken from Paul Johnston
*/

(function (Y) {
  function C(b, a, c) {
    var e = 0,
        h = [],
        n = 0,
        g,
        l,
        d,
        f,
        m,
        q,
        u,
        r,
        I = !1,
        v = [],
        w = [],
        t,
        y = !1,
        z = !1,
        x = -1;c = c || {};g = c.encoding || "UTF8";t = c.numRounds || 1;if (t !== parseInt(t, 10) || 1 > t) throw Error("numRounds must a integer >= 1");if ("SHA-1" === b) m = 512, q = K, u = Z, f = 160, r = function r(a) {
      return a.slice();
    };else if (0 === b.lastIndexOf("SHA-", 0)) {
      if (q = function q(a, c) {
        return L(a, c, b);
      }, u = function u(a, c, h, e) {
        var k, f;if ("SHA-224" === b || "SHA-256" === b) k = (c + 65 >>> 9 << 4) + 15, f = 16;else if ("SHA-384" === b || "SHA-512" === b) k = (c + 129 >>> 10 << 5) + 31, f = 32;else throw Error("Unexpected error in SHA-2 implementation");for (; a.length <= k;) {
          a.push(0);
        }a[c >>> 5] |= 128 << 24 - c % 32;c = c + h;a[k] = c & 4294967295;a[k - 1] = c / 4294967296 | 0;h = a.length;for (c = 0; c < h; c += f) {
          e = L(a.slice(c, c + f), e, b);
        }if ("SHA-224" === b) a = [e[0], e[1], e[2], e[3], e[4], e[5], e[6]];else if ("SHA-256" === b) a = e;else if ("SHA-384" === b) a = [e[0].a, e[0].b, e[1].a, e[1].b, e[2].a, e[2].b, e[3].a, e[3].b, e[4].a, e[4].b, e[5].a, e[5].b];else if ("SHA-512" === b) a = [e[0].a, e[0].b, e[1].a, e[1].b, e[2].a, e[2].b, e[3].a, e[3].b, e[4].a, e[4].b, e[5].a, e[5].b, e[6].a, e[6].b, e[7].a, e[7].b];else throw Error("Unexpected error in SHA-2 implementation");return a;
      }, r = function r(a) {
        return a.slice();
      }, "SHA-224" === b) m = 512, f = 224;else if ("SHA-256" === b) m = 512, f = 256;else if ("SHA-384" === b) m = 1024, f = 384;else if ("SHA-512" === b) m = 1024, f = 512;else throw Error("Chosen SHA variant is not supported");
    } else if (0 === b.lastIndexOf("SHA3-", 0) || 0 === b.lastIndexOf("SHAKE", 0)) {
      var F = 6;q = D;r = function r(a) {
        var b = [],
            e;for (e = 0; 5 > e; e += 1) {
          b[e] = a[e].slice();
        }return b;
      };x = 1;if ("SHA3-224" === b) m = 1152, f = 224;else if ("SHA3-256" === b) m = 1088, f = 256;else if ("SHA3-384" === b) m = 832, f = 384;else if ("SHA3-512" === b) m = 576, f = 512;else if ("SHAKE128" === b) m = 1344, f = -1, F = 31, z = !0;else if ("SHAKE256" === b) m = 1088, f = -1, F = 31, z = !0;else throw Error("Chosen SHA variant is not supported");u = function u(a, b, e, c, h) {
        e = m;var k = F,
            f,
            g = [],
            n = e >>> 5,
            l = 0,
            d = b >>> 5;for (f = 0; f < d && b >= e; f += n) {
          c = D(a.slice(f, f + n), c), b -= e;
        }a = a.slice(f);for (b %= e; a.length < n;) {
          a.push(0);
        }f = b >>> 3;a[f >> 2] ^= k << f % 4 * 8;a[n - 1] ^= 2147483648;for (c = D(a, c); 32 * g.length < h;) {
          a = c[l % 5][l / 5 | 0];g.push(a.b);if (32 * g.length >= h) break;g.push(a.a);l += 1;0 === 64 * l % e && D(null, c);
        }return g;
      };
    } else throw Error("Chosen SHA variant is not supported");d = M(a, g, x);l = A(b);this.setHMACKey = function (a, c, h) {
      var k;if (!0 === I) throw Error("HMAC key already set");if (!0 === y) throw Error("Cannot set HMAC key after calling update");if (!0 === z) throw Error("SHAKE is not supported for HMAC");g = (h || {}).encoding || "UTF8";c = M(c, g, x)(a);a = c.binLen;c = c.value;k = m >>> 3;h = k / 4 - 1;if (k < a / 8) {
        for (c = u(c, a, 0, A(b), f); c.length <= h;) {
          c.push(0);
        }c[h] &= 4294967040;
      } else if (k > a / 8) {
        for (; c.length <= h;) {
          c.push(0);
        }c[h] &= 4294967040;
      }for (a = 0; a <= h; a += 1) {
        v[a] = c[a] ^ 909522486, w[a] = c[a] ^ 1549556828;
      }l = q(v, l);e = m;I = !0;
    };this.update = function (a) {
      var b,
          c,
          k,
          f = 0,
          g = m >>> 5;b = d(a, h, n);a = b.binLen;c = b.value;b = a >>> 5;for (k = 0; k < b; k += g) {
        f + m <= a && (l = q(c.slice(k, k + g), l), f += m);
      }e += f;h = c.slice(f >>> 5);n = a % m;y = !0;
    };this.getHash = function (a, c) {
      var k, g, d, m;if (!0 === I) throw Error("Cannot call getHash after setting HMAC key");d = N(c);if (!0 === z) {
        if (-1 === d.shakeLen) throw Error("shakeLen must be specified in options");
        f = d.shakeLen;
      }switch (a) {case "HEX":
          k = function k(a) {
            return O(a, f, x, d);
          };break;case "B64":
          k = function k(a) {
            return P(a, f, x, d);
          };break;case "BYTES":
          k = function k(a) {
            return Q(a, f, x);
          };break;case "ARRAYBUFFER":
          try {
            g = new ArrayBuffer(0);
          } catch (p) {
            throw Error("ARRAYBUFFER not supported by this environment");
          }k = function k(a) {
            return R(a, f, x);
          };break;default:
          throw Error("format must be HEX, B64, BYTES, or ARRAYBUFFER");}m = u(h.slice(), n, e, r(l), f);for (g = 1; g < t; g += 1) {
        !0 === z && 0 !== f % 32 && (m[m.length - 1] &= 16777215 >>> 24 - f % 32), m = u(m, f, 0, A(b), f);
      }return k(m);
    };this.getHMAC = function (a, c) {
      var k, g, d, p;if (!1 === I) throw Error("Cannot call getHMAC without first setting HMAC key");d = N(c);switch (a) {case "HEX":
          k = function k(a) {
            return O(a, f, x, d);
          };break;case "B64":
          k = function k(a) {
            return P(a, f, x, d);
          };break;case "BYTES":
          k = function k(a) {
            return Q(a, f, x);
          };break;case "ARRAYBUFFER":
          try {
            k = new ArrayBuffer(0);
          } catch (v) {
            throw Error("ARRAYBUFFER not supported by this environment");
          }k = function k(a) {
            return R(a, f, x);
          };break;default:
          throw Error("outputFormat must be HEX, B64, BYTES, or ARRAYBUFFER");
      }g = u(h.slice(), n, e, r(l), f);p = q(w, A(b));p = u(g, f, m, p, f);return k(p);
    };
  }function c(b, a) {
    this.a = b;this.b = a;
  }function O(b, a, c, e) {
    var h = "";a /= 8;var n, g, d;d = -1 === c ? 3 : 0;for (n = 0; n < a; n += 1) {
      g = b[n >>> 2] >>> 8 * (d + n % 4 * c), h += "0123456789abcdef".charAt(g >>> 4 & 15) + "0123456789abcdef".charAt(g & 15);
    }return e.outputUpper ? h.toUpperCase() : h;
  }function P(b, a, c, e) {
    var h = "",
        n = a / 8,
        g,
        d,
        p,
        f;f = -1 === c ? 3 : 0;for (g = 0; g < n; g += 3) {
      for (d = g + 1 < n ? b[g + 1 >>> 2] : 0, p = g + 2 < n ? b[g + 2 >>> 2] : 0, p = (b[g >>> 2] >>> 8 * (f + g % 4 * c) & 255) << 16 | (d >>> 8 * (f + (g + 1) % 4 * c) & 255) << 8 | p >>> 8 * (f + (g + 2) % 4 * c) & 255, d = 0; 4 > d; d += 1) {
        8 * g + 6 * d <= a ? h += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(p >>> 6 * (3 - d) & 63) : h += e.b64Pad;
      }
    }return h;
  }function Q(b, a, c) {
    var e = "";a /= 8;var h, d, g;g = -1 === c ? 3 : 0;for (h = 0; h < a; h += 1) {
      d = b[h >>> 2] >>> 8 * (g + h % 4 * c) & 255, e += String.fromCharCode(d);
    }return e;
  }function R(b, a, c) {
    a /= 8;var e,
        h = new ArrayBuffer(a),
        d,
        g;g = new Uint8Array(h);d = -1 === c ? 3 : 0;for (e = 0; e < a; e += 1) {
      g[e] = b[e >>> 2] >>> 8 * (d + e % 4 * c) & 255;
    }return h;
  }function N(b) {
    var a = { outputUpper: !1, b64Pad: "=", shakeLen: -1 };b = b || {};
    a.outputUpper = b.outputUpper || !1;!0 === b.hasOwnProperty("b64Pad") && (a.b64Pad = b.b64Pad);if (!0 === b.hasOwnProperty("shakeLen")) {
      if (0 !== b.shakeLen % 8) throw Error("shakeLen must be a multiple of 8");a.shakeLen = b.shakeLen;
    }if ("boolean" !== typeof a.outputUpper) throw Error("Invalid outputUpper formatting option");if ("string" !== typeof a.b64Pad) throw Error("Invalid b64Pad formatting option");return a;
  }function M(b, a, c) {
    switch (a) {case "UTF8":case "UTF16BE":case "UTF16LE":
        break;default:
        throw Error("encoding must be UTF8, UTF16BE, or UTF16LE");
    }switch (b) {case "HEX":
        b = function b(a, _b, d) {
          var g = a.length,
              l,
              p,
              f,
              m,
              q,
              u;if (0 !== g % 2) throw Error("String of HEX type must be in byte increments");_b = _b || [0];d = d || 0;q = d >>> 3;u = -1 === c ? 3 : 0;for (l = 0; l < g; l += 2) {
            p = parseInt(a.substr(l, 2), 16);if (isNaN(p)) throw Error("String of HEX type contains invalid characters");m = (l >>> 1) + q;for (f = m >>> 2; _b.length <= f;) {
              _b.push(0);
            }_b[f] |= p << 8 * (u + m % 4 * c);
          }return { value: _b, binLen: 4 * g + d };
        };break;case "TEXT":
        b = function b(_b2, h, d) {
          var g,
              l,
              p = 0,
              f,
              m,
              q,
              u,
              r,
              t;h = h || [0];d = d || 0;q = d >>> 3;if ("UTF8" === a) for (t = -1 === c ? 3 : 0, f = 0; f < _b2.length; f += 1) {
            for (g = _b2.charCodeAt(f), l = [], 128 > g ? l.push(g) : 2048 > g ? (l.push(192 | g >>> 6), l.push(128 | g & 63)) : 55296 > g || 57344 <= g ? l.push(224 | g >>> 12, 128 | g >>> 6 & 63, 128 | g & 63) : (f += 1, g = 65536 + ((g & 1023) << 10 | _b2.charCodeAt(f) & 1023), l.push(240 | g >>> 18, 128 | g >>> 12 & 63, 128 | g >>> 6 & 63, 128 | g & 63)), m = 0; m < l.length; m += 1) {
              r = p + q;for (u = r >>> 2; h.length <= u;) {
                h.push(0);
              }h[u] |= l[m] << 8 * (t + r % 4 * c);p += 1;
            }
          } else if ("UTF16BE" === a || "UTF16LE" === a) for (t = -1 === c ? 2 : 0, f = 0; f < _b2.length; f += 1) {
            g = _b2.charCodeAt(f);"UTF16LE" === a && (m = g & 255, g = m << 8 | g >>> 8);r = p + q;for (u = r >>> 2; h.length <= u;) {
              h.push(0);
            }h[u] |= g << 8 * (t + r % 4 * c);p += 2;
          }return { value: h, binLen: 8 * p + d };
        };break;case "B64":
        b = function b(a, _b3, d) {
          var g = 0,
              l,
              p,
              f,
              m,
              q,
              u,
              r,
              t;if (-1 === a.search(/^[a-zA-Z0-9=+\/]+$/)) throw Error("Invalid character in base-64 string");p = a.indexOf("=");a = a.replace(/\=/g, "");if (-1 !== p && p < a.length) throw Error("Invalid '=' found in base-64 string");_b3 = _b3 || [0];d = d || 0;u = d >>> 3;t = -1 === c ? 3 : 0;for (p = 0; p < a.length; p += 4) {
            q = a.substr(p, 4);for (f = m = 0; f < q.length; f += 1) {
              l = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".indexOf(q[f]), m |= l << 18 - 6 * f;
            }for (f = 0; f < q.length - 1; f += 1) {
              r = g + u;for (l = r >>> 2; _b3.length <= l;) {
                _b3.push(0);
              }_b3[l] |= (m >>> 16 - 8 * f & 255) << 8 * (t + r % 4 * c);g += 1;
            }
          }return { value: _b3, binLen: 8 * g + d };
        };break;case "BYTES":
        b = function b(a, _b4, d) {
          var g, l, p, f, m, q;_b4 = _b4 || [0];d = d || 0;p = d >>> 3;q = -1 === c ? 3 : 0;for (l = 0; l < a.length; l += 1) {
            g = a.charCodeAt(l), m = l + p, f = m >>> 2, _b4.length <= f && _b4.push(0), _b4[f] |= g << 8 * (q + m % 4 * c);
          }return { value: _b4, binLen: 8 * a.length + d };
        };break;case "ARRAYBUFFER":
        try {
          b = new ArrayBuffer(0);
        } catch (e) {
          throw Error("ARRAYBUFFER not supported by this environment");
        }b = function b(a, _b5, d) {
          var g, l, p, f, m, q;_b5 = _b5 || [0];d = d || 0;l = d >>> 3;m = -1 === c ? 3 : 0;q = new Uint8Array(a);for (g = 0; g < a.byteLength; g += 1) {
            f = g + l, p = f >>> 2, _b5.length <= p && _b5.push(0), _b5[p] |= q[g] << 8 * (m + f % 4 * c);
          }return { value: _b5, binLen: 8 * a.byteLength + d };
        };break;default:
        throw Error("format must be HEX, TEXT, B64, BYTES, or ARRAYBUFFER");}return b;
  }function y(b, a) {
    return b << a | b >>> 32 - a;
  }function S(b, a) {
    return 32 < a ? (a -= 32, new c(b.b << a | b.a >>> 32 - a, b.a << a | b.b >>> 32 - a)) : 0 !== a ? new c(b.a << a | b.b >>> 32 - a, b.b << a | b.a >>> 32 - a) : b;
  }function w(b, a) {
    return b >>> a | b << 32 - a;
  }function t(b, a) {
    var k = null,
        k = new c(b.a, b.b);return k = 32 >= a ? new c(k.a >>> a | k.b << 32 - a & 4294967295, k.b >>> a | k.a << 32 - a & 4294967295) : new c(k.b >>> a - 32 | k.a << 64 - a & 4294967295, k.a >>> a - 32 | k.b << 64 - a & 4294967295);
  }function T(b, a) {
    var k = null;return k = 32 >= a ? new c(b.a >>> a, b.b >>> a | b.a << 32 - a & 4294967295) : new c(0, b.a >>> a - 32);
  }function aa(b, a, c) {
    return b & a ^ ~b & c;
  }function ba(b, a, k) {
    return new c(b.a & a.a ^ ~b.a & k.a, b.b & a.b ^ ~b.b & k.b);
  }function U(b, a, c) {
    return b & a ^ b & c ^ a & c;
  }function ca(b, a, k) {
    return new c(b.a & a.a ^ b.a & k.a ^ a.a & k.a, b.b & a.b ^ b.b & k.b ^ a.b & k.b);
  }function da(b) {
    return w(b, 2) ^ w(b, 13) ^ w(b, 22);
  }function ea(b) {
    var a = t(b, 28),
        k = t(b, 34);b = t(b, 39);return new c(a.a ^ k.a ^ b.a, a.b ^ k.b ^ b.b);
  }function fa(b) {
    return w(b, 6) ^ w(b, 11) ^ w(b, 25);
  }function ga(b) {
    var a = t(b, 14),
        k = t(b, 18);b = t(b, 41);return new c(a.a ^ k.a ^ b.a, a.b ^ k.b ^ b.b);
  }function ha(b) {
    return w(b, 7) ^ w(b, 18) ^ b >>> 3;
  }function ia(b) {
    var a = t(b, 1),
        k = t(b, 8);b = T(b, 7);return new c(a.a ^ k.a ^ b.a, a.b ^ k.b ^ b.b);
  }function ja(b) {
    return w(b, 17) ^ w(b, 19) ^ b >>> 10;
  }function ka(b) {
    var a = t(b, 19),
        k = t(b, 61);
    b = T(b, 6);return new c(a.a ^ k.a ^ b.a, a.b ^ k.b ^ b.b);
  }function G(b, a) {
    var c = (b & 65535) + (a & 65535);return ((b >>> 16) + (a >>> 16) + (c >>> 16) & 65535) << 16 | c & 65535;
  }function la(b, a, c, e) {
    var h = (b & 65535) + (a & 65535) + (c & 65535) + (e & 65535);return ((b >>> 16) + (a >>> 16) + (c >>> 16) + (e >>> 16) + (h >>> 16) & 65535) << 16 | h & 65535;
  }function H(b, a, c, e, h) {
    var d = (b & 65535) + (a & 65535) + (c & 65535) + (e & 65535) + (h & 65535);return ((b >>> 16) + (a >>> 16) + (c >>> 16) + (e >>> 16) + (h >>> 16) + (d >>> 16) & 65535) << 16 | d & 65535;
  }function ma(b, a) {
    var d, e, h;d = (b.b & 65535) + (a.b & 65535);e = (b.b >>> 16) + (a.b >>> 16) + (d >>> 16);h = (e & 65535) << 16 | d & 65535;d = (b.a & 65535) + (a.a & 65535) + (e >>> 16);e = (b.a >>> 16) + (a.a >>> 16) + (d >>> 16);return new c((e & 65535) << 16 | d & 65535, h);
  }function na(b, a, d, e) {
    var h, n, g;h = (b.b & 65535) + (a.b & 65535) + (d.b & 65535) + (e.b & 65535);n = (b.b >>> 16) + (a.b >>> 16) + (d.b >>> 16) + (e.b >>> 16) + (h >>> 16);g = (n & 65535) << 16 | h & 65535;h = (b.a & 65535) + (a.a & 65535) + (d.a & 65535) + (e.a & 65535) + (n >>> 16);n = (b.a >>> 16) + (a.a >>> 16) + (d.a >>> 16) + (e.a >>> 16) + (h >>> 16);return new c((n & 65535) << 16 | h & 65535, g);
  }function oa(b, a, d, e, h) {
    var n, g, l;n = (b.b & 65535) + (a.b & 65535) + (d.b & 65535) + (e.b & 65535) + (h.b & 65535);g = (b.b >>> 16) + (a.b >>> 16) + (d.b >>> 16) + (e.b >>> 16) + (h.b >>> 16) + (n >>> 16);l = (g & 65535) << 16 | n & 65535;n = (b.a & 65535) + (a.a & 65535) + (d.a & 65535) + (e.a & 65535) + (h.a & 65535) + (g >>> 16);g = (b.a >>> 16) + (a.a >>> 16) + (d.a >>> 16) + (e.a >>> 16) + (h.a >>> 16) + (n >>> 16);return new c((g & 65535) << 16 | n & 65535, l);
  }function B(b, a) {
    return new c(b.a ^ a.a, b.b ^ a.b);
  }function A(b) {
    var a = [],
        d;if ("SHA-1" === b) a = [1732584193, 4023233417, 2562383102, 271733878, 3285377520];else if (0 === b.lastIndexOf("SHA-", 0)) switch (a = [3238371032, 914150663, 812702999, 4144912697, 4290775857, 1750603025, 1694076839, 3204075428], d = [1779033703, 3144134277, 1013904242, 2773480762, 1359893119, 2600822924, 528734635, 1541459225], b) {case "SHA-224":
        break;case "SHA-256":
        a = d;break;case "SHA-384":
        a = [new c(3418070365, a[0]), new c(1654270250, a[1]), new c(2438529370, a[2]), new c(355462360, a[3]), new c(1731405415, a[4]), new c(41048885895, a[5]), new c(3675008525, a[6]), new c(1203062813, a[7])];break;case "SHA-512":
        a = [new c(d[0], 4089235720), new c(d[1], 2227873595), new c(d[2], 4271175723), new c(d[3], 1595750129), new c(d[4], 2917565137), new c(d[5], 725511199), new c(d[6], 4215389547), new c(d[7], 327033209)];break;default:
        throw Error("Unknown SHA variant");} else if (0 === b.lastIndexOf("SHA3-", 0) || 0 === b.lastIndexOf("SHAKE", 0)) for (b = 0; 5 > b; b += 1) {
      a[b] = [new c(0, 0), new c(0, 0), new c(0, 0), new c(0, 0), new c(0, 0)];
    } else throw Error("No SHA variants supported");return a;
  }function K(b, a) {
    var c = [],
        e,
        d,
        n,
        g,
        l,
        p,
        f;e = a[0];d = a[1];n = a[2];g = a[3];l = a[4];for (f = 0; 80 > f; f += 1) {
      c[f] = 16 > f ? b[f] : y(c[f - 3] ^ c[f - 8] ^ c[f - 14] ^ c[f - 16], 1), p = 20 > f ? H(y(e, 5), d & n ^ ~d & g, l, 1518500249, c[f]) : 40 > f ? H(y(e, 5), d ^ n ^ g, l, 1859775393, c[f]) : 60 > f ? H(y(e, 5), U(d, n, g), l, 2400959708, c[f]) : H(y(e, 5), d ^ n ^ g, l, 3395469782, c[f]), l = g, g = n, n = y(d, 30), d = e, e = p;
    }a[0] = G(e, a[0]);a[1] = G(d, a[1]);a[2] = G(n, a[2]);a[3] = G(g, a[3]);a[4] = G(l, a[4]);return a;
  }function Z(b, a, c, e) {
    var d;for (d = (a + 65 >>> 9 << 4) + 15; b.length <= d;) {
      b.push(0);
    }b[a >>> 5] |= 128 << 24 - a % 32;a += c;b[d] = a & 4294967295;b[d - 1] = a / 4294967296 | 0;a = b.length;for (d = 0; d < a; d += 16) {
      e = K(b.slice(d, d + 16), e);
    }return e;
  }function L(b, a, k) {
    var e,
        h,
        n,
        g,
        l,
        p,
        f,
        m,
        q,
        u,
        r,
        t,
        v,
        w,
        y,
        A,
        z,
        x,
        F,
        B,
        C,
        D,
        E = [],
        J;if ("SHA-224" === k || "SHA-256" === k) u = 64, t = 1, D = Number, v = G, w = la, y = H, A = ha, z = ja, x = da, F = fa, C = U, B = aa, J = d;else if ("SHA-384" === k || "SHA-512" === k) u = 80, t = 2, D = c, v = ma, w = na, y = oa, A = ia, z = ka, x = ea, F = ga, C = ca, B = ba, J = V;else throw Error("Unexpected error in SHA-2 implementation");k = a[0];e = a[1];h = a[2];n = a[3];g = a[4];l = a[5];p = a[6];f = a[7];for (r = 0; r < u; r += 1) {
      16 > r ? (q = r * t, m = b.length <= q ? 0 : b[q], q = b.length <= q + 1 ? 0 : b[q + 1], E[r] = new D(m, q)) : E[r] = w(z(E[r - 2]), E[r - 7], A(E[r - 15]), E[r - 16]), m = y(f, F(g), B(g, l, p), J[r], E[r]), q = v(x(k), C(k, e, h)), f = p, p = l, l = g, g = v(n, m), n = h, h = e, e = k, k = v(m, q);
    }a[0] = v(k, a[0]);a[1] = v(e, a[1]);a[2] = v(h, a[2]);a[3] = v(n, a[3]);a[4] = v(g, a[4]);a[5] = v(l, a[5]);a[6] = v(p, a[6]);a[7] = v(f, a[7]);return a;
  }function D(b, a) {
    var d,
        e,
        h,
        n,
        g = [],
        l = [];if (null !== b) for (e = 0; e < b.length; e += 2) {
      a[(e >>> 1) % 5][(e >>> 1) / 5 | 0] = B(a[(e >>> 1) % 5][(e >>> 1) / 5 | 0], new c(b[e + 1], b[e]));
    }for (d = 0; 24 > d; d += 1) {
      n = A("SHA3-");for (e = 0; 5 > e; e += 1) {
        h = a[e][0];var p = a[e][1],
            f = a[e][2],
            m = a[e][3],
            q = a[e][4];g[e] = new c(h.a ^ p.a ^ f.a ^ m.a ^ q.a, h.b ^ p.b ^ f.b ^ m.b ^ q.b);
      }for (e = 0; 5 > e; e += 1) {
        l[e] = B(g[(e + 4) % 5], S(g[(e + 1) % 5], 1));
      }for (e = 0; 5 > e; e += 1) {
        for (h = 0; 5 > h; h += 1) {
          a[e][h] = B(a[e][h], l[e]);
        }
      }for (e = 0; 5 > e; e += 1) {
        for (h = 0; 5 > h; h += 1) {
          n[h][(2 * e + 3 * h) % 5] = S(a[e][h], W[e][h]);
        }
      }for (e = 0; 5 > e; e += 1) {
        for (h = 0; 5 > h; h += 1) {
          a[e][h] = B(n[e][h], new c(~n[(e + 1) % 5][h].a & n[(e + 2) % 5][h].a, ~n[(e + 1) % 5][h].b & n[(e + 2) % 5][h].b));
        }
      }a[0][0] = B(a[0][0], X[d]);
    }return a;
  }var d, V, W, X;d = [1116352408, 1899447441, 3049323471, 3921009573, 961987163, 1508970993, 2453635748, 2870763221, 3624381080, 310598401, 607225278, 1426881987, 1925078388, 2162078206, 2614888103, 3248222580, 3835390401, 4022224774, 264347078, 604807628, 770255983, 1249150122, 1555081692, 1996064986, 2554220882, 2821834349, 2952996808, 3210313671, 3336571891, 3584528711, 113926993, 338241895, 666307205, 773529912, 1294757372, 1396182291, 1695183700, 1986661051, 2177026350, 2456956037, 2730485921, 2820302411, 3259730800, 3345764771, 3516065817, 3600352804, 4094571909, 275423344, 430227734, 506948616, 659060556, 883997877, 958139571, 1322822218, 1537002063, 1747873779, 1955562222, 2024104815, 2227730452, 2361852424, 2428436474, 2756734187, 3204031479, 3329325298];V = [new c(d[0], 3609767458), new c(d[1], 602891725), new c(d[2], 3964484399), new c(d[3], 2173295548), new c(d[4], 4081628472), new c(d[5], 3053834265), new c(d[6], 2937671579), new c(d[7], 3664609560), new c(d[8], 2734883394), new c(d[9], 1164996542), new c(d[10], 1323610764), new c(d[11], 3590304994), new c(d[12], 4068182383), new c(d[13], 991336113), new c(d[14], 633803317), new c(d[15], 3479774868), new c(d[16], 2666613458), new c(d[17], 944711139), new c(d[18], 2341262773), new c(d[19], 2007800933), new c(d[20], 1495990901), new c(d[21], 1856431235), new c(d[22], 3175218132), new c(d[23], 2198950837), new c(d[24], 3999719339), new c(d[25], 766784016), new c(d[26], 2566594879), new c(d[27], 3203337956), new c(d[28], 1034457026), new c(d[29], 2466948901), new c(d[30], 3758326383), new c(d[31], 168717936), new c(d[32], 1188179964), new c(d[33], 1546045734), new c(d[34], 1522805485), new c(d[35], 2643833823), new c(d[36], 2343527390), new c(d[37], 1014477480), new c(d[38], 1206759142), new c(d[39], 344077627), new c(d[40], 1290863460), new c(d[41], 3158454273), new c(d[42], 3505952657), new c(d[43], 106217008), new c(d[44], 3606008344), new c(d[45], 1432725776), new c(d[46], 1467031594), new c(d[47], 851169720), new c(d[48], 3100823752), new c(d[49], 1363258195), new c(d[50], 3750685593), new c(d[51], 3785050280), new c(d[52], 3318307427), new c(d[53], 3812723403), new c(d[54], 2003034995), new c(d[55], 3602036899), new c(d[56], 1575990012), new c(d[57], 1125592928), new c(d[58], 2716904306), new c(d[59], 442776044), new c(d[60], 593698344), new c(d[61], 3733110249), new c(d[62], 2999351573), new c(d[63], 3815920427), new c(3391569614, 3928383900), new c(3515267271, 566280711), new c(3940187606, 3454069534), new c(4118630271, 4000239992), new c(116418474, 1914138554), new c(174292421, 2731055270), new c(289380356, 3203993006), new c(460393269, 320620315), new c(685471733, 587496836), new c(852142971, 1086792851), new c(1017036298, 365543100), new c(1126000580, 2618297676), new c(1288033470, 3409855158), new c(1501505948, 4234509866), new c(1607167915, 987167468), new c(1816402316, 1246189591)];X = [new c(0, 1), new c(0, 32898), new c(2147483648, 32906), new c(2147483648, 2147516416), new c(0, 32907), new c(0, 2147483649), new c(2147483648, 2147516545), new c(2147483648, 32777), new c(0, 138), new c(0, 136), new c(0, 2147516425), new c(0, 2147483658), new c(0, 2147516555), new c(2147483648, 139), new c(2147483648, 32905), new c(2147483648, 32771), new c(2147483648, 32770), new c(2147483648, 128), new c(0, 32778), new c(2147483648, 2147483658), new c(2147483648, 2147516545), new c(2147483648, 32896), new c(0, 2147483649), new c(2147483648, 2147516424)];W = [[0, 36, 3, 41, 18], [1, 44, 10, 45, 2], [62, 6, 43, 15, 61], [28, 55, 25, 21, 56], [27, 20, 39, 8, 14]]; true ? !(__WEBPACK_AMD_DEFINE_RESULT__ = function () {
    return C;
  }.call(exports, __webpack_require__, exports, module),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)) : "undefined" !== typeof exports ? ("undefined" !== typeof module && module.exports && (module.exports = C), exports = C) : Y.jsSHA = C;
})(undefined);

/***/ }),
/* 4 */
/* unknown exports provided */
/* all exports used */
/*!********************!*\
  !*** ./src/app.js ***!
  \********************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _uuid = __webpack_require__(/*! ./uuid */ 0);

var _uuid2 = _interopRequireDefault(_uuid);

var _proposition = __webpack_require__(/*! ./proposition */ 1);

var _proposition2 = _interopRequireDefault(_proposition);

var _store = __webpack_require__(/*! ./store */ 2);

var _store2 = _interopRequireDefault(_store);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

console.log("Lay: Hello, world!");

/***/ }),
/* 5 */
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
exports.transactionTime = exports.transaction = undefined;

var _uuid = __webpack_require__(/*! ./uuid */ 0);

var _uuid2 = _interopRequireDefault(_uuid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var transaction = exports.transaction = new _uuid2.default();

var transactionTime = exports.transactionTime = new _uuid2.default();

/***/ })
/******/ ]);
//# sourceMappingURL=bundle.js.map