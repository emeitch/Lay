import assert from 'assert';

import v from '../src/v';
import { sym } from '../src/sym';
import Store from '../src/store';
import { exp } from '../src/exp';
import { kase, alt, grd, otherwise, Func } from '../src/case';

describe("Case", () => {
  let store;
  beforeEach(() => {
    store = new Store();
  });

  describe("#reduce", () => {
    context("unmatching", () => {
      it("should throws a error", () => {
        const e = exp(
          kase(
            alt(v(0), v("result"))
          ),
          v(1)
        );
        assert.throws(() => e.reduce(store), /matched pattern not found/);
      });
    });

    context("matching val pattern", () => {
      it("should reduce the matched result exp", () => {
        const e = exp(
          kase(
            alt(v(1), v("result"))
          ),
          v(1)
        );
        assert.deepStrictEqual(e.reduce(store), v("result"));
      });
    });

    context("multi patterns", () => {
      it("should reduce the matched result exp", () => {
        const e = exp(
          kase(
            alt(v(1), v("result1")),
            alt(v(2), v("result2")),
            alt(v(3), v("result3"))
          ),
          v(3)
        );
        assert.deepStrictEqual(e.reduce(store), v("result3"));
      });
    });

    context("exp value", () => {
      it("should reduce the exp value", () => {
        const e = exp(
          kase(
            alt(
              v(3),
              exp(
                Func.func("x", "y", (x, y) => x * y),
                v(4),
                v(5)
              )
            )
          ),
          v(3)
        );
        assert.deepStrictEqual(e.reduce(store), v(20));
      });
    });

    context("reference a matched pattern", () => {
      it("should reduce the matched result exp", () => {
        const e = exp(
          kase(
            alt(
              "x",
              exp(
                Func.func("x", "y", (x, y) => x * y),
                "x",
                "x"
              )
            )
          ),
          v(3)
        );
        assert.deepStrictEqual(e.reduce(store), v(9));
      });
    });

    context("with guards", () => {
      it("should reduce the matched guard result exp", () => {
        const a = alt(
          "x",
          [
            grd(
              exp(
                Func.func("y", y => y < 5),
                "x"
              ),
              v(5)
            ),
            grd(
              exp(
                Func.func("y", y => y >= 5),
                "x"
              ),
              v(10)
            )
          ]
        );

        const r1 = exp(kase(a), v(3)).reduce(store);
        assert.deepStrictEqual(r1, v(5));

        const r2 = exp(kase(a), v(8)).reduce(store);
        assert.deepStrictEqual(r2, v(10));
      });
    });

    context("with otherwise", () => {
      it("should reduce the otherwise guard result exp", () => {
        const a = alt(
          "x",
          [
            grd(
              exp(
                Func.func("y", y => y < 5),
                "x"
              ),
              v(5)
            ),
            grd(
              otherwise,
              v(10)
            )
          ]
        );

        const r1 = exp(kase(a), v(3)).reduce(store);
        assert.deepStrictEqual(r1, v(5));

        const r2 = exp(kase(a), v(8)).reduce(store);
        assert.deepStrictEqual(r2, v(10));
      });
    });

    context("multiple patterns", () => {
      it("should reduce the matched result exp", () => {
        const a = alt(
          "x",
          "y",
          "z",
          [
            grd(
              exp(
                Func.func("x", "y", "z", (x, y, z) => x == y && y == z),
                "x",
                "y",
                "z"
              ),
              v(5)
            ),
            grd(
              otherwise,
              v(10)
            )
          ]
        );

        const r1 = exp(kase(a), v(3), v(3), v(3)).reduce(store);
        assert.deepStrictEqual(r1, v(5));

        const r2 = exp(kase(a), v(3), v(4), v(5)).reduce(store);
        assert.deepStrictEqual(r2, v(10));
      });
    });

    context("unmatching comp tuple pattern", () => {
      it("should throws a error", () => {
        const e = exp(
          kase(
            alt(
              v("Foo", [sym("a"), sym("b")]),
              v("unmatched pattern")
            )
          ),
          v("Bar", [2, 3])
        );
        assert.throws(() => e.reduce(store), /matched pattern not found/);
      });
    });

    context("matching comp tuple pattern", () => {
      it("should reduce the matched result exp", () => {
        const e = exp(
          kase(
            alt(
              v("Foo", [sym("a"), sym("b")]),
              exp(
                Func.func("x", "y", (x, y) => x * y),
                "a",
                "b"
              )
            )
          ),
          v("Foo", [2, 3])
        );
        assert.deepStrictEqual(e.reduce(store), v(6));
      });
    });

    context("matching nested comp tuple pattern", () => {
      it("should reduce the matched result exp", () => {
        const e = exp(
          kase(
            alt(
              v("Foo", [v("Bar", [sym("a"), sym("b")])]),
              exp(
                Func.func("x", "y", (x, y) => x * y),
                "a",
                "b"
              )
            )
          ),
          v("Foo", [v("Bar", [3, 4])])
        );
        assert.deepStrictEqual(e.reduce(store), v(12));
      });
    });

    context("matching comp record pattern", () => {
      it("should reduce the matched result exp", () => {
        const e = exp(
          kase(
            alt(
              v("Foo", {a: sym("a"), b: sym("b")}),
              exp(
                Func.func("x", "y", (x, y) => x * y),
                "a",
                "b"
              )
            )
          ),
          v("Foo", {a: 2, b: 3})
        );
        assert.deepStrictEqual(e.reduce(store), v(6));
      });
    });

    context("matching comp premitive pattern", () => {
      it("should reduce the matched result exp", () => {
        const e = exp(
          kase(
            alt(
              v("Foo", sym("a")),
              exp(
                Func.func("x", x => x * 3),
                "a"
              )
            )
          ),
          v("Foo", 2)
        );
        assert.deepStrictEqual(e.reduce(store), v(6));
      });
    });

    context("matching nested comp record pattern", () => {
      it("should reduce the matched result exp", () => {
        const e = exp(
          kase(
            alt(
              v("Foo", {nested: v("Bar", {a: sym("a")}), b: sym("b")}),
              exp(
                Func.func("x", "y", (x, y) => x * y),
                "a",
                "b"
              )
            )
          ),
          v("Foo", {nested: v("Bar", {a: 2}), b: 3})
        );
        assert.deepStrictEqual(e.reduce(store), v(6));
      });
    });

    context("0 arity func", () => {
      it("should reduce the func", () => {
        const f = Func.func(() => 2 * 3);
        assert.deepStrictEqual(f.reduce(store), v(6));

        const f2 = Func.func("x", x => x * 3);
        assert.deepStrictEqual(f2.reduce(store).constructor, Func);
        assert.deepStrictEqual(exp(f2, v(4)).reduce(store), v(12));
      });
    });
  });
});
