import assert from 'assert';

import { uuid } from '../src/uuid';
import v from '../src/v';

import { note } from '../src/note';

describe("Note", () => {
  const rev = uuid();
  const id = uuid();
  const val = v({foo: 3});
  const prev = uuid();
  const src = uuid();
  const l = note(rev, id, val, prev, src);

  describe("any props", () => {
    it("should return props", () => {
      assert.deepStrictEqual(l.rev, rev);
      assert.deepStrictEqual(l.id, id);
      assert.deepStrictEqual(l.val, val);
      assert.deepStrictEqual(l.prev, prev);
      assert.deepStrictEqual(l.src, src);
    });

    context("without required props", () => {
      it("throw errors", () => {
        const errorPattern = /required props \(rev, id, val\) not found. args: /;
        assert.throws(() => { note(); }, errorPattern);
        assert.throws(() => { note(rev); }, errorPattern);
        assert.throws(() => { note(rev, id); }, errorPattern);
      });
    });

    context("without optional props", () => {
      it("should return undefined", () => {
        const nt = note(rev, id, val);
        assert.deepStrictEqual(nt.prev, undefined);
        assert.deepStrictEqual(nt.src, undefined);
      });
    });
  });

  describe("#get", () => {
    it("should return the val's prop", () => {
      assert.deepStrictEqual(l.get("foo"), v(3));
    });

    context("specify the key which not exists", () => {
      it("should return undefined", () => {
        assert.deepStrictEqual(l.get("notExists"), undefined);
      });
    });

    context("specify note's prop keys", () => {
      it("should return note's props", () => {
        assert.deepStrictEqual(l.get("_rev"), rev);
        assert.deepStrictEqual(l.get("_id"), id);
        assert.deepStrictEqual(l.get("_val"), val);
        assert.deepStrictEqual(l.get("_prev"), prev);
        assert.deepStrictEqual(l.get("_src"), src);
      });
    });
  });
});
