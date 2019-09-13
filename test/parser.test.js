import assert from 'assert';

import { uuid } from '../src/uuid';
import { path } from '../src/path';
import v from '../src/v';
import { sym } from '../src/sym';
import { parseObjs } from '../src/parser';


describe("parseObjs", () => {
  it("should parse raw number", () => {
    const objs = parseObjs([{
      _proto: "Obj",
      _id: "urn:uuid:uuidexample",
      foo: 1
    }]);

    assert.deepStrictEqual(objs[0].get("_id"), uuid("uuidexample"));
    assert.deepStrictEqual(objs[0].get("foo"), v(1));
  });

  context("string", () => {
    it("should parse a string val", () => {
      const objs = parseObjs([{
        _proto: "Obj",
        _id: "urn:uuid:uuidexample",
        foo: "2"
      }]);

      assert.deepStrictEqual(objs[0].get("foo"), v("2"));
    });
  });

  context("arr", () => {
    it("should parse a arr val", () => {
      const objs = parseObjs([{
        _proto: "Obj",
        _id: "urn:uuid:uuidexample",
        foo: {_proto: "Arr", origin: [1, 2, 3]}
      }]);

      assert.deepStrictEqual(objs[0].get("foo"), v([1, 2, 3]));
    });
  });

  context("arr obj type", () => {
    it("should parse a arr obj val", () => {
      const objs = parseObjs([{
        _id: "urn:uuid:uuidexample",
        foo: {
          _proto: "Arr",
          origin: [
            {
              _proto: "Foo",
              a: 1,
              b: 2
            }
          ]
        },
      }]);

      assert.deepStrictEqual(objs[0].get("foo"), v([v("Foo", {a: 1, b: 2})]));
    });
  });

  context("obj arr type", () => {
    it("should parse a obj arr val", () => {
      const objs = parseObjs([{
        _id: "urn:uuid:uuidexample",
        foo: {
          _proto: "Foo",
          a: {
            _proto: "Arr",
            origin: [1, 2, 3]
          }
        },
      }]);

      assert.deepStrictEqual(objs[0].get("foo"), v("Foo", {a: v([1, 2, 3])}));
    });
  });

  context("path", () => {
    it("should parse a path val", () => {
      const objs = parseObjs([{
        _proto: "Obj",
        _id: "urn:uuid:uuidexample",
        foo: {_proto: "Path", origin: ["Foo", ["bar", "buz"]] },
      }]);

      assert.deepStrictEqual(objs[0].get("foo"), path("Foo", ["bar", "buz"]));
    });
  });

  context("sym", () => {
    it("should parse a sym val", () => {
      const objs = parseObjs([{
        _proto: "Obj",
        _id: "urn:uuid:uuidexample",
        foo: {_proto: "Sym", origin: "Foo"},
      }]);

      assert.deepStrictEqual(objs[0].get("foo"), sym("Foo"));
    });
  });

  context("time", () => {
    it("should parse a time val", () => {
      const objs = parseObjs([{
        _proto: "Obj",
        _id: "urn:uuid:uuidexample",
        foo: {_proto: "Time", origin: "2018-04-01T00:00:00z"},
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
