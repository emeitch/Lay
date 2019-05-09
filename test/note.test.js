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
  const nt = note(rev, id, val, prev, src);

  describe("any props", () => {
    it("should return props", () => {
      assert.deepStrictEqual(nt.rev, rev);
      assert.deepStrictEqual(nt.id, id);
      assert.deepStrictEqual(nt.val, val);
      assert.deepStrictEqual(nt.prev, prev);
      assert.deepStrictEqual(nt.src, src);
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

  describe("#getOwnProp", () => {
    it("should return the val's prop", () => {
      assert.deepStrictEqual(nt.getOwnProp("foo"), v(3));
    });

    context("specify the key which not exists", () => {
      it("should return undefined", () => {
        assert.deepStrictEqual(nt.getOwnProp("notExists"), undefined);
      });
    });

    context("specify note's prop keys", () => {
      it("should return note's props", () => {
        assert.deepStrictEqual(nt.getOwnProp("_rev"), rev);
        assert.deepStrictEqual(nt.getOwnProp("_id"), id);
        assert.deepStrictEqual(nt.getOwnProp("_val"), val);
        assert.deepStrictEqual(nt.getOwnProp("_prev"), prev);
        assert.deepStrictEqual(nt.getOwnProp("_src"), src);
      });
    });
  });

  describe("#get", () => {
    it("should return the val's prop", () => {
      assert.deepStrictEqual(nt.get("foo"), v(3));
    });

    context("specify the key which not exists", () => {
      it("should return undefined", () => {
        assert.deepStrictEqual(nt.get("notExists"), undefined);
      });
    });

    context("specify note's prop keys", () => {
      it("should return note's props", () => {
        assert.deepStrictEqual(nt.get("_rev"), rev);
        assert.deepStrictEqual(nt.get("_id"), id);
        assert.deepStrictEqual(nt.get("_val"), val);
        assert.deepStrictEqual(nt.get("_prev"), prev);
        assert.deepStrictEqual(nt.get("_src"), src);
      });
    });
  });
});
