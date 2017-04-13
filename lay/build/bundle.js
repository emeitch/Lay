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
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/* unknown exports provided */
/* all exports used */
/*!********************!*\
  !*** ./src/app.js ***!
  \********************/
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utils__ = __webpack_require__(/*! ./utils */ 5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__value__ = __webpack_require__(/*! ./value */ 7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__entity__ = __webpack_require__(/*! ./entity */ 6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__path__ = __webpack_require__(/*! ./path */ 8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__resource__ = __webpack_require__(/*! ./resource */ 9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__store__ = __webpack_require__(/*! ./store */ 10);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__todomvc__ = __webpack_require__(/*! ./todomvc */ 2);










// test suite
const store = new __WEBPACK_IMPORTED_MODULE_5__store__["a" /* default */]();

const p1 = store.post({
  _name: "Proto1",
  foo: 1,
  bar: 2,
  fiz: 9
});
const r2id = __WEBPACK_IMPORTED_MODULE_3__path__["a" /* default */].uuid();
const r1 = store.post({
  _proto: p1.path,
  foo: 3, 
  bar: 4,
  baz: new __WEBPACK_IMPORTED_MODULE_3__path__["a" /* default */](r2id)
});
const r2 = store.setState(r2id, {
  _proto: p1.path,
  foo: 5,
  bar: 6,
  baz: r1.path
});
const r3 = store.post({
  _proto: p1.path,
  foo: 5,
  bar: 6,
  baz: r1.path
});

// resource generation
console.assert(r1.path instanceof __WEBPACK_IMPORTED_MODULE_3__path__["a" /* default */]);
console.assert(r2.path instanceof __WEBPACK_IMPORTED_MODULE_3__path__["a" /* default */]);

// resource property access
console.assert(r1.follow("foo").equals(3));
console.assert(r1.follow("bar").equals(4));
console.assert(r2.follow("foo").equals(5));
console.assert(r2.follow("bar").equals(6));

// circular referencing
console.assert(r2.follow("baz").equals(r1));
console.assert(r2.follow("baz").follow("baz").equals(r2));
console.assert(r2.follow("baz").follow("baz").follow("baz").equals(r1));

// prototype definition
console.assert(r2.follow("_proto").equals(p1));
console.assert(r2.proto.equals(p1));
console.assert(r2.proto.name === "Proto1");

// get method returns raw path
console.assert(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["a" /* equals */])(store.getState("Proto1"), p1.get()));
// resource method resolves id reference
console.assert(store.follow("Proto1").equals(p1));

// prototype chain
console.assert(r2.follow("fiz").equals(9));

// equivalency
console.assert(r2.equals(r2));
console.assert(!r2.equals(r3));
console.assert(r2.equals(r2.get())); // state equivalency
console.assert(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["a" /* equals */])(r2.get(), r3.get()));
console.assert(!__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["a" /* equals */])(r2.get(),r1.get()));


// entity schema for composition
const k2 = "Proto2";
const p2 = store.post({
  _name: k2,
  foo: new __WEBPACK_IMPORTED_MODULE_2__entity__["a" /* default */]({
    bar: 3,
    baz: 4,
  }),
});
const r4 = store.post({
  _proto: new __WEBPACK_IMPORTED_MODULE_3__path__["a" /* default */](k2),
  foo: {
    baz: 5,
  },
  fiz: 9,
});

// prototype chain by entity
console.assert(r4.follow("foo").follow("bar").equals(3));
// parent entity access
console.assert(r4.follow("foo").parent.equals(r4));
// override child entity property
console.assert(r4.follow("foo").follow("baz").equals(5));
// get by path
console.assert(store.follow(new __WEBPACK_IMPORTED_MODULE_3__path__["a" /* default */](r4.path.top)).follow("foo").follow("baz").equals(5));
console.assert(store.follow(new __WEBPACK_IMPORTED_MODULE_3__path__["a" /* default */](r4.path.top, "foo")).follow("baz").equals(5));
console.assert(store.follow(new __WEBPACK_IMPORTED_MODULE_3__path__["a" /* default */](r4.path.top, "foo", "baz")).equals(5));

// update property
console.assert(r4.follow("fiz").equals(9));
r4.patch({fiz: 8});
console.assert(r4.follow("fiz").equals(8));

// update child property
r4.follow("foo").patch({baz: 6});
console.assert(r4.follow("foo").follow("baz").equals(6));

// update by state
r4.patch({
  fiz: 9,
});
console.assert(r4.follow("fiz").equals(9));

// update child by state
r4.follow("foo").patch({
  baz: 7,
});
console.assert(r4.follow("foo").follow("baz").equals(7));

// update parent and child by state
const oldFoo = r4.follow("foo");
r4.patch({
  fiz: 7,
  foo: {
    baz: 8,
  }
});
console.assert(r4.follow("fiz").equals(7));
console.assert(r4.follow("foo").follow("baz").equals(8));
console.assert(!__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["a" /* equals */])(r4.follow("foo").path, oldFoo.path)); // updated
console.assert(oldFoo.get()._parent === undefined);
console.assert(oldFoo.parent === undefined);

// update parent and child by state with child identifier
const fooPath = r4.follow("foo").path;
r4.patch({
  fiz: 6, 
  foo: {
    _uuid: fooPath.top,
    baz: 9,
  }
});
console.assert(r4.follow("fiz").equals(6));
console.assert(r4.follow("foo").follow("baz").equals(9));
console.assert(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["a" /* equals */])(r4.follow("foo").path, fooPath)); // not updated

