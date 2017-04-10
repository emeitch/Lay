const BiMap = require('bidirectional-map');

function flatten(array) {
  return Array.prototype.concat.apply([], array);
}

const TodoMVC = require('./todomvc');
// console.log(TodoMVC);

function equals(o1, o2) {
  return JSON.stringify(o1) === JSON.stringify(o2);
}
  
const State = require('./state');

import Error from './error';

class TypeError extends Error {
}

class RequiredPropertyError extends Error {
}

class Value extends State {
}

class Entity extends State {
}

class Path extends State {
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

class Store {
  constructor() {
    this.bindings = new BiMap();
    
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
    this.appendState(new Value({
      _name: Value.name,
      _abstract: true
    }));
    this.appendState(new Entity({
      _name: Entity.name,
      _abstract: true
    }));
    
    this.appendState(new Error({_name: Error.name}));
    this.appendState(new TypeError({_name: TypeError.name}));
    this.appendState(new RequiredPropertyError({_name: RequiredPropertyError.name}));
  }
  
  getProtoResource(state) {
    const protoPath = state._proto;
    if (protoPath) {
      return this.follow(protoPath);
    }

    return undefined;
  }
  
  resolveName(key) {
    if (!Path.isName(key)) {
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
    
    return new Path(top, ...path.rest);
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
      } else if (val instanceof Path) {
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
        if (state.hasOwnProperty(key) && !Path.isConst(key)) { 
          const val = proto.follow(key).get();
          if (val instanceof Entity && !entities[key]) {
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
      const childId = child._uuid || Path.uuid();
      
      delete child._uuid;
      child._parent = new Path(key);
      
      this.setState(childId, child);
      return childId;
    };
    
    for (const k in state) {
      if (state.hasOwnProperty(k)) {
        const v = state[k];
        if (v instanceof Path) {
          // resolve name and recurcive definition
          state[k] = this.resolvePathTopName(v);
        } else if (v instanceof Entity) {
          // set entity as child resource
          const entity = v;
          const childId = appendChild(entity);
          state[k] = new Path(childId);
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
        state[k] = new Path(childId);
      }
    }
    
    this[key] = state;
    return this.follow(key);
  }
  
  appendState(state) {
    const key = Path.uuid();
    return this.setState(key, state);
  }
    
  // same interface for Resource
  follow(id) {
    const path = this.resolvePathTopName(
      typeof(id) === "string" ? new Path(id) : id
    );
    
    if (!path || !this.getState(path)) {
      return undefined;
    }
    
    return new Resource(this, path);
  }
    
  post(state) {
    return this.appendState(state);
  }
}

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
      return equals(this.permanent.path, other.permanent.path);
    } else {
      // state equivalency
      return equals(this.state, other);
    }
  }
  
  validate(state) {
    for (var key in state) {
      if (state.hasOwnProperty(key)) {
        const val = state[key];
        const prop = this.follow(key);
        const propState = (prop && prop.get()) || prop;
        if (propState 
          && !equals(propState, val.__proto__) 
          && !equals(propState.__proto__, val.__proto__)) {
          return new Value({
            _proto: new Path(TypeError.name),
          });
        }
      }
    }
    
    const current = this.get();
    for (var key in current) {
      if (current.hasOwnProperty(key)) {
        if (this.follow(key).isAbstract && state[key] === undefined) {
          return new Value({
            _proto: new Path(RequiredPropertyError.name),
          });
        }
      }
    }
    
    return null;
  }
    
  follow(key) {
    const state = this.get();
    const val = state[key];
    if (val instanceof Path) { // reference entity
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


// test suite
const store = new Store();

const p1 = store.post({
  _name: "Proto1",
  foo: 1,
  bar: 2,
  fiz: 9
});
const r2id = Path.uuid();
const r1 = store.post({
  _proto: p1.path,
  foo: 3, 
  bar: 4,
  baz: new Path(r2id)
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
console.assert(r1.path instanceof Path);
console.assert(r2.path instanceof Path);

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
console.assert(equals(store.getState("Proto1"), p1.get()));
// resource method resolves id reference
console.assert(store.follow("Proto1").equals(p1));

// prototype chain
console.assert(r2.follow("fiz").equals(9));

// equivalency
console.assert(r2.equals(r2));
console.assert(!r2.equals(r3));
console.assert(r2.equals(r2.get())); // state equivalency
console.assert(equals(r2.get(), r3.get()));
console.assert(!equals(r2.get(),r1.get()));


// entity schema for composition
const k2 = "Proto2";
const p2 = store.post({
  _name: k2,
  foo: new Entity({
    bar: 3,
    baz: 4,
  }),
});
const r4 = store.post({
  _proto: new Path(k2),
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
console.assert(store.follow(new Path(r4.path.top)).follow("foo").follow("baz").equals(5));
console.assert(store.follow(new Path(r4.path.top, "foo")).follow("baz").equals(5));
console.assert(store.follow(new Path(r4.path.top, "foo", "baz")).equals(5));

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
console.assert(!equals(r4.follow("foo").path, oldFoo.path)); // updated
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
console.assert(equals(r4.follow("foo").path, fooPath)); // not updated

// update proto's key name
console.assert(store.follow("Proto2"));
console.assert(!store.follow("Proto2dash"));
const k2dash = new Path("Proto2dash");
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
  car: new Path("Entity"),
  cdr: new Path("List"),
});
console.assert(store.follow("List").follow("cdr").equals(store.follow("List")));


// algebraic data type
// e.g. http://qiita.com/xmeta/items/91dfb24fa87c3a9f5993
const color = store.post({
  _proto: new Path(Value.name),
  _name: "Color",
  Red: new Entity({ 
    _proto: new Path("Color"),
  }),
  Blue: new Entity({ 
    _proto: new Path("Color"),
  }),
  Green: new Entity({ 
    _proto: new Path("Color"),
  }),
  RGB: new Entity({
    _proto: new Path("Color"),
    r: new Path("Number"),
    g: new Path("Number"),
    b: new Path("Number"),
  }),
});

// namespace & proto
console.assert(store.follow("Color").equals(color));
console.assert(store.follow("Color").follow("Red").proto.equals(color));
console.assert(store.follow("Color").follow("RGB").proto.equals(color));

// concrete resource
const c1 = store.post({
  _proto: new Path("Color", "RGB"),
  r: 5,
  g: 6,
  b: 7
});
console.assert(c1.proto.equals(color.follow("RGB")));

// premitive type error
const err1 = store.post({
  _proto: new Path("Color", "RGB"),
  r: 5,
  g: 6,
  b: "invalid",
});
console.assert(err1.proto.equals(store.follow("TypeError")));

// required property error
const err2 = store.post({
  _proto: new Path("Color", "RGB"),
  r: 5,
  g: 6,
  // b: "nothing",
});
console.assert(err2.proto.equals(store.follow("RequiredPropertyError")));


console.log("all tests succeeded.");