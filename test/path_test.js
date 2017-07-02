import assert from 'assert';

import Path from '../src/path';
import UUID from '../src/uuid';
import { self } from '../src/self';

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
});