// update proto's key name
console.assert(store.follow("Proto2"));
console.assert(!store.follow("Proto2dash"));
const k2dash = new __WEBPACK_IMPORTED_MODULE_3__path__["a" /* default */]("Proto2dash");
p2.patch({_name: k2dash.top});
console.assert(!store.follow("Proto2"));
console.assert(r4.proto.name === "Proto2dash");
console.assert(store.follow("Proto2dash").equals(p2));


// nested state resource
const r5 = store.post({
  hoge: 3,
  fuga: 4,
});
const r6 = store.post({
  foo: {
    _proto: r5.path,
    hoge: 5,
  }
});
console.assert(r6.follow("foo").follow("hoge").equals(5));
console.assert(r6.follow("foo").proto.follow("hoge").equals(3));


// update deep nested state
const r7 = store.post({
  foo: {
    bar: {
      baz: {
        fiz: 5,
      }
    }
  }
});
console.assert(r7.follow("foo").follow("bar").follow("baz").follow("fiz").equals(5));
r7.follow("foo").follow("bar").follow("baz").patch({fiz: 7});
console.assert(r7.follow("foo").follow("bar").follow("baz").follow("fiz").equals(7));
r7.follow("foo").follow("bar").follow("baz").patch({fiz: 8});
console.assert(r7.follow("foo").follow("bar").follow("baz").follow("fiz").equals(8));


// recurcive definition
const list = store.post({
  _name: "List",
  car: new __WEBPACK_IMPORTED_MODULE_3__path__["a" /* default */]("Entity"),
  cdr: new __WEBPACK_IMPORTED_MODULE_3__path__["a" /* default */]("List"),
});
console.assert(store.follow("List").follow("cdr").equals(store.follow("List")));


// algebraic data type
// e.g. http://qiita.com/xmeta/items/91dfb24fa87c3a9f5993
const color = store.post({
  _proto: new __WEBPACK_IMPORTED_MODULE_3__path__["a" /* default */](__WEBPACK_IMPORTED_MODULE_1__value__["a" /* default */].name),
  _name: "Color",
  Red: new __WEBPACK_IMPORTED_MODULE_2__entity__["a" /* default */]({ 
    _proto: new __WEBPACK_IMPORTED_MODULE_3__path__["a" /* default */]("Color"),
  }),
  Blue: new __WEBPACK_IMPORTED_MODULE_2__entity__["a" /* default */]({ 
    _proto: new __WEBPACK_IMPORTED_MODULE_3__path__["a" /* default */]("Color"),
  }),
  Green: new __WEBPACK_IMPORTED_MODULE_2__entity__["a" /* default */]({ 
    _proto: new __WEBPACK_IMPORTED_MODULE_3__path__["a" /* default */]("Color"),
  }),
  RGB: new __WEBPACK_IMPORTED_MODULE_2__entity__["a" /* default */]({
    _proto: new __WEBPACK_IMPORTED_MODULE_3__path__["a" /* default */]("Color"),
    r: new __WEBPACK_IMPORTED_MODULE_3__path__["a" /* default */]("Number"),
    g: new __WEBPACK_IMPORTED_MODULE_3__path__["a" /* default */]("Number"),
    b: new __WEBPACK_IMPORTED_MODULE_3__path__["a" /* default */]("Number"),
  }),
});

