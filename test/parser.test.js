import assert from 'assert';

import { uuid } from '../src/uuid';
import { path } from '../src/path';
import v from '../src/v';
import { sym } from '../src/sym';
import { parseObjs } from '../src/parser';


describe("parseObjs", () => {
  it("should parse raw number", () => {
    const objs = parseObjs([{
      _type: "Map",
      _id: "urn:uuid:uuidexample",
      foo: 1
    }]);

    assert.deepStrictEqual(objs[0].get("_id"), uuid("uuidexample"));
    assert.deepStrictEqual(objs[0].get("foo"), v(1));
  });

  context("string head", () => {
    it("should parse a string val", () => {
      const objs = parseObjs([{
        _type: "Map",
        _id: "urn:uuid:uuidexample",
        foo: "2"
      }]);

      assert.deepStrictEqual(objs[0].get("foo"), v("2"));
    });
  });

  context("array head", () => {
    it("should parse a array val", () => {
      const objs = parseObjs([{
        _type: "Map",
        _id: "urn:uuid:uuidexample",
        foo: {_type: "Array", origin: [1, 2, 3]}
      }]);

      assert.deepStrictEqual(objs[0].get("foo"), v([1, 2, 3]));
    });
  });

  context("array map head", () => {
    it("should parse a array map val", () => {
      const objs = parseObjs([{
        _type: "Map",
        _id: "urn:uuid:uuidexample",
        foo: {
          _type: "Array",
          _head: "foo",
          origin: [
            {
              _type: "Map",
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
        _type: "Map",
        _id: "urn:uuid:uuidexample",
        foo: {
          _type: "Map",
          _head: "foo",
          a: {
            _type: "Array",
            _head: "bar",
            origin: [1, 2, 3]
          }
        },
      }]);

      assert.deepStrictEqual(objs[0].get("foo"), v("foo", {a: v("bar", [1, 2, 3])}));
    });
  });

  context("path head", () => {
    it("should parse a path val", () => {
      const objs = parseObjs([{
        _type: "Map",
        _id: "urn:uuid:uuidexample",
        foo: {_type: "Path", origin: ["Foo", ["bar", "buz"]] },
      }]);

      assert.deepStrictEqual(objs[0].get("foo"), path("Foo", ["bar", "buz"]));
    });
  });

  context("sym head", () => {
    it("should parse a sym val", () => {
      const objs = parseObjs([{
        _type: "Map",
        _id: "urn:uuid:uuidexample",
        foo: {_type: "Sym", origin: "Foo"},
      }]);

      assert.deepStrictEqual(objs[0].get("foo"), sym("Foo"));
    });
  });

  context("date head", () => {
    it("should parse a date val", () => {
      const objs = parseObjs([{
        _type: "Map",
        _id: "urn:uuid:uuidexample",
        foo: {_type: "Date", origin: "2018-04-01T00:00:00z"},
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
