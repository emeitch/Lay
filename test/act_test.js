import assert from 'assert';

import Act from '../src/act';

describe("Act", () => {

  describe("#run", () => {
    let act;
    let executed = false;
    before(() => {
      act = new Act(() => {
        executed = true;
      });
    });

    it("should execute the act", () => {
      act.run();
      assert(executed === true);
    });
  });
});