// namespace & proto
console.assert(store.follow("Color").equals(color));
console.assert(store.follow("Color").follow("Red").proto.equals(color));
console.assert(store.follow("Color").follow("RGB").proto.equals(color));

// concrete resource
const c1 = store.post({
  _proto: new __WEBPACK_IMPORTED_MODULE_3__path__["a" /* default */]("Color", "RGB"),
  r: 5,
  g: 6,
  b: 7
});
console.assert(c1.proto.equals(color.follow("RGB")));

// premitive type error
const err1 = store.post({
  _proto: new __WEBPACK_IMPORTED_MODULE_3__path__["a" /* default */]("Color", "RGB"),
  r: 5,
  g: 6,
  b: "invalid",
});
console.assert(err1.proto.equals(store.follow("TypeError")));

// required property error
const err2 = store.post({
  _proto: new __WEBPACK_IMPORTED_MODULE_3__path__["a" /* default */]("Color", "RGB"),
  r: 5,
  g: 6,
  // b: "nothing",
});
console.assert(err2.proto.equals(store.follow("RequiredPropertyError")));


console.log("all tests succeeded.");

/***/ }),
/* 1 */
/* unknown exports provided */
/* exports used: default */
/*!*******************************************!*\
  !*** ./~/bidirectional-map/dist/index.js ***!
  \*******************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BidirectionalMap = (function () {
    function BidirectionalMap() {
        var object = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

        _classCallCheck(this, BidirectionalMap);

        this._map = new Map();
        this._reverse = new Map();
        if (object) {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = Object.keys(object)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var attr = _step.value;

                    this.set(attr, object[attr]);
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator["return"]) {
                        _iterator["return"]();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }
        }
    }

    _createClass(BidirectionalMap, [{
        key: "set",
        value: function set(key, value) {
            if (this._map.has(key)) {
                var _value = this._map.get(key);
                this._reverse["delete"](_value);
            }
            if (this._reverse.has(value)) {
                var _key = this._reverse.get(value);
                this._map["delete"](_key);
            }
            this._map.set(key, value);
            this._reverse.set(value, key);
        }
    }, {
        key: "get",
        value: function get(key) {
            return this._map.get(key);
        }
    }, {
        key: "getKey",
        value: function getKey(value) {
            return this._reverse.get(value);
        }
    }, {
        key: "clear",
        value: function clear() {
            this._map.clear();
            this._reverse.clear();
        }
    }, {
        key: "delete",
        value: function _delete(key) {
            var value = this._map.get(key);
            this._map["delete"](key);
            this._reverse["delete"](value);
        }
    }, {
        key: "deleteValue",
        value: function deleteValue(value) {
            var key = this._reverse.get(value);
            this._map["delete"](key);
            this._reverse["delete"](value);
        }
    }, {
        key: "entries",
        value: function entries() {
            return this._map.entries();
        }
    }, {
        key: "has",
        value: function has(key) {
            return this._map.has(key);
        }
    }, {
        key: "hasValue",
        value: function hasValue(value) {
            return this._reverse.has(value);
        }
    }, {
        key: "keys",
        value: function keys() {
            return this._map.keys();
        }
    }, {
        key: "values",
        value: function values() {
            return this._map.values();
        }
    }, {
        key: "size",
        get: function get() {
            return this._map.size;
        }
    }]);

    return BidirectionalMap;
})();

exports["default"] = BidirectionalMap;
module.exports = exports["default"];



/***/ }),
/* 2 */
/* exports provided: default */
/*!************************!*\
  !*** ./src/todomvc.js ***!
  \************************/
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony default export */ var _unused_webpack_default_export = ({
  domain: {
    Task: {
      _proto: "Entity",
      title: "string",
      completed: "bool"
    },
    tasks: {
      create: {
        _proto: "EventListener",
        title: { _proto: "Argument", type: "string" },
        _stuff: {
          _proto: [
            "self",
            "append"
          ],
          _stuff: {
            _proto: "Task",
            id: { _proto: "UUID" },
            title: { _proto: "title" },
            completed: false
          }
        }
      },
      all: {
        // todo 本当はただのparent参照にしたいがうまくいかないので無駄にfilterかける
        _proto: [
          "parent",
          "filter"
        ],
        _stuff: {
          _proto: "Lambda",
          task: { _proto: "argument", type: "Task" },
          _stuff: true
        }
      },
      active: {
        _proto: [
          "parent",
          "filter"
        ],
        _stuff: {
          _proto: "Lambda",
          task: { _proto: "Argument", type: "Task" },
          _stuff: {
            _proto: "not",
            _stuff: {
              _proto: [
                "task",
                "completed",
              ]
            }
          }
        }
      },
      completed: {
        _proto: [
          "parent",
          "filter"
        ],
        _stuff: {
          _proto: "Lambda",
          task: { _proto: "Argument", type: "Task" },
          _stuff: {
            _proto: [
              "task",
              "completed",
            ]
          }
        }
      },
      _stuff: [
      ]
    }
  },
  presentation: {
    location: {
      hash: "",
    },
    // taskList: {
    //   _proto: "if",
    //   cond: {
    //     _proto: [
    //       "location",
    //       "hash",
    //       "equals"
    //     ],
    //     _stuff: "#/active"
    //   },
    //   then: {
    //     _proto: [
    //       "domain",
    //       "tasks",
    //       "active",
    //       "filter"
    //     ],
    //     _stuff: {
    //       _proto: "Lambda",
    //       task: { _proto: "argument", type: "Task" },
    //       _stuff: true
    //     }
    //   },
    //   else: {
    //     _proto: "if",
    //     cond: {
    //       _proto: [
    //         "location",
    //         "hash",
    //         "equals"
    //       ],
    //       _stuff: "#/completed"
    //     },
    //     then: {
    //       _proto: [
    //         "domain",
    //         "tasks",
    //         "completed",
    //         "filter"
    //       ],
    //       _stuff: {
    //         _proto: "Lambda",
    //         task: { _proto: "argument", type: "Task" },
    //         _stuff: true
    //       }
    //     },
    //     else: {
    //       _proto: [
    //         "domain",
    //         "tasks",
    //         "all",
    //         "filter"
    //       ],
    //       _stuff: {
    //         _proto: "Lambda",
    //         task: { _proto: "argument", type: "Task" },
    //         _stuff: true
    //       }
    //     }
    //   }
    // },
    body: {
      _proto: "Body",
      _stuff: [
        {
          _proto: "Section",
          class: "todoapp",
          _stuff: [
            {
              _proto: "Div",
              _stuff: [
                {
                  _proto: "Header",
                  class: "header",
                  _stuff: [
                    {
                      _proto: "H1",
                      _stuff: [
                        "todos"
                      ]
                    },
                    {
                      _proto: "Input",
                      class: "new-todo",
                      placeholder: "What needs to be done?",
                      autofocus: true,
                      clear: {
                        _proto: "EventListener",
                        _stuff: {
                          _proto: [
                            "self",
                            "set"
                          ],
                          value: "",
                        }
                      },
                      keyup: {
                        _proto: "EventListener",
                        keyCode: { _proto: "Argument", type: "Literal" },
                        _stuff: {
                          _proto: "if",
                          cond: {
                            _proto: [
                              "keyCode",
                              "equals"
                            ],
                            _stuff: 13
                          },
                          then: {
                            _proto: "Stuff",
                            _stuff: [
                              {
                                _proto: [
                                  "domain",
                                  "tasks",
                                  "create"
                                ],
                                title: {
                                  _proto: "value"
                                }
                              },
                              {
                                _proto: "clear"
                              }
                            ]
                          },
                          else: undefined
                        }
                      }
                    }
                  ]
                },
                {
                  _proto: "Section",
                  class: "main",
                  _stuff: [
                    {
                      _proto: "Input",
                      class: "toggle-all",
                      type: "checkbox"
                    },
                    {
                      _proto: "Ul",
                      class: "todo-list",
                      _stuff: { 
                        _proto: [
                          "domain",
                          "tasks",
                          "map"
                        ],
                        _stuff: [
                          {
                            _proto: "Lambda",
                            task: { _proto: "Argument", type: "Task" },
                            _stuff: [
                              {
                                _proto: "Li",
                                key: {
                                  _proto: [
                                    "task",
                                    "id"
                                  ]
                                },
                                _stuff: [
                                  {
                                    _proto: "Div",
                                    class: "view",
                                    _stuff: [
                                      {
                                        _proto: "Input",
                                        class: "toggle",
                                        type: "checkbox",
                                      },
                                      {
                                        _proto: "Label",
                                        _stuff: {
                                          _proto: [
                                            "task",
                                            "title"
                                          ],
                                        }
                                      },
                                      {
                                        _proto: "Button",
                                        class: "destroy",
                                      }
                                    ]
                                  },
                                  {
                                    _proto: "Input",
                                    class: "edit",
                                    value: {
                                      _proto: [
                                        "task",
                                        "title"
                                      ],
                                    }
                                  }
                                ]
                              }
                            ]
                          }
                        ]
                      }
                    }
                  ]
                },
                {
                  _proto: "Footer",
                  class: "footer",
                  _stuff: [
                    {
                      _proto: "Span",
                      class: "todo-count",
                      _stuff: [
                        {
                          _proto: "Strong",
                          _stuff: {
                            _proto: [
                              "domain",
                              "tasks",
                              "count"
                            ]
                          }
                        },
                        {
                          _proto: "Span",
                          _stuff: " "
                        },
                        {
                          _proto: "Span",
                          _stuff: {
                            _proto: "if",
                            cond: {
                              _proto: [
                                "domain", 
                                "tasks", 
                                "count", 
                                "equals"
                              ],
                              _stuff: 1
                            },
                            then: "item",
                            else: "items"
                          }
                        },
                        {
                          _proto: "Span",
                          _stuff: " left"
                        }
                      ]
                    },
                    {
                      _proto: "Ul",
                      class: "filters",
                      _stuff: [
                        {
                          _proto: "Li",
                          _stuff: [
                            {
                              _proto: "A",
                              href: "#/",
                              class: "selected",
                              _stuff: "All"
                            }
                          ]
                        },
                        {
                          _proto: "Span",
                        },
                        {
                          _proto: "Li",
                          _stuff: [
                            {
                              _proto: "A",
                              href: "#/active",
                              _stuff: "Active"
                            }
                          ]
                        },
                        {
                          _proto: "Span",
                        },
                        {
                          _proto: "Li",
                          _stuff: [
                            {
                              _proto: "A",
                              href: "#/completed",
                              _stuff: "Completed"
                            }
                          ]
                        },
                      ]
                    },
                    {
                      _proto: "Button",
                      class: "clear-completed",
                      _stuff: "Clear Completed"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          _proto: "Footer",
          class: "info",
          _stuff: [
            {
              _proto: "P",
              _stuff: "Double-click to edit a todo"
            },
            {
              _proto: "P",
              _stuff: [
                "Created by ",
                {
                  _proto: "A",
                  href: "http://github.com/emeitch/",
                  _stuff: "Hideyuki MORITA (emeitch)"
                }
              ]
            },
            {
              _proto: "P",
              _stuff: [
                "Part of ",
                {
                  _proto: "A",
                  href: "http://todomvc.com",
                  _stuff: "TodoMVC"
                }
              ]
            }
          ]
        }
      ]
    }
  }
});

/***/ }),
/* 3 */
/* exports provided: default */
/* exports used: default */
/*!**********************!*\
  !*** ./src/state.js ***!
  \**********************/
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
class State {
  constructor(init={}) {
    Object.assign(this, init);
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = State;



/***/ }),
/* 4 */
/* exports provided: default, TypeError, RequiredPropertyError */
/* exports used: default, TypeError, RequiredPropertyError */
/*!**********************!*\
  !*** ./src/error.js ***!
  \**********************/
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__state__ = __webpack_require__(/*! ./state */ 3);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return TypeError; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return RequiredPropertyError; });


class Error extends __WEBPACK_IMPORTED_MODULE_0__state__["a" /* default */] {
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Error;


class TypeError extends Error {
}

class RequiredPropertyError extends Error {
}



/***/ }),
/* 5 */
/* exports provided: flatten, equals */
/* exports used: equals */
/*!**********************!*\
  !*** ./src/utils.js ***!
  \**********************/
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export flatten */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return equals; });
function flatten(array) {
  return Array.prototype.concat.apply([], array);
}

