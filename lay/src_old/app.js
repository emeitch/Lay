import { equals } from './utils';

import Value from './value';
import Entity from './entity';
import Path from './path';
import Resource from './resource';
import Store from './store';

// import TodoMVC from './todomvc';

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