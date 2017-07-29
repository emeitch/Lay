import assert from 'assert';

import Act from '../src/act';

describe("Act", () => {
  describe("#proceed", () => {
    it("should execute the act as async", () => {
      let executed = false;
      let act = new Act(() => {
        executed = true;
        return "finished";
      });
      act = act.proceed();
      assert(executed === true);
      assert(act.fulfilled);
      assert(act.val === "finished");
      assert(act.settled);
    });
  });

  describe("#chain", () => {
    it("should chain next act", () => {
      let firstFinished = false;
      const first = new Act(() => { firstFinished = true; });

      let secondFinished = false;
      const second = new Act(() => { secondFinished = true; });

      let thirdFinished = false;
      const third = new Act(() => {
        thirdFinished = true;
        return "all finished";
      });

      let act = first.chain(second).chain(third);
      act = act.proceed();
      assert(firstFinished === true);
      assert(secondFinished === false);
      assert(thirdFinished === false);

      console.log(act);
      act = act.proceed();
      assert(firstFinished === true);
      assert(secondFinished === true);
      assert(thirdFinished === false);

      act = act.proceed();
      assert(firstFinished === true);
      assert(secondFinished === true);
      assert(thirdFinished === true);

      assert(act.fulfilled);
      assert(act.val === "all finished");
    });

    context("with nested act", () => {
      it("should chain nested act", () => {
        let nestedFirstFinished = false;
        const first = new Act(() => {
          nestedFirstFinished = true;
          return "nestedFirst";
        });
        let nestedSecondFinished = false;
        const second = new Act((val) => {
          assert(val === "nestedFirst");
          nestedSecondFinished = true;
          return "nestedSecond";
        });
        const nested = first.chain(second);

        let parentFirstFinished = false;
        const parentFirst = new Act(() => {
          parentFirstFinished = true;
          return nested;
        });
        let parentSecondFinished = false;
        const parentSecond = new Act((val) => {
          assert(val === "nestedSecond");
          parentSecondFinished = true;
          return "all finished";
        });

        let act = parentFirst.chain(parentSecond);
        act = act.proceed();
        assert(parentFirstFinished === true);
        assert(nestedFirstFinished === false);
        assert(nestedSecondFinished === false);
        assert(parentSecondFinished === false);

        act = act.proceed();
        assert(parentFirstFinished === true);
        assert(nestedFirstFinished === true);
        assert(nestedSecondFinished === false);
        assert(parentSecondFinished === false);

        act = act.proceed();
        assert(parentFirstFinished === true);
        assert(nestedFirstFinished === true);
        assert(nestedSecondFinished === true);
        assert(parentSecondFinished === false);

        act = act.proceed();
        assert(parentFirstFinished === true);
        assert(nestedFirstFinished === true);
        assert(nestedSecondFinished === true);
        assert(parentSecondFinished === true);

        assert(act.fulfilled);
        assert(act.val === "all finished");
      });
    });
  });
});
