import assert from 'assert';

import v from '../src/v';
import { uuid } from '../src/uuid';
import Store from '../src/store';
import { path } from '../src/path';
import { std } from '../src/stdlib';

import Many from '../src/many';

describe("Many", () => {
  describe("#each", () => {
    it("should enumrate each objs", () => {
      const store = new Store(std);

      const bid = uuid();

      store.put({
        _id: "Foo"
      });

      const fid1 = uuid();
      store.put({
        _id: fid1,
        _proto: "Foo",
        bar: path(bid)
      });

      const fid2 = uuid();
      store.put({
        _id: fid2,
        _proto: "Foo",
        bar: path(bid)
      });

      store.put({
        _id: bid,
        foo: new Many("Foo", "bar"),
      });

      assert.deepStrictEqual(path(bid, "foo", v(0)).reduce(store), fid1);
    });

    context("the prop name is same the proto name", () => {
      it("should enumrate each objs", () => {
        const store = new Store(std);

        const bid = uuid();

        store.put({
          _id: v("Foo")
        });

        const fid1 = uuid();
        store.put({
          _id: fid1,
          _proto: "Foo",
          bar: path(bid)
        });

        const fid2 = uuid();
        store.put({
          _id: fid2,
          _proto: "Foo",
          bar: path(bid)
        });

        store.put({
          _id: bid,
          _proto: "Bar",
          foo: new Many("Foo"),
        });

        assert.deepStrictEqual(path(bid, "foo", v(0)).reduce(store), fid1);
      });
    });
  });
});
