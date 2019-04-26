import assert from 'assert';

import { uuid } from '../src/uuid';
import v from '../src/v';

import { log } from '../src/log';

describe("Log", () => {
  const key = uuid();
  const val = v(3);
  const rev = uuid();
  const prev = uuid();
  const src = uuid();
  const l = log(key, val, rev, prev, src);

  context("#key", () => {
    it("should return the key prop", () => {
      assert.deepStrictEqual(l.key, key);
    });
  });

  context("#val", () => {
    it("should return the val prop", () => {
      assert.deepStrictEqual(l.val, val);
    });
  });

  context("#rev", () => {
    it("should return the rev prop", () => {
      assert.deepStrictEqual(l.rev, rev);
    });
  });

  context("#prev", () => {
    it("should return the prev prop", () => {
      assert.deepStrictEqual(l.prev, prev);
    });
  });

  context("#src", () => {
    it("should return the src prop", () => {
      assert.deepStrictEqual(l.src, src);
    });
  });
});
