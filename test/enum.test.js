import assert from 'assert';

import { path } from '../src/path';
import v from '../src/v';
import Store from '../src/store';

import Enum from '../src/enum';

describe("Enum", () => {
  let store;
  beforeEach(() => {
    store = new Store();
    store.set("Enum", "_body", new Enum());
  });

  context("explicit _proto specifing", () => {
    describe("define child objects", () => {
      it("should define enum values", () => {
        store.put({
          _proto: "Enum",
          _id: "Foo",
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
        store.put({
          _proto: "Enum",
          _id: "Foo",
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
  });
});
