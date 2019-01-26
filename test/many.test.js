import assert from 'assert';

import v from '../src/v';
import UUID from '../src/uuid';
import Store from '../src/store';
import { sym } from '../src/sym';
import { path } from '../src/path';
import { std } from '../src/stdlib';

import Many from '../src/many';

describe("Many", () => {
  describe("#each", () => {
    it("should enumrate each objs", () => {
      const store = new Store(std);

      const bid = new UUID();

      store.put({
        _id: "Foo"
      });

      const fid1 = new UUID();
      store.put({
        _id: fid1,
        _type: sym("Foo"),
        bar: bid
      });

      const fid2 = new UUID();
      store.put({
        _id: fid2,
        _type: sym("Foo"),
        bar: bid
      });

      store.put({
        _id: bid,
        foo: new Many("Foo", "bar"),
      });

      assert.deepStrictEqual(path(bid, "foo", v(0), "_id").reduce(store), fid1);
    });
  });
});
