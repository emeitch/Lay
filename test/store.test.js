import assert from 'assert';

import UUID from '../src/uuid';
import v from '../src/v';
import { path } from '../src/path';
import { ref } from '../src/ref';
import { pack } from '../src/pack';
import Act from '../src/act';
import Store from '../src/store';


describe("Store", () => {
  let store;
  beforeEach(() => {
    store = new Store();
  });

  describe("constructor", () => {
    it("should create new store object", () => {
      assert(store);
    });
  });

  describe("#put (#get)", () => {
    it("should store the object", () => {
      const id = new UUID();
      const obj = v({
        _id: id,
        foo: 1,
        bar: "abc"
      });
      store.put(obj);

      assert.deepStrictEqual(store.fetch(id).get("foo"), v(1));

      assert.deepStrictEqual(path(id, "_rev", "_type").reduce(store), ref("Revision").reduce(store));
      assert.deepStrictEqual(path(id, "_rev", "at", "_type").reduce(store), ref("Date").reduce(store));
    });

    context("with pack id", () => {
      it("should store the object", () => {
        const id = new UUID();
        const obj = v({
          _id: pack(id),
          foo: 1,
          bar: "abc"
        });
        store.put(obj);

        assert.deepStrictEqual(store.fetch(id).get("foo"), v(1));
        assert.deepStrictEqual(path(id, "_id").reduce(store), pack(id));
      });

      context("ref id", () => {
        it("should store the object", () => {
          const id = ref("Foo");
          const obj = v({
            _id: pack(id),
            foo: 1,
            bar: "abc"
          });
          store.put(obj);

          assert.deepStrictEqual(store.fetch(id).get("foo"), v(1));
          assert.deepStrictEqual(path(id, "_id").reduce(store), pack(id));
        });
      });

      context("path id", () => {
        it("should store the object", () => {
          const id0 = new UUID();
          store.put({
            _id: id0
          });

          const id1 = new UUID();
          const id2 = path(id0, id1);
          const obj = v({
            _id: pack(id2),
            foo: 1,
            bar: "abc"
          });
          store.put(obj);

          assert.deepStrictEqual(store.fetch(id2).get("foo"), v(1));
          assert.deepStrictEqual(path(id0, id1, "_id").reduce(store), pack(id2));
          assert.deepStrictEqual(path(id2, "_id").reduce(store), pack(id2));
        });
      });
    });

    context("not sym type", () => {
      it("should throw error", () => {
        assert.throws(() => {
          store.put({
            _id: new UUID(),
            _type: path("Foo") // error type
          });
        }, /bad type reference style:/);
      });
    });

    context("different _rev", () => {
      it("should optimistic lock", () => {
        const id = new UUID();
        store.put({
          _id: id,
          foo: 3
        });
        assert.deepStrictEqual(store.fetch(id).get("foo"), v(3));

        const old = store.fetch(id);

        store.put(old.patch({
          foo: 4
        })); // update _rev
        assert.deepStrictEqual(store.fetch(id).get("foo"), v(4));

        assert.throws(() => {
          store.put(old.patch({
            foo: 5
          }));
        }, /optimistic locked: specified _rev is not latest/);

        assert.throws(() => {
          store.put(old.patch({
            _rev: null,
            foo: 5
          }));
        }, /optimistic locked: _rev is not specified/);
      });
    });

    context("stored context object", () => {
      const id0 = new UUID();
      const id1 = new UUID();
      const id2 = new UUID();
      const key0 = v("foo");
      const key1 = v("bar");

      it("should return context object", () => {
        store.put({
          _id: id0
        });

        const cpath = store.path(id0, id1);
        store.put({
          _id: cpath
        });

        const base = store.fetch(id0);
        const context = store.fetch(cpath);
        assert.deepStrictEqual(base.get(id1, store), context);
      });

      context("multiple id", () => {
        it("should return context object", () => {
          store.put({
            _id: id0
          });

          const cpath0 = store.path(id0, id1);
          store.put({
            _id: cpath0
          });

          const cpath1 = store.path(id0, id1, id2);
          store.put({
            _id: cpath1
          });

          const base = store.fetch(id0);
          const context = store.fetch(cpath1);
          assert.deepStrictEqual(base.get(id1, store).get(id2, store), context);
        });

        context("reduced path obj is a intermediate context obj", () => {
          it("should return context object", () => {
            store.put({
              _id: id0
            });

            const cpath0 = store.path(id0, id1);
            store.put({
              _id: cpath0
            });

            const cpath1 = store.path(id0, id1, id2);
            store.put({
              _id: cpath1
            });

            store.put({
              _id: "foo",
              bar: cpath0
            });

            const context = store.fetch(cpath1);
            assert.deepStrictEqual(path("foo", "bar", id2).reduce(store), context);
          });
        });

        context("not exist intermediate context obj", () => {
          it("should throw a error", () => {
            const cpath = store.path(id0, id1, id2);

            assert.throws(() => {
              store.put({
                _id: cpath
              });
            }, /intermediate objs not found/);
          });
        });
      });

      context("all str keys path", () => {
        it("should return embeded object", () => {
          const epath = store.path(id0, key0, key1);
          store.put({
            _id: epath
          });

          // not a independent obj, but a embeded obj
          const context = store.fetch(epath);
          assert.deepStrictEqual(context, undefined);

          const base = store.fetch(id0);
          const child1 = base.get(key0, store);
          const child2 = child1.get(key1, store);
          assert(child2);
        });

        context("exist partial obj", () => {
          it("should update the partial object", () => {
            store.put({
              _id: id0,
              [key0.origin]: {
                [key1.origin]: {
                  foo: 1,
                  bar: "abc"
                }
              }
            });

            const epath = path(id0, key0, key1);
            assert.deepStrictEqual(epath.reduce(store), v({
              _id: epath,
              foo: 1,
              bar: "abc"
            }));

            store.put({
              _id: epath,
              foo: 2,
            });
            assert.deepStrictEqual(epath.reduce(store), v({
              _id: epath,
              foo: 2,
              bar: "abc"
            }));
          });
        });
      });

      context("intermediate str key path", () => {
        it("should throw a error", () => {
          store.put({
            _id: id0,
            foo: {
              bar: {
              }
            }
          });

          const cpath = store.path(id0, key0, key1, id1);
          assert.throws(() => {
            store.put({
              _id: cpath
            });
          }, /intermediate objs are not context objs/);
        });

        context("not exist intermediate embeded obj", () => {
          it("should throw a error", () => {
            const cpath = store.path(id0, key0, key1, id1);
            assert.throws(() => {
              store.put({
                _id: cpath
              });
            }, /intermediate objs are not context objs/);
          });
        });
      });

      context("method applying path", () => {
        it("should throw a error", () => {
          const cpath = store.path(id0, [key0, v(1)]);
          assert.throws(() => {
            store.put({
              _id: cpath
            });
          }, /cannot set method applying path to _id/);
        });
      });
    });

    context("with path whose last key is string", () => {
    });
  });

  describe("#patch", () => {
    it("should patch the diff", () => {
      const id = new UUID();
      store.patch(id, {
        foo: 3
      });

      assert.deepStrictEqual(store.fetch(id).getOwnProp("foo"), v(3));
    });

    context("patch child properties", () => {
      it("should patch the partial diff", () => {
        const id = new UUID();
        store.patch(id, {
          foo: {
            bar: 2
          }
        });
        assert.deepStrictEqual(path(id, "foo", "bar").reduce(store), v(2));

        store.patch(id, {
          foo: {
            buz: 4
          }
        });
        assert.deepStrictEqual(path(id, "foo", "bar").reduce(store), v(2)); // keep
        assert.deepStrictEqual(path(id, "foo", "buz").reduce(store), v(4));
      });
    });

    context("patch child properties to null", () => {
      it("should patch the partial diff", () => {
        const id = new UUID();
        store.patch(id, {
          foo: {
            bar: 2,
            buz: 4
          }
        });
        assert.deepStrictEqual(path(id, "foo", "bar").reduce(store), v(2));
        assert.deepStrictEqual(path(id, "foo", "buz").reduce(store), v(4));
        const rev = path(id, "_rev").reduce(store);

        store.patch(id, {
          foo: {
            buz: null
          }
        });
        assert.deepStrictEqual(path(id, "foo", "bar").reduce(store), v(2)); // keep
        const p = path(id, "foo", "buz");
        assert.deepStrictEqual(p.reduce(store), p);
        assert.deepStrictEqual(path(id, "_prev").reduce(store), rev);
      });
    });
  });

  describe("#merge", () => {
    it("should merge the patch", () => {
      store.merge({
        foo: {
          a: 1,
          b: "c"
        },
        bar: 1
      });

      assert.deepStrictEqual(store.fetch("foo").getOwnProp("a"), v(1));
      assert.deepStrictEqual(store.fetch("foo").getOwnProp("b"), v("c"));

      assert.deepStrictEqual(store.fetch("bar").getOwnProp("_target"), v(1));
    });

    context("uuid", () => {
      it("should merge the patch", () => {
        const id = new UUID();
        const patch = {
          [id.stringify()]: {
            a: 1
          }
        };
        store.merge(patch);

        assert.deepStrictEqual(store.fetch(id).getOwnProp("a"), v(1));
      });
    });

    context("an object exists", () => {
      it("should merge the properties", () => {
        store.merge({
          foo: {
            a: 1,
          },
        });

        assert.deepStrictEqual(store.fetch("foo").getOwnProp("a"), v(1));

        store.merge({
          foo: {
            b: 2,
            c: 3
          },
        });
        assert.deepStrictEqual(store.fetch("foo").getOwnProp("a"), v(1));
        assert.deepStrictEqual(store.fetch("foo").getOwnProp("b"), v(2));
        assert.deepStrictEqual(store.fetch("foo").getOwnProp("c"), v(3));
      });
    });
  });

  describe("handle onPut", () => {
    it("should handle onPut handler", () => {
      let a = 0;
      store.assign("onPut", new Act(objs => {
        const hasProp = objs.some(o => {
          const foo = o.get("foo", store);
          return foo && foo.equals(v("bar"));
        });
        if (hasProp) {
          a = 1;
        }
      }));

      assert.deepStrictEqual(a, 0);

      store.put({
        _id: new UUID(),
        foo: "bar"
      });

      assert.deepStrictEqual(a, 1);
    });
  });

  describe("handle onImport", () => {
    it("should handle onImport handler", () => {
      const lib = new Store();
      let a = 0;
      lib.assign("onImport", new Act(() => {
        a = 1;
      }));

      assert.deepStrictEqual(a, 0);

      store.import(lib);

      assert.deepStrictEqual(a, 1);
    });
  });

  describe("#currentStore", () => {
    it("should return the store", () => {
      assert.deepStrictEqual(store.fetch("currentStore").reduce(store).get("_id"), store.id.keyVal());
    });
  });

  describe("#run", () => {
    it("should run act", () => {
      store.run(v(1)); // pass

      let a = 0;
      const act1 = new Act(() => {
        a = 1;
      });

      let b = 0;
      let c = 0;
      const act2 = new Act(() => {
        b = 2;
        return v([new Act(() => { c = 3; }), v(null)]);  // within null as nop
      });

      store.run(v([act1, act2]));
      assert.deepStrictEqual(a, 1);
      assert.deepStrictEqual(b, 2);
      assert.deepStrictEqual(c, 3);
    });

    context("invalid act", () => {
      it("should throw error", () => {
        assert.throws(() => {
          store.run(v([1]));
        }, /not Act instance:/);
      });
    });
  });
});
