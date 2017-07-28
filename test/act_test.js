import assert from 'assert';

import Act from '../src/act';

describe("Act", () => {
  describe("#run", () => {
    it("should execute the act as async", () => {
      let executed = false;
      const act = new Act(() => { executed = true; });

      assert(executed === false);

      return act.run().then(() => {
        assert(executed === true);
      });
    });
  });

  describe("#and", () => {
    it("should execute first, second and third acts", () => {
      let firstFinished = false;
      const first = new Act(() => { firstFinished = true; });

      let secondFinished = false;
      const second = new Act(() => { secondFinished = true; });

      let thirdFinished = false;
      const third = new Act(() => { thirdFinished = true; });

      return first.and(second).and(third).run().then(() => {
        assert(firstFinished === true);
        assert(secondFinished === true);
        assert(thirdFinished === true);
      });
    });
  });
});
