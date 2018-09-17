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
      assert(e.prev === undefined);
    });

    context("with before", () => {
      it("should return a Edge object with before", () => {
        const tail = {};
        const label = "label1";
        const head = {};
        const prev = {};
        const e = new Edge(tail, label, head, prev);

        assert(e.tail === tail);
        assert(e.label === label);
        assert(e.head === head);
        assert(e.prev === prev);
      });
    });
  });
});
