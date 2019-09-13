import assert from 'assert';

import Store from '../src/store';
import v from '../src/v';

describe("Time", () => {
  describe("#typeName", () => {
    it("should return a sym to Date", () => {
      const cd = v(new Date());
      assert.deepStrictEqual(cd.typeName, "Time");
    });
  });

  describe("#object", () => {
    it("should return a sym to Date", () => {
      const date = new Date("2018-01-01T00:00:00z");
      const cd = v(date);

      const store = new Store();
      assert.deepStrictEqual(cd.object(store), {
        origin: "2018-01-01T00:00:00.000Z",
        _proto: "Time",
      });
    });
  });

  describe("stringify", () => {
    it("should return string dump", () => {
      const date = new Date("2018-01-01T00:00:00+0900");
      const cd = v(date);
      assert.deepStrictEqual(cd.stringify(), "Time { iso: \"2017-12-31T15:00:00.000Z\" }");
    });
  });
});
