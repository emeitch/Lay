import assert from 'assert';

import Edge from '../src/edge';

describe("Edge", () => {
  describe("#constructor", () => {
    it("should return a Edge object", () => {
      const tail = {};
      const label = "label1";
      const head = {};
      const e = new Edge(tail, label, head);

      assert(e.tail === tail);
      assert(e.label === label);
      assert(e.head === head);
      assert(e.rev === null);
    });

    context("with revision", () => {
      it("should return a Edge object with rev", () => {
        const tail = {};
        const label = "label1";
        const head = {};
        const rev = {};
        const e = new Edge(tail, label, head, rev);

        assert(e.tail === tail);
        assert(e.label === label);
        assert(e.head === head);
        assert(e.rev === rev);
      });
    });
  });
});
