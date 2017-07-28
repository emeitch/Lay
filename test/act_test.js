import assert from 'assert';

import Act from '../src/act';

describe("Act", () => {
  describe("#run", () => {
    let act;
    let executed = false;
    before(() => {
      act = new Act(() => { executed = true; });
    });

    it("should execute the act", () => {
      assert(executed === false);
      act.run(); // sync
      assert(executed === true);
    });
  });

  describe("#and", () => {
    it("should execute first and second acts", () => {
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
