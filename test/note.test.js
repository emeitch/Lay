import assert from 'assert';

import { uuid } from '../src/uuid';
import v from '../src/v';

import { note } from '../src/note';

describe("Note", () => {
  const rev = uuid();
  const id = uuid();
  const val = v(3);
  const prev = uuid();
  const src = uuid();
  const l = note(rev, id, val, prev, src);

  context("#rev", () => {
    it("should return the rev prop", () => {
      assert.deepStrictEqual(l.rev, rev);
    });
  });

  context("#id", () => {
    it("should return the id prop", () => {
      assert.deepStrictEqual(l.id, id);
    });
  });

  context("#val", () => {
    it("should return the val prop", () => {
      assert.deepStrictEqual(l.val, val);
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
