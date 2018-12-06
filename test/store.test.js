import assert from 'assert';

import UUID from '../src/uuid';
import { sym } from '../src/sym';
import { path } from '../src/path';
import v from '../src/v';
import Store, { parseEdges } from '../src/store';

const parse = parseEdges;

describe("Store", () => {
  let store;
  beforeEach(() => {
    store = new Store();
  });

  describe("constructor", () => {
    it("should create new store object", () => {
      assert(store);
    });
  });

  describe("#put (#get)", () => {
    it("should store the object", () => {
      const id = new UUID();
      const obj = v({
        _id: id,
        foo: 1,
        bar: "abc"
      });
      store.put(obj);

      assert.deepStrictEqual(store.get(id), obj);
    });
  });

  describe("#findPropWithType", () => {
    let id;
    beforeEach(() => {
      store.put({
        _id: "Object",
        foo: 1
      });

      store.put({
        _id: "Bar",
        foo: 2
      });

      store.put({
        _id: "Buz",
        foo: 4,
        foz: 4
      });

      id = new UUID();
    });

    context("self prop", () => {
      it("should return self prop", () => {
        store.put({
          _id: id,
          type: path("Bar"),
          foo: 3
        });

        assert.deepStrictEqual(store.findPropWithType(id, "foo"), v(3));
      });
    });

    context("type prop", () => {
      it("should return type prop", () => {
        store.put({
          _id: id,
          type: path("Bar"),
        });

        assert.deepStrictEqual(store.findPropWithType(id, "foo"), v(2));
      });
    });

    context("multiple type", () => {
      it("should return first type prop", () => {
        store.put({
          _id: id,
          type: [
            path("Bar"),
            path("Buz")
          ]
        });

        assert.deepStrictEqual(store.findPropWithType(id, "foo"), v(2));
        assert.deepStrictEqual(store.findPropWithType(id, "foz"), v(4));
      });
    });

    context("grandparent type", () => {
      it("should return grandparent type prop", () => {
        store.put({
          _id: "Grandtype",
          foo: 5
        });
        store.put({
          _id: "Parenttype",
          type: path("Grandtype")
        });
        const child = new UUID();
        store.put({
          _id: child,
          type: path("Parenttype"),
        });

        assert.deepStrictEqual(store.findPropWithType(child, "foo"), v(5));
      });
    });

    context("access Object prop", () => {
      it("should return Object prop", () => {
        store.put({
          _id: id,
        });
        assert.deepStrictEqual(store.findPropWithType(id, "foo"), v(1));
      });
    });
  });
});