function equals(o1, o2) {
  return JSON.stringify(o1) === JSON.stringify(o2);
}



/***/ }),
/* 6 */
/* exports provided: default */
/* exports used: default */
/*!***********************!*\
  !*** ./src/entity.js ***!
  \***********************/
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__state__ = __webpack_require__(/*! ./state */ 3);


class Entity extends __WEBPACK_IMPORTED_MODULE_0__state__["a" /* default */] {
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Entity;



/***/ }),
/* 7 */
/* exports provided: default */
/* exports used: default */
/*!**********************!*\
  !*** ./src/value.js ***!
  \**********************/
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__state__ = __webpack_require__(/*! ./state */ 3);


class Value extends __WEBPACK_IMPORTED_MODULE_0__state__["a" /* default */] {
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Value;



/***/ }),
/* 8 */
/* exports provided: default */
/* exports used: default */
/*!*********************!*\
  !*** ./src/path.js ***!
  \*********************/
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__state__ = __webpack_require__(/*! ./state */ 3);


class Path extends __WEBPACK_IMPORTED_MODULE_0__state__["a" /* default */] {
  static generateUUID() {
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
    return "urn:uuid:" + this.generateUUID();
  }
  
  static isUUID(key) {
    return key.match(/^urn:uuid:/);
  }
  
