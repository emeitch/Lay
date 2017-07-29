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
      act = act.run();
      assert(firstFinished === true);
      assert(secondFinished === false);
      assert(thirdFinished === false);

      act = act.run();
      assert(firstFinished === true);
      assert(secondFinished === true);
      assert(thirdFinished === false);

      act = act.run();
      assert(firstFinished === true);
      assert(secondFinished === true);
      assert(thirdFinished === true);

      assert(act === undefined);
    });

    context("with nested act", () => {
      it("should chain nested act", () => {
        let nestedFirstFinished = false;
        const first = new Act(() => { nestedFirstFinished = true; });
        let nestedSecondFinished = false;
        const second = new Act(() => { nestedSecondFinished = true; });
        const nested = first.chain(second);

        let parentFirstFinished = false;
        const parentFirst = new Act(() => {
          parentFirstFinished = true;
          return nested;
        });
        let parentSecondFinished = false;
        const parentSecond = new Act(() => { parentSecondFinished = true; });

        let act = parentFirst.chain(parentSecond);
        act = act.run();
        assert(parentFirstFinished === true);
        assert(nestedFirstFinished === false);
        assert(nestedSecondFinished === false);
        assert(parentSecondFinished === false);

        act = act.run();
        assert(parentFirstFinished === true);
        assert(nestedFirstFinished === true);
        assert(nestedSecondFinished === false);
        assert(parentSecondFinished === false);

        act = act.run();
        assert(parentFirstFinished === true);
        assert(nestedFirstFinished === true);
        assert(nestedSecondFinished === true);
        assert(parentSecondFinished === false);

        act = act.run();
        assert(parentFirstFinished === true);
        assert(nestedFirstFinished === true);
        assert(nestedSecondFinished === true);
        assert(parentSecondFinished === true);

        assert(act === undefined);
      });
    });
  });
});
