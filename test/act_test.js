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

      assert(act.pending);
      assert(!act.settled);

      act = act.proceed();

      assert(executed === true);
      assert(act.fulfilled);
      assert(act.val === "finished");
      assert(act.settled);
    });

    context("with exception", () => {
      it("should move to rejected status", () => {
        let executed = false;
        let act = new Act(() => {
          executed = true;
          throw "an error";
        });

        act = act.proceed();

        assert(executed === true);
        assert(act.rejected);
        assert(act.val === "an error");
        assert(act.settled);
      });
    });

    context("with unknown status", () => {
      it("should throw error", () => {
        const act = new Act(() => {}, "UNKNOWN_STATUS");
        assert.throws(() => { act.proceed(); }, /can't proceed for unknown status:/);
      });
    });
  });

  describe("#then", () => {
    it("should then next act", () => {
      let firstFinished = false;
      const first = new Act(() => { firstFinished = true; });

      let secondFinished = false;
      const second = new Act(() => { secondFinished = true; });

      let thirdFinished = false;
      const third = new Act(() => {
        thirdFinished = true;
        return "all finished";
      });

      let act = first.then(second).then(third);
      
      act = act.proceed();

      assert(firstFinished === true)
      assert(secondFinished === false);
      assert(thirdFinished === false);

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

      assert.throws(() => { act.proはceed(); }, /next act not found error/);
    });

    context("with nested act", () => {
      it("should then nested act", () => {
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
        const nested = first.then(second);

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

        let act = parentFirst.then(parentSecond);
        
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

    context("with exception", () => {
      it("should then nested act", () => {
        const first = new Act(() => { throw "an error"; });
        const second = new Act(() => { return "finished"; });

        let act = first.then(second);
        
        act = act.proceed();

        assert(act.rejected);
        assert(act.val === "an error");
        assert(act.next !== undefined);

        act = act.proceed();

        assert(act.rejected);
        assert(act.val === "an error");
        assert(act.next === undefined);

        assert.throws(() => { act.proceed(); }, /next act not found error/);
      });
    });
  });

  describe("#catch", () => {
    it("should then nested act", () => {
      const first = new Act(() => { throw "an error"; });
      const second = new Act(() => { return "finished"; });
      let catched = false;
      const ctch = new Act((err) => {
        catched = true;
        assert(err === "an error");
        return "recovered";
      });

      let act = first.catch(ctch).then(second);
      act = act.proceed();

      assert(catched === false);
      assert(act.rejected);
      assert(act.val === "an error");
      assert(act.next !== undefined);

      act = act.proceed();

      assert(catched === true);
      assert(act.fulfilled);
      assert(act.val === "recovered");
      assert(act.next !== undefined);

      act = act.proceed();
      
      assert(act.fulfilled);
      assert(act.val === "finished");
      assert(act.next === undefined);
    });
  });
});