  static isName(key) {
    return !this.isUUID(key);
  }
  
  static isConst(key) {
    return !!key.match(/^[A-Z]/);
  }

  constructor(...keys) {
    super();
    this.keys = keys;
  }
  
  get top() {
    return this.keys[0];
  }
  
  get last() {
    return this.keys[this.keys.length-1];
  }
  
  get rest() {
    return this.keys.slice(1);
  }
  
  parent() {
    if (this.keys.length === 1) {
      return undefined;
    }
    
    const keys = this.keys.concat();
    keys.pop();
    return new this.constructor(...keys);
  }
  
  child(key) {
    const keys = this.keys.concat([key]);
    return new this.constructor(...keys);
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Path;


/***/ }),
/* 9 */
/* exports provided: default */
/* exports used: default */
/*!*************************!*\
  !*** ./src/resource.js ***!
  \*************************/
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utils__ = __webpack_require__(/*! ./utils */ 5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__value__ = __webpack_require__(/*! ./value */ 7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__error__ = __webpack_require__(/*! ./error */ 4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__path__ = __webpack_require__(/*! ./path */ 8);







class Resource {
  constructor(store, path) {
    this.store = store;
    this.path = path;
  }
  
  get permanent() {
    // normalization
    return this.normalize();
  }
  
  get state() {
    return this.get();
  }
    
  get proto() {
    return this.store.getProtoResource(this.state);
  }
  
  get parent() {
    const parentPath = this.state._parent;
    if (parentPath) {
      return this.store.follow(parentPath);
    }
    return undefined;
  }
  
  get isAbstract() {
    return this.state._abstract;
  }
  
  get name() {
    return this.state._name;
  }
  
  normalize() {
    let res = this.store;
    for (const key of this.path.keys) {
      res = res.follow(key);
    }
    return res;
  }
  
  equals(other) {
    if (other instanceof Resource) {
      return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["a" /* equals */])(this.permanent.path, other.permanent.path);
    } else {
      // state equivalency
      return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["a" /* equals */])(this.state, other);
    }
  }
  
  validate(state) {
    for (var key in state) {
      if (state.hasOwnProperty(key)) {
        const val = state[key];
        const prop = this.follow(key);
        const propState = (prop && prop.get()) || prop;
        if (propState 
          && !__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["a" /* equals */])(propState, val.__proto__) 
          && !__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["a" /* equals */])(propState.__proto__, val.__proto__)) {
          return new __WEBPACK_IMPORTED_MODULE_1__value__["a" /* default */]({
            _proto: new __WEBPACK_IMPORTED_MODULE_3__path__["a" /* default */](__WEBPACK_IMPORTED_MODULE_2__error__["b" /* TypeError */].name),
          });
        }
      }
    }
    
    const current = this.get();
    for (var key in current) {
      if (current.hasOwnProperty(key)) {
        if (this.follow(key).isAbstract && state[key] === undefined) {
          return new __WEBPACK_IMPORTED_MODULE_1__value__["a" /* default */]({
            _proto: new __WEBPACK_IMPORTED_MODULE_3__path__["a" /* default */](__WEBPACK_IMPORTED_MODULE_2__error__["c" /* RequiredPropertyError */].name),
          });
        }
      }
    }
    
    return null;
  }
    
  follow(key) {
    const state = this.get();
    const val = state[key];
    if (val instanceof __WEBPACK_IMPORTED_MODULE_3__path__["a" /* default */]) { // reference entity
      return this.store.follow(val);
    } else if (val === undefined && this.proto !== undefined) { // prototype chain
      return this.proto.follow(key);
    } else {
      return this.store.follow(this.path.child(key));
    }
  }
  
  get() {
    return this.store.getState(this.path);
  }
  
  put(state) {
    const parentPath = this.path.parent();
    if (parentPath) {
      this.store.follow(parentPath).patch({[this.path.last]: state});
    } else {
      this.store.setState(this.path.top, state);
    }    
  }

  patch(diff) {
    const current = this.get();
    const state = Object.assign({}, current, diff);
    this.put(state);
  }
  
  // todo: postを追加する(resourceがprotoになる?)
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Resource;


