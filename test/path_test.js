import assert from 'assert';

import Path from '../src/path';
import UUID from '../src/uuid';
import { self } from '../src/self';

describe("Path", () => {
  describe("#toString", () => {
    it("should return ids joined by slash", () => {
      const id1 = new UUID();
      const id2 = new UUID();
      const id3 = new UUID();
      const p = new Path(id1, id2, id3);
      assert.deepStrictEqual(p.toString(),`${id1}/${id2}/${id3}`);
    });
  });

  describe("constructor ", () => {
    it("should require typed ID", () => {
      assert.throws(() => new Path("strobj"), /is not a ID/);
    });

    it("should accept self", () => {
      assert.doesNotThrow(() => new Path(self));
    });
  });
});
