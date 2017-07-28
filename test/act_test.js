import assert from 'assert';

import Act from '../src/act';

describe("Act", () => {
  describe("#run", () => {
    it("should execute the act as async", () => {
      let executed = false;
      const act = new Act(() => { executed = true; });
      act.run();
      assert(executed === true);
    });
  });

  describe("#chain", () => {
    it("should chain next act", () => {
      let firstFinished = false;
      const first = new Act(() => { firstFinished = true; });

      let secondFinished = false;
      const second = new Act(() => { secondFinished = true; });

      let thirdFinished = false;
      const third = new Act(() => { thirdFinished = true; });

      let act = first.chain(second).chain(third);
      act.run();
      assert(firstFinished === true);
      assert(secondFinished === false);
      assert(thirdFinished === false);

      act = act.next;
      act.run();
      assert(firstFinished === true);
      assert(secondFinished === true);
      assert(thirdFinished === false);

      act = act.next;
      act.run();
      assert(firstFinished === true);
      assert(secondFinished === true);
      assert(thirdFinished === true);

      assert(act.next === undefined);
    });
  });
});