/***/ }),
/* 10 */
/* exports provided: default */
/* exports used: default */
/*!**********************!*\
  !*** ./src/store.js ***!
  \**********************/
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_bidirectional_map__ = __webpack_require__(/*! bidirectional-map */ 1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_bidirectional_map___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_bidirectional_map__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__value__ = __webpack_require__(/*! ./value */ 7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__entity__ = __webpack_require__(/*! ./entity */ 6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__error__ = __webpack_require__(/*! ./error */ 4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__path__ = __webpack_require__(/*! ./path */ 8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__resource__ = __webpack_require__(/*! ./resource */ 9);









class Store {
  constructor() {
    this.bindings = new __WEBPACK_IMPORTED_MODULE_0_bidirectional_map___default.a();
    
    // premitives
    this.appendState(Object.assign(new Boolean(false), {
      _name: Boolean.name, 
      _abstract: true
    }));
    this.appendState(Object.assign(new Number(0), {
      _name: Number.name,
      _abstract: true
    }));
    this.appendState(Object.assign(new String(""), {
      _name: String.name,
      _abstract: true
    }));
    this.appendState(Object.assign(new Array(), {
      _name: Array.name,
      _abstract: true
    }));
    this.appendState(new __WEBPACK_IMPORTED_MODULE_1__value__["a" /* default */]({
      _name: __WEBPACK_IMPORTED_MODULE_1__value__["a" /* default */].name,
      _abstract: true
    }));
    this.appendState(new __WEBPACK_IMPORTED_MODULE_2__entity__["a" /* default */]({
      _name: __WEBPACK_IMPORTED_MODULE_2__entity__["a" /* default */].name,
      _abstract: true
    }));
    
    this.appendState(new __WEBPACK_IMPORTED_MODULE_3__error__["a" /* default */]({_name: __WEBPACK_IMPORTED_MODULE_3__error__["a" /* default */].name}));
    this.appendState(new __WEBPACK_IMPORTED_MODULE_3__error__["b" /* TypeError */]({_name: __WEBPACK_IMPORTED_MODULE_3__error__["b" /* TypeError */].name}));
    this.appendState(new __WEBPACK_IMPORTED_MODULE_3__error__["c" /* RequiredPropertyError */]({_name: __WEBPACK_IMPORTED_MODULE_3__error__["c" /* RequiredPropertyError */].name}));
  }
  
  getProtoResource(state) {
    const protoPath = state._proto;
    if (protoPath) {
      return this.follow(protoPath);
    }

    return undefined;
  }
  
  resolveName(key) {
    if (!__WEBPACK_IMPORTED_MODULE_4__path__["a" /* default */].isName(key)) {
      return key;
    }
    
    const uuid = this.bindings.get(key);
    if (!uuid) {
      return undefined;
    }
    
    return uuid;
  }
    
  resolvePathTopName(path) {
    const top = this.resolveName(path.top);
    if (!top) {
      return undefined;
    }
    
    return new __WEBPACK_IMPORTED_MODULE_4__path__["a" /* default */](top, ...path.rest);
  }
  
  getState(id) {
    if (typeof(id) === "string") {
      const key = this.resolveName(id);
      return this[key];
    }
    
    const path = this.resolvePathTopName(id);
    let state = this.getState(path.top);
    for (const key of path.rest) {
      const val = state[key];
      if (!val) {
        return undefined;
      } else if (val instanceof __WEBPACK_IMPORTED_MODULE_4__path__["a" /* default */]) {
        state = this.getState(val);
      } else {
        state = val;
      }
    }
    return state;
  }
  
  entities(state) {
    const entities = {};
    
    let proto = this.getProtoResource(state);
    while (proto) {
      const state = proto.get();
      for (var key in state) {
        // reject const key for namespase
        if (state.hasOwnProperty(key) && !__WEBPACK_IMPORTED_MODULE_4__path__["a" /* default */].isConst(key)) { 
          const val = proto.follow(key).get();
          if (val instanceof __WEBPACK_IMPORTED_MODULE_2__entity__["a" /* default */] && !entities[key]) {
            entities[key] = val;
          }
        }
      }
      
      proto = proto.proto;
    }
    
    return entities;
  }
    
  setState(key, state) {
    if (state === null) {
      delete this[key];
      return undefined;
    }
    
    const res = this.follow(key);
    
    const proto = this.getProtoResource(state);
    const error = proto ? proto.validate(state) : undefined;
    if (error) {
      this[key] = error;
      return this.follow(key);
    }
    
    const name = state._name;
    if (name) {
      this.bindings.set(name, key);
    }
    
    const appendChild = (child) => {
      const childId = child._uuid || __WEBPACK_IMPORTED_MODULE_4__path__["a" /* default */].uuid();
      
      delete child._uuid;
      child._parent = new __WEBPACK_IMPORTED_MODULE_4__path__["a" /* default */](key);
      
      this.setState(childId, child);
      return childId;
    };
    
    for (const k in state) {
      if (state.hasOwnProperty(k)) {
        const v = state[k];
        if (v instanceof __WEBPACK_IMPORTED_MODULE_4__path__["a" /* default */]) {
          // resolve name and recurcive definition
          state[k] = this.resolvePathTopName(v);
        } else if (v instanceof __WEBPACK_IMPORTED_MODULE_2__entity__["a" /* default */]) {
          // set entity as child resource
          const entity = v;
          const childId = appendChild(entity);
          state[k] = new __WEBPACK_IMPORTED_MODULE_4__path__["a" /* default */](childId);
        } else if (v === null) {
          // remove null property
          delete state[k];
        }
      }
    }
     
    const entities = this.entities(state);
    for (const k in entities) {
      if (entities.hasOwnProperty(k)) {
        // remove old child parent
        if (res) {
          const old = res.follow(k);
          if (old) {
            old.patch({_parent: null});
          }
        }
        
        const entity = entities[k];
        const override = state[k];
        const child = override ? Object.assign({}, entity, override) : entity;
        const childId = appendChild(child);
        state[k] = new __WEBPACK_IMPORTED_MODULE_4__path__["a" /* default */](childId);
      }
    }
    
    this[key] = state;
    return this.follow(key);
  }
  
  appendState(state) {
    const key = __WEBPACK_IMPORTED_MODULE_4__path__["a" /* default */].uuid();
    return this.setState(key, state);
  }
    
  // same interface for Resource
  follow(id) {
    const path = this.resolvePathTopName(
      typeof(id) === "string" ? new __WEBPACK_IMPORTED_MODULE_4__path__["a" /* default */](id) : id
    );
    
    if (!path || !this.getState(path)) {
      return undefined;
    }
    
    return new __WEBPACK_IMPORTED_MODULE_5__resource__["a" /* default */](this, path);
  }
    
  post(state) {
    return this.appendState(state);
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Store;



/***/ })
/******/ ]);
//# sourceMappingURL=bundle.js.map