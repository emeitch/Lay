import assert from 'assert';

import Edge from '../src/edge';
import v from '../src/v';

describe("Edge", () => {
  describe("#constructor", () => {
    it("should return a Edge object", () => {
      const tail = {};
      const label = "label1";
      const head = {};
      const rev = {};
      const e = new Edge(tail, label, head, rev);

      assert(e.tail === tail);
      assert.deepStrictEqual(e.label, v(label));
      assert(e.head === head);
      assert(e.rev === rev);
    });

    context("with revision", () => {
      it("should return a Edge object with rev", () => {
        const tail = {};
        const label = "label1";
        const head = {};
        const rev = {};
        const e = new Edge(tail, label, head, rev);

        assert(e.tail === tail);
        assert.deepStrictEqual(e.label, v(label));
        assert(e.head === head);
        assert(e.rev === rev);
      });
    });
  });
});
