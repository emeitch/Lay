import assert from 'assert';

import { v } from '../src/val';
import Path from '../src/path';
import UUID from '../src/uuid';
import { self } from '../src/self';
import Store from '../src/store';

describe("Path", () => {
  describe("constructor ", () => {
    it("should accept self", () => {
      assert.doesNotThrow(() => new Path(self));
    });

    it("should require the receiver is typed ID or Self", () => {
      assert.throws(() => new Path("strobj"), / is not a ID or a Self/);
    });

    it("should require keys are typed ID", () => {
      assert.throws(() => new Path(new UUID(), "strobj"), / is not a ID$/);
    });
  });

  let id1, id2, id3;
  let p;
  beforeEach(() => {
    id1 = new UUID();
    id2 = new UUID();
    id3 = new UUID();
    p = new Path(id1, id2, id3);
  });

  describe("#receiver", () => {
    it("should return the first id", () => {
      assert.deepStrictEqual(p.receiver, id1);
    });
  });

  describe("#keys", () => {
    it("should return rest ids", () => {
      assert.deepStrictEqual(p.keys, [id2, id3]);
    });
  });

  describe("#toString", () => {
    it("should return ids joined by slash", () => {
      assert.deepStrictEqual(p.toString(),`${id1}/${id2}/${id3}`);
    });
  });

  describe("#reduce", () => {
    let store;
    beforeEach(() => {
      store = new Store();
    });

    context("absolute path with uuid end", () => {
      const id = new UUID();
      const key = new UUID();
      const id2 = new UUID();
      const key2 = new UUID();
      const id3 = new UUID();
      beforeEach(() => {
        store.log(id, key, id2);
        store.log(id2, key2, id3);
      });

      it("should return the val", () => {
        const p = new Path(id, key, key2);
        assert.deepStrictEqual(p.reduce(store), id3);
      });
    });

    context("relative path with uuid end", () => {
      const id = new UUID();
      const key = new UUID();
      const val = v("val0");
      beforeEach(() => {
        store.log(id, key, val);
      });

      it("should return the val", () => {
        const p = new Path(self, key);
        const env = {
          id,
          parent: store,
          activeLog: (...args) => store.activeLog(...args)
        };
        assert.deepStrictEqual(p.reduce(env), val);
      });
    });

    context("malformed path", () => {
      const id = new UUID();
      const unknownKey1 = new UUID();
      const unknownKey2 = new UUID();

      it("should raise exception", () => {
        const p = new Path(id, unknownKey1, unknownKey2);
        assert.throws(() => p.reduce(store), /.* don't have the specified key .*/);
      });
    });
  });
});
