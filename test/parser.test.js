import assert from 'assert';

import { uuid } from '../src/uuid';
import { path } from '../src/path';
import v from '../src/v';
import { sym } from '../src/sym';
import { parseObjs } from '../src/parser';


describe("parseObjs", () => {
  it("should parse raw number", () => {
    const objs = parseObjs([{
      _type: "Obj",
      _id: "urn:uuid:uuidexample",
      foo: 1
    }]);

    assert.deepStrictEqual(objs[0].get("_id"), uuid("uuidexample"));
    assert.deepStrictEqual(objs[0].get("foo"), v(1));
  });

  context("string head", () => {
    it("should parse a string val", () => {
      const objs = parseObjs([{
        _type: "Obj",
        _id: "urn:uuid:uuidexample",
        foo: "2"
      }]);

      assert.deepStrictEqual(objs[0].get("foo"), v("2"));
    });
  });

  context("arr head", () => {
    it("should parse a arr val", () => {
      const objs = parseObjs([{
        _type: "Obj",
        _id: "urn:uuid:uuidexample",
        foo: {_type: "Arr", origin: [1, 2, 3]}
      }]);

      assert.deepStrictEqual(objs[0].get("foo"), v([1, 2, 3]));
    });
  });

  context("arr obj head", () => {
    it("should parse a arr obj val", () => {
      const objs = parseObjs([{
        _type: "Obj",
        _id: "urn:uuid:uuidexample",
        foo: {
          _type: "Arr",
          origin: [
            {
              _type: "Obj",
              _head: "bar",
              a: 1,
              b: 2
            }
          ]
        },
      }]);

      assert.deepStrictEqual(objs[0].get("foo"), v([v("bar", {a: 1, b: 2})]));
    });
  });

  context("obj arr head", () => {
    it("should parse a obj arr val", () => {
      const objs = parseObjs([{
        _type: "Obj",
        _id: "urn:uuid:uuidexample",
        foo: {
          _type: "Obj",
          _head: "foo",
          a: {
            _type: "Arr",
            origin: [1, 2, 3]
          }
        },
      }]);

      assert.deepStrictEqual(objs[0].get("foo"), v("foo", {a: v([1, 2, 3])}));
    });
  });

  context("path head", () => {
    it("should parse a path val", () => {
      const objs = parseObjs([{
        _type: "Obj",
        _id: "urn:uuid:uuidexample",
        foo: {_type: "Path", origin: ["Foo", ["bar", "buz"]] },
      }]);

      assert.deepStrictEqual(objs[0].get("foo"), path("Foo", ["bar", "buz"]));
    });
  });

  context("sym head", () => {
    it("should parse a sym val", () => {
      const objs = parseObjs([{
        _type: "Obj",
        _id: "urn:uuid:uuidexample",
        foo: {_type: "Sym", origin: "Foo"},
      }]);

      assert.deepStrictEqual(objs[0].get("foo"), sym("Foo"));
    });
  });

  context("time head", () => {
    it("should parse a time val", () => {
      const objs = parseObjs([{
        _type: "Obj",
        _id: "urn:uuid:uuidexample",
        foo: {_type: "Time", origin: "2018-04-01T00:00:00z"},
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
