import assert from 'assert';

import UUID from '../src/uuid';
import { path } from '../src/path';
import v from '../src/v';
import { sym } from '../src/sym';
import { parseObjs } from '../src/parser';


describe("parseObjs", () => {
  it("should parse raw number", () => {
    const objs = parseObjs([{
      _type: {origin: "Map"},
      _id: {_type: {origin: "UUID"}, origin: "uuidexample"},
      foo: 1
    }]);

    assert.deepStrictEqual(objs[0].get("_id"), new UUID("uuidexample"));
    assert.deepStrictEqual(objs[0].get("foo"), v(1));
  });

  context("string head", () => {
    it("should parse a string val", () => {
      const objs = parseObjs([{
        _type: {origin: "Map"},
        _id: {_type: {origin: "UUID"}, origin: "uuidexample"},
        foo: "2"
      }]);

      assert.deepStrictEqual(objs[0].get("foo"), v("2"));
    });
  });

  context("comp head", () => {
    it("should parse a comp val", () => {
      const objs = parseObjs([{
        _type: {origin: "Map"},
        _id: {_type: {origin: "UUID"}, origin: "uuidexample"},
        foo: {_type: {origin: "Comp"}, _head: "foo", origin: 3}
      }]);

      assert.deepStrictEqual(objs[0].get("foo"), v("foo", 3));
    });
  });

  context("array head", () => {
    it("should parse a array val", () => {
      const objs = parseObjs([{
        _type: {origin: "Map"},
        _id: {_type: {origin: "UUID"}, origin: "uuidexample"},
        foo: {_type: {origin: "Array"}, origin: [1, 2, 3]}
      }]);

      assert.deepStrictEqual(objs[0].get("foo"), v([1, 2, 3]));
    });
  });

  context("array map head", () => {
    it("should parse a array map val", () => {
      const objs = parseObjs([{
        _type: {origin: "Map"},
        _id: {_type: {origin: "UUID"}, origin: "uuidexample"},
        foo: {
          _type: {
            origin: "Array"
          },
          _head: "foo",
          origin: [
            {
              _type: {
                origin: "Map"
              },
              _head: "bar",
              a: 1,
              b: 2
            }
          ]
        },
      }]);

      assert.deepStrictEqual(objs[0].get("foo"), v("foo", [v("bar", {a: 1, b: 2})]));
    });
  });

  context("map array head", () => {
    it("should parse a map array val", () => {
      const objs = parseObjs([{
        _type: {origin: "Map"},
        _id: {_type: {origin: "UUID"}, origin: "uuidexample"},
        foo: {
          _type: {origin: "Map"},
          _head: "foo",
          a: {
            _type: {
              origin: "Array"
            },
            _head: "bar",
            origin: [1, 2, 3]
          }
        },
      }]);

      assert.deepStrictEqual(objs[0].get("foo"), v("foo", {a: v("bar", [1, 2, 3])}));
    });
  });

  context("comp comp head", () => {
    it("should parse a comp comp val", () => {
      const objs = parseObjs([{
        _type: {origin: "Map"},
        _id: {_type: {origin: "UUID"}, origin: "uuidexample"},
        foo: {_type: {origin: "Comp"}, _head: "foo", origin: {_type: {origin: "Comp"}, _head: "bar", origin: 1} },
      }]);

      assert.deepStrictEqual(objs[0].get("foo"), v("foo", v("bar", 1)));
    });
  });

  context("comp as enum head", () => {
    it("should parse a comp as enum val", () => {
      const objs = parseObjs([{
        _type: {origin: "Map"},
        _id: {_type: {origin: "UUID"}, origin: "uuidexample"},
        foo: {_type: {origin: "Comp"}, _head: "foo", origin: null },
      }]);

      assert.deepStrictEqual(objs[0].get("foo"), v("foo", null));
    });
  });

  context("path head", () => {
    it("should parse a path val", () => {
      const objs = parseObjs([{
        _type: {origin: "Map"},
        _id: {_type: {origin: "UUID"}, origin: "uuidexample"},
        foo: {_type: {origin: "Path"}, origin: [{origin: "Foo"}, ["bar", "buz"]] },
      }]);

      assert.deepStrictEqual(objs[0].get("foo"), path("Foo", ["bar", "buz"]));
    });
  });

  context("sym head", () => {
    it("should parse a sym val", () => {
      const objs = parseObjs([{
        _type: {origin: "Map"},
        _id: {_type: {origin: "UUID"}, origin: "uuidexample"},
        foo: {origin: "Foo"},
      }]);

      assert.deepStrictEqual(objs[0].get("foo"), sym("Foo"));
    });
  });

  context("date head", () => {
    it("should parse a date val", () => {
      const objs = parseObjs([{
        _type: {origin: "Map"},
        _id: {_type: {origin: "UUID"}, origin: "uuidexample"},
        foo: {_type: {origin: "Date"}, origin: "2018-04-01T00:00:00z"},
      }]);

      assert.deepStrictEqual(objs[0].get("foo"), v(new Date("2018-04-01T00:00:00z")));
    });
  });

  context("not identified val", () => {
    it("should raise error unparsed raw objs", () => {
      assert.throws(() => parseObjs([
        undefined
      ]),
      /can not identify a val:/);
    });
  });
});
