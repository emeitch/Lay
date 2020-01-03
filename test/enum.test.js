import assert from 'assert';

import { path } from '../src/path';
import v from '../src/v';
import { uuid } from '../src/uuid';
import Store from '../src/store';

import Enum from '../src/enum';

describe("Enum", () => {
  let store;
  beforeEach(() => {
    store = new Store();
    store.assign("Enum", new Enum());
  });

  context("explicit _proto specifing", () => {
    describe("define child objects", () => {
      it("should define enum values", () => {
        store.put({
          _proto: "Enum",
          _key: "Foo",
          _id: uuid(),
          foo: 3,
          Bar: {
            _proto: "Foo",
            bar: 4
          },
          Buz: {
            _proto: "Foo",
            bar: 5
          }
        });

        assert.deepStrictEqual(path("Foo", "Bar", "foo").reduce(store), v(3));
      });
    });
  });

  context("implicit _proto specifing", () => {
    describe("define child objects", () => {
      it("should define enum values", () => {
        // add _proto for no _proto Obj children by Enum#__beforePutByProto
        store.put({
          _proto: "Enum",
          _key: "Foo",
          _id: uuid(),
          foo: 3,
          Bar: {},
          Baz: {
            foo: 4
          }
        });

        assert.deepStrictEqual(path("Foo", "Bar", "foo").reduce(store), v(3));
        assert.deepStrictEqual(path("Foo", "Baz", "foo").reduce(store), v(4));

        // nested
        assert.deepStrictEqual(path("Foo", "Bar", "Bar", "Bar", "foo").reduce(store), v(3));
      });
    });

    context("child enum and ancestor enum", () => {
      describe("define child objects", () => {
        it("should define enum values", () => {
          store.put({
            _key: "Foo",
            _id: uuid(),
            Bar: {
              _proto: "Enum",
              foo: 6,
              Baz: {},
              Fiz: {
                foo: 7
              }
            },
          });

          assert.deepStrictEqual(path("Foo", "Bar", "Baz", "foo").reduce(store), v(6));
          assert.deepStrictEqual(path("Foo", "Bar", "Fiz", "foo").reduce(store), v(7));
        });
      });
    });

    context("already child obj specified _proto", () => {
      it("should define enum values", () => {
        store.put({
          _key: "Fiz",
          _id: uuid(),
          foo: 5
        });
        store.put({
          _proto: "Enum",
          _key: "Foo",
          _id: uuid(),
          foo: 3,
          Bar: {
            _proto: "Fiz"
          },
          Baz: {
            foo: 4
          }
        });

        assert.deepStrictEqual(path("Foo", "Bar", "foo").reduce(store), v(5));
      });
    });
  });

  context("already ancestor obj specified _proto", () => {
    it("should define enum values", () => {
      store.put({
        _key: "Fiz",
        _id: uuid(),
        foo: 5
      });
      store.put({
        _key: "Foo",
        _id: uuid(),
        Bar: {
          _proto: "Enum",
          foo: 6,
          Baz: {
            _proto: "Fiz"
          },
          Diz: {
            foo: 7
          }
        },
      });

      assert.deepStrictEqual(path("Foo", "Bar", "Baz", "foo").reduce(store), v(5));
    });
  });

  context("external enum _proto referencing", () => {
    it("should throw error", () => {
      store.put({
        _proto: "Enum",
        _key: "Foo",
        _id: uuid(),
        foo: 3,
      });

      assert.throws(() => {
        store.put({
          _proto: "Foo",
          _key: "Fiz",
          _id: uuid(),
          foo: 5
        });
      }, /should not specify external enum as _proto/);
    });
  });
});