describe("parse", () => {
  it("should parse raw edges", () => {
    const edges = parse([{
      tail: {type: {origin: "UUID"}, origin: "uuidexample"},
      label: "foo",
      head: 1,
      rev: {type: {origin: "UUID"}, origin: "rev1"},
    }]);

    assert.deepStrictEqual(edges[0].tail, new UUID("uuidexample"));
    assert.deepStrictEqual(edges[0].label, v("foo"));
    assert.deepStrictEqual(edges[0].head, v(1));
    assert.deepStrictEqual(edges[0].rev, new UUID("rev1"));
  });

  context("string head", () => {
    it("should parse a string val", () => {
      const edges = parse([{
        tail: {type: {origin: "UUID"}, origin: "uuidexample"},
        label: "foo",
        head: "2",
        rev: {type: {origin: "UUID"}, origin: "rev1"},
      }]);

      assert.deepStrictEqual(edges[0].head, v("2"));
    });
  });

  context("comp head", () => {
    it("should parse a comp val", () => {
      const edges = parse([{
        tail: {type: {origin: "UUID"}, origin: "uuidexample"},
        label: "foo",
        head: {type: {origin: "Comp"}, head: "foo", origin: 3},
        rev: {type: {origin: "UUID"}, origin: "rev1"},
      }]);

      assert.deepStrictEqual(edges[0].head, v("foo", 3));
    });
  });

  context("array head", () => {
    it("should parse a array val", () => {
      const edges = parse([{
        tail: {type: {origin: "UUID"}, origin: "uuidexample"},
        label: "foo",
        head: {type: {origin: "Array"}, origin: [1, 2, 3]},
        rev: {type: {origin: "UUID"}, origin: "rev1"},
      }]);

      assert.deepStrictEqual(edges[0].head, v([1, 2, 3]));
    });
  });

  context("array map head", () => {
    it("should parse a array map val", () => {
      const edges = parse([{
        tail: {type: {origin: "UUID"}, origin: "uuidexample"},
        label: "foo",
        head: {type: {origin: "Array"}, head: "foo", origin: [{type: {origin: "Map"}, head: "bar", origin: {a: 1, b: 2}}]},
        rev: {type: {origin: "UUID"}, origin: "rev1"},
      }]);

      assert.deepStrictEqual(edges[0].head, v("foo", [v("bar", {a: 1, b: 2})]));
    });
  });

  context("map array head", () => {
    it("should parse a map array val", () => {
      const edges = parse([{
        tail: {type: {origin: "UUID"}, origin: "uuidexample"},
        label: "foo",
        head: {type: {origin: "Map"}, head: "foo", origin: {a: {type: {origin: "Array"}, head: "bar", origin: [1, 2, 3]}}},
        rev: {type: {origin: "UUID"}, origin: "rev1"},
      }]);

      assert.deepStrictEqual(edges[0].head, v("foo", {a: v("bar", [1, 2, 3])}));
    });
  });

  context("comp comp head", () => {
    it("should parse a comp comp val", () => {
      const edges = parse([{
        tail: {type: {origin: "UUID"}, origin: "uuidexample"},
        label: "foo",
        head: {type: {origin: "Comp"}, head: "foo", origin: {type: {origin: "Comp"}, head: "bar", origin: 1} },
        rev: {type: {origin: "UUID"}, origin: "rev1"},
      }]);

      assert.deepStrictEqual(edges[0].head, v("foo", v("bar", 1)));
    });
  });

  context("comp as enum head", () => {
    it("should parse a comp as enum val", () => {
      const edges = parse([{
        tail: {type: {origin: "UUID"}, origin: "uuidexample"},
        label: "foo",
        head: {type: {origin: "Comp"}, head: "foo", origin: null },
        rev: {type: {origin: "UUID"}, origin: "rev1"},
      }]);

      assert.deepStrictEqual(edges[0].head, v("foo", null));
    });
  });

  context("path head", () => {
    it("should parse a path val", () => {
      const edges = parse([{
        tail: {type: {origin: "UUID"}, origin: "uuidexample"},
        label: "foo",
        head: {type: {origin: "Path"}, origin: [{origin: "Foo"}] },
        rev: {type: {origin: "UUID"}, origin: "rev1"},
      }]);

      assert.deepStrictEqual(edges[0].head, path("Foo"));
    });
  });

  context("sym head", () => {
    it("should parse a sym val", () => {
      const edges = parse([{
        tail: {type: {origin: "UUID"}, origin: "uuidexample"},
        label: "foo",
        head: {origin: "Foo"},
        rev: {type: {origin: "UUID"}, origin: "rev1"},
      }]);

      assert.deepStrictEqual(edges[0].head, sym("Foo"));
    });
  });

  context("date head", () => {
    it("should parse a date val", () => {
      const edges = parse([{
        tail: {type: {origin: "UUID"}, origin: "uuidexample"},
        label: "foo",
        head: {type: {origin: "Date"}, origin: "2018-04-01T00:00:00z"},
        rev: {type: {origin: "UUID"}, origin: "rev1"},
      }]);

      assert.deepStrictEqual(edges[0].head, v(new Date("2018-04-01T00:00:00z")));
    });
  });

  context("unsupported type", () => {
    it("should raise error unparsed raw edges", () => {
      assert.throws(() => parse([
        {
          tail: {type: {origin: "UUID"}, origin: "uuidexample"},
          label: "foo",
          head: {type: {origin: "Dummy"}},
          rev: {type: {origin: "UUID"}, origin: "rev1"},
        }
      ]),
      /unsupported type:/);
    });
  });

  context("not identified val", () => {
    it("should raise error unparsed raw edges", () => {
      assert.throws(() => parse([
        {
          tail: 1
        }
      ]),
      /can not identify a val:/);
    });
  });
});
