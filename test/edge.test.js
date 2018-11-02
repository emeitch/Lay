import assert from 'assert';

import Edge from '../src/edge';
import UUID from '../src/uuid';
import v from '../src/v';

describe("Edge", () => {
  describe("#constructor", () => {
    it("should return a Edge object", () => {
      const tail = new UUID();
      const label = "label1";
      const head = new UUID();
      const rev = new UUID();
      const e = new Edge(tail, label, head, rev);

      assert.deepStrictEqual(e.tail, tail);
      assert.deepStrictEqual(e.label, v(label));
      assert.deepStrictEqual(e.head, head);
      assert.deepStrictEqual(e.rev, rev);
    });

    context("with revision", () => {
      it("should return a Edge object with rev", () => {
        const tail = new UUID();
        const label = "label1";
        const head = new UUID();
        const rev = new UUID();
        const e = new Edge(tail, label, head, rev);

        assert.deepStrictEqual(e.tail, tail);
        assert.deepStrictEqual(e.label, v(label));
        assert.deepStrictEqual(e.head, head);
        assert.deepStrictEqual(e.rev, rev);
      });
    });
  });
});
