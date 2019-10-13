import assert from 'assert';

import { uuid } from '../src/uuid';
import v from '../src/v';
import { path } from '../src/path';
import Act from '../src/act';
import Store from '../src/store';
import { exp } from '../src/exp';
import { func, plus } from '../src/func';

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
      const id = uuid();
      const obj = v({
        _id: id,
        foo: 1,
        bar: "abc"
      });
      store.put(obj);

      assert.deepStrictEqual(store.fetch(id).get("foo"), v(1));

      const rev = path(id, "_rev").reduce(store);
      assert.deepStrictEqual(path(rev, "_proto").reduce(store), v("Revision"));
      assert.deepStrictEqual(path(rev, "at", "_proto").reduce(store), v("Time"));
    });

    context("with pack id", () => {
      it("should store the object", () => {
        const id = uuid();
        const obj = v({
          _id: id,
          foo: 1,
          bar: "abc"
        });
        store.put(obj);

        assert.deepStrictEqual(store.fetch(id).get("foo"), v(1));
        assert.deepStrictEqual(path(id, "_id").reduce(store), id);
      });

      context("path id", () => {
        it("should store the object", () => {
          const id0 = uuid();
          store.put({
            _id: id0
          });

          const id1 = uuid();
          const id2 = path(id0, id1);
          const obj = v({
            _id: id2,
            foo: 1,
            bar: "abc"
          });
          store.put(obj);

          assert.deepStrictEqual(store.fetch(id2).get("foo"), v(1));
          assert.deepStrictEqual(path(id0, id1, "_id").reduce(store), id2.keyVal());
          assert.deepStrictEqual(path(id2, "_id").reduce(store), id2.keyVal());
        });
      });
    });

    context("a not string as _proto", () => {
      it("should throw error", () => {
        assert.throws(() => {
          store.put({
            _id: uuid(),
            _proto: v(123) // not string
          });
        }, /Bad proto name style:/);
      });
    });

    context("different _rev", () => {
      it("should optimistic lock", () => {
        const id = uuid();
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

    context("stored a inner object", () => {
      const id0 = uuid();
      const id1 = uuid();
      const id2 = uuid();
      const id3 = uuid();
      const key0 = v("foo");
      const key1 = v("bar");

      it("should return the inner object", () => {
        store.put({
          _id: id0
        });

        const cpath = store.path(id0, id1);
        store.put({
          _id: cpath
        });

        const outer = store.fetch(id0);
        const inner = store.fetch(cpath);
        assert.deepStrictEqual(outer.get(id1, store), inner);

        const pstr = v(`${id0.keyString()}.${id1.keyString()}`);
        assert.deepStrictEqual(inner.getOwnProp("_id"), pstr);
      });

      context("multiple id", () => {
        it("should return a inner object", () => {
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

          const outer = store.fetch(id0);
          const inner = store.fetch(cpath1);
          assert.deepStrictEqual(outer.get(id1, store).get(id2, store), inner);
        });

        context("reduced path obj is a intermediate inner obj", () => {
          it("should return the inner object", () => {
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

            const cpath2 = store.path(id0, id1, id2, id3);
            store.put({
              _id: cpath2
            });

            store.put({
              _id: "foo",
              bar: path(cpath0)
            });

            const inner = store.fetch(cpath2);
            assert.deepStrictEqual(path("foo", "bar", id2, id3).reduce(store), inner);
          });
        });

        context("with _stereo", () => {
          it("should behave a default proto of the inner object", () => {
            store.put({
              _id: "Bar",
              bar: v(3)
            });
            store.put({
              _id: "Foo",
              _stereo: "Bar"
            });
            store.put({
              _proto: "Foo",
              _id: id0
            });

            // not exist the inner object (implicit inner object)
            const cpath0 = store.path(id0, id1);
            assert.deepStrictEqual(path(id0, id1, "bar").reduce(store), v(3));

            // exist the inner object (explicit inner object)
            store.put({
              _id: cpath0
            });
            assert.deepStrictEqual(path(id0, id1, "bar").reduce(store), v(3));

            // the inner object with own props
            store.patch(cpath0, {
              bar: v(4)
            });
            assert.deepStrictEqual(path(id0, id1, "bar").reduce(store), v(4));
          });
        });

        context("without _stereo", () => {
          it("should behave a default proto of the inner object", () => {
            store.put({
              _proto: "Foo",
              _id: id0
            });

            // not exist the inner object (implicit inner object)
            const cpath0 = store.path(id0, id1);
            assert.deepStrictEqual(path(id0, id1, "bar").reduce(store), path(id0, id1, "bar"));

            // exist the inner object (explicit inner object)
            store.put({
              _id: cpath0
            });
            assert.deepStrictEqual(path(id0, id1, "bar").reduce(store), path(id0, id1, "bar"));

            // the inner object with own props
            store.patch(cpath0, {
              bar: v(4)
            });
            assert.deepStrictEqual(path(id0, id1, "bar").reduce(store), v(4));
          });

          context("with Entity", () => {
            it("should return a Entity's property", () => {
              store.put({
                _id: "Entity",
                bar: v(4)
              });
              store.put({
                _id: "Foo",
              });
              store.put({
                _proto: "Foo",
                _id: id0
              });

              assert.deepStrictEqual(path(id0, "bar").reduce(store), v(4));
            });
          });
        });

        context("not exist intermediate inner objs", () => {
          it("should throw a error", () => {
            const cpath = store.path(id0, id1, id2);

            assert.throws(() => {
              store.put({
                _id: cpath
              });
            }, /intermediate object not found/);
          });
        });
      });

      context("all str keys path", () => {
        it("should return the partial object", () => {
          const epath = store.path(id0, key0, key1);
          store.put({
            _id: epath,
            foo: 3
          });

          // not a independent obj, but a embeded obj
          const partial = store.fetch(epath);
          assert.deepStrictEqual(partial.get("foo"), v(3));

          const base = store.fetch(id0);
          const child1 = base.get(key0, store);
          const child2 = child1.get(key1, store);
          assert.deepStrictEqual(child2.get("foo"), v(3));
        });

        context("exist partial obj", () => {
          it("should update the partial object", () => {
            store.put({
              _id: id0,
              [key0.keyString()]: {
                [key1.keyString()]: {
                  foo: 1,
                  bar: "abc"
                }
              }
            });

            const epath = path(id0, key0, key1);
            assert.deepStrictEqual(epath.reduce(store), v({
              _id: epath.keyString(),
              foo: 1,
              bar: "abc"
            }));

            store.put({
              _id: epath,
              foo: 2,
            });
            assert.deepStrictEqual(epath.reduce(store), v({
              _id: epath.keyString(),
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
          }, /intermediate object are not inner object/);
        });

        context("not exist intermediate embeded object", () => {
          it("should throw a error", () => {
            const cpath = store.path(id0, key0, key1, id1);
            assert.throws(() => {
              store.put({
                _id: cpath
              });
            }, /intermediate object are not inner object/);
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
          }, /cannot contains a method calling/);
        });
      });
    });

    context("_val val", () => {
      it("should handle as value by calling #get", () => {
        const id = uuid();
        store.put({
          _id: id,
          _val: 3
        });

        const obj = store.fetch(id);
        assert.deepStrictEqual(obj.getOwnProp("_id"), id);
        assert.deepStrictEqual(obj.getOwnProp("_val"), v(3));

        const val = store.get(id);
        assert.deepStrictEqual(val, v(3));
      });
    });
    
    context("child doesn't have the prop but parent has it", () => {
      it("should return the parent prop", () => {
        const id = uuid();
        store.put({
          _id: id,
          foo: 3,
          bar: 4,
          baz: {
            foo: 5
          }
        });
        
        const child = path(id, "baz").reduce(store);
        assert.deepStrictEqual(child.get("foo", store), v(5));
        assert.deepStrictEqual(child.get("bar", store), v(4));
        
        assert.deepStrictEqual(path(id, "baz", "bar").reduce(store), v(4));
      });
      
      context("with path prop", () => {
        it("should refer the parent value", () => {
          const id = uuid();
          store.put({
            _id: id,
            foo: 3,
            bar: {
              baz: path("self", "foo")
            }
          });
          
          assert.deepStrictEqual(path(id, "bar", "baz").reduce(store), v(3));
        });
      });
      
      context("with func prop", () => {
        it("should refer the parent value", () => {
          const id = uuid();
          store.put({
            _id: id,
            foo: 3,
            a: {
              bar: 4,
              b: {
                baz: 5,
                c: func("x",
                  exp(plus,
                    exp(plus,
                      exp(plus, "x", path("self", "foo")),
                      path("self", "bar")),
                    path("self", "baz"))
                  )
              }
            }
          });
          
          assert.deepStrictEqual(path(id, "a", "b", ["c", v(2)]).reduce(store), v(14));
        });
      });
      
      context("with proto parent prop", () => {
        it("should not refer the proto parent prop value", () => {
          store.put({
            _id: "Foo",
            protoparentp: 3,
            Bar: {
              protop: 4,
            }
          });
          
          const id = uuid();
          store.put({
            _id: id,
            parentp: 5,
            baz: {
              _proto: "Foo.Bar",
              childp: 6
            }
          });

          assert(path(id, "baz", "childp").reduce(store).equals(v(6))); // self owned prop
          assert(path(id, "baz", "protop").reduce(store).equals(v(4))); // proto chain
          assert(path(id, "baz", "parentp").reduce(store).equals(v(5))); // parent chain
          assert(!path(id, "baz", "protoparentp").reduce(store).equals(v(3))); // proto parent not chained
        });
      });

      context("with parent proto prop", () => {
        it("should not refer the proto parent prop value", () => {
          store.put({
            _id: "Foo",
            parentProtoParentp: 3,
            Bar: {
              parentProtop: 4,
            }
          });
          
          const id = uuid();
          store.put({
            _proto: "Foo.Bar",
            _id: id,
            parentp: 5,
            baz: {
              childp: 6
            }
          });

          assert(path(id, "baz", "childp").reduce(store).equals(v(6))); // self owned prop
          assert(path(id, "baz", "parentp").reduce(store).equals(v(5))); // parent chain
          assert(path(id, "baz", "parentProtop").reduce(store).equals(v(4))); // parent's proto chain
          assert(!path(id, "baz", "protoProtoParentp").reduce(store).equals(v(3))); // parent's proto parent not chained
        });
      });
      
      context("with proto who fetch inherited parent prop", () => {
        it("should not refer the proto parent prop value", () => {
          store.put({
            _id: "Foo",
            Bar: {
              protop: path("self", "inheritedParentp"),
            }
          });
          
          const id = uuid();
          store.put({
            _id: id,
            inheritedParentp: 3,
            foo: {
              _proto: "Foo.Bar",
              childp: path("self", "protop")
            }
          });

          assert(path(id, "foo", "childp").reduce(store).equals(v(3)));
        });
      });
      
      context("with proto parent prop as inherited parent proto prop", () => {
        it("should not refer the proto parent prop value", () => {
          store.put({
            _id: "Foo",
            parentProtop: 3,
            Bar: {
              protop: path("self", "parentProtop"),
            }
          });
          
          const id = uuid();
          store.put({
            _proto: "Foo",
            _id: id,
            foo: {
              _proto: "Foo.Bar",
              childp: path("self", "protop")
            }
          });

          assert.deepStrictEqual(path(id, "foo", "childp").reduce(store), v(3));
        });
      });
    });
  });

  describe("parent", () => {
    it("return the parent obj", () => {
      const id0 = uuid();
      const key0 = v("foo");
      const key1 = v("bar");
      const epath = store.path(id0, key0, key1);
      store.put({
        _id: epath,
        foo: 3
      });

      const base = store.fetch(id0);
      const child1 = base.get(key0, store);
      const child2 = child1.get(key1, store);

      assert.deepStrictEqual(child2.parent(store), child1);
      assert.deepStrictEqual(child1.parent(store), base);
      assert.deepStrictEqual(base.parent(store), undefined);
    });
  });

  describe("#patch", () => {
    it("should patch the diff", () => {
      const id = uuid();
      store.patch(id, {
        foo: 3
      });

      assert.deepStrictEqual(store.fetch(id).getOwnProp("foo"), v(3));
    });

    context("patch child properties", () => {
      it("should patch the partial diff", () => {
        const id = uuid();
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
        const id = uuid();
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

  describe("#set", () => {
    it("should store the prop", () => {
      const id = uuid();
      store.set(id, "foo", v(3));

      assert.deepStrictEqual(store.fetch(id).getOwnProp("foo"), v(3));
    });

    context("with direct stored obj and store obj prop", () => {
      it("should be able to fetch prior the direct stored obj", () => {
        store.set(store.id, "foo", v({bar: v(2)}));
        store.put({
          _id: "foo",
          bar: 3
        });

        // fetched a store obj and get prop
        assert.deepStrictEqual(store.fetch(store.id).getOwnProp("foo").getOwnProp("bar"), v(2));

        // fetched prior a direct stored obj
        assert.deepStrictEqual(store.fetch("foo").getOwnProp("bar"), v(3));
      });
    });

    context("set obj as val", () => {
      it("should set id as val", () => {
        const id = store.create({
          foo: 2
        });
        const obj = store.fetch(id);

        const id2 = store.create({});
        store.set(id2, "bar", obj);
        const obj2 = store.fetch(id2);

        assert.deepStrictEqual(obj2.getOwnProp("bar"), path(id));
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

      assert.deepStrictEqual(store.fetch("bar"), v(1));
    });

    context("uuid", () => {
      it("should merge the patch", () => {
        const id = uuid();
        const patch = {
          [id.keyString()]: {
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
        _id: uuid(),
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

  describe("#create", () => {
    it("should update the obj", () => {
      const id = store.create({
        foo: v(2)
      });

      const obj = store.fetch(id);
      assert.deepStrictEqual(obj.get("foo", store), v(2));
    });

    context("the object already exist", () => {
      it("should throw a error", () => {
        const id = store.create({
          foo: v(2)
        });

        assert.throws(() => {
          store.create({
            _id: id,
            foo: v(3)
          });
        }, /the object already exists. id:/);
      });
    });

    context("set a obj to initial property", () => {
      it("should specify the obj id by path", () => {
        const id = store.create({
          foo: v(2)
        });

        const obj = store.fetch(id);

        const id2 = store.create({
          bar: obj,
          buz: {
            fiz: obj // recursive
          }
        });

        const obj2 = store.fetch(id2);
        assert.deepStrictEqual(obj2.getOwnProp("bar"), path(id));
        assert.deepStrictEqual(obj2.getOwnProp("buz").getOwnProp("fiz"), path(id));
      });
    });
  });

  describe("#update", () => {
    it("should update the obj", () => {
      const id = store.create({
        foo: v(2)
      });

      const obj = store.get(id);
      assert.deepStrictEqual(obj.get("foo", store), v(2));

      store.update(id, {
        foo: v(3)
      });
      const obj2 = store.get(id);
      assert.deepStrictEqual(obj2.get("foo", store), v(3));
    });

    context("apply obj", () => {
      it("should update the obj", () => {
        const id = store.create({
          foo: v(2)
        });

        const obj = store.fetch(id);
        store.update(obj, {
          foo: v(3)
        });

        const obj2 = store.fetch(id);
        assert.deepStrictEqual(obj2.get("foo", store), v(3));
      });
    });

    context("the object dose not exist", () => {
      it("should throw a error", () => {
        const id = uuid();
        assert.throws(() => {
          store.update(id, {
            foo: v(3)
          });
        }, /the object dose not exist. id:/);
      });
    });

    context("with obj property", () => {
      it("should set object id as property", () => {
        const id = uuid();
        store.put({
          _id: id
        });

        const id2 = uuid();
        store.put({
          _id: id2
        });

        const obj = store.fetch(id);
        const obj2 = store.fetch(id2);
        store.update(obj2, {
          foo: obj
        });

        const obj3 = store.fetch(id2);
        assert.deepStrictEqual(obj3.getOwnProp("foo"), path(id));
      });
    });
  });

  describe("#instanceIDs", () => {
    it("should return all instance ids", () => {
      store.put({
        _id: v("Foo")
      });

      const id0 = store.create({
        _proto: v("Foo")
      });
      const id1 = store.create({
        _proto: v("Foo")
      });

      const cls = store.fetch("Foo");
      const all = store.instanceIDs(cls);
      assert.deepStrictEqual(all.length, 2);
      assert.deepStrictEqual(all[0], id0);
      assert.deepStrictEqual(all[1], id1);
    });

    context("with inherited class", () => {
      it("should return all instances without inherited classes", () => {
        store.put({
          _id: v("Foo")
        });

        store.put({
          _proto: v("Foo"),
          _id: v("Bar") // start with uppercase id recognized for class
        });
        store.put({
          _proto: v("Foo"),
          _id: v("Buz") // start with uppercase id recognized for class
        });

        const id0 = store.create({
          _proto: v("Foo")
        });
        const id1 = store.create({
          _proto: v("Foo")
        });

        const cls = store.fetch("Foo");
        const all = store.instanceIDs(cls);
        assert.deepStrictEqual(all.length, 2);
        assert.deepStrictEqual(all[0], id0);
        assert.deepStrictEqual(all[1], id1);
      });
    });

    context("inner object", () => {
      it("should return all with inner object", () => {
        const id0 = store.create({});
        const id1 = store.create({});
        const cpath = store.path(id0, id1);

        store.put({
          _id: v("Foo")
        });

        store.put({
          _proto: v("Foo"),
          _id: cpath
        });

        const cls = store.fetch("Foo");
        const all = store.instanceIDs(cls);
        assert.deepStrictEqual(all.length, 1);
        assert.deepStrictEqual(all[0], cpath.keyVal());
      });
    });

    context("inner object with class", () => {
      it("should return all with inner object", () => {
        store.put({
          _id: v("Bar")
        });
        const id1 = store.create({});
        const cpath = store.path("Bar", id1);


        store.put({
          _id: v("Foo")
        });

        store.put({
          _proto: v("Foo"),
          _id: cpath
        });

        const cls = store.fetch("Foo");
        const all = store.instanceIDs(cls);
        assert.deepStrictEqual(all.length, 1);
        assert.deepStrictEqual(all[0], cpath.keyVal());
      });
    });

    context("with inherited objects", () => {
      it("should return all with inner object", () => {
        store.put({
          _id: v("Foo")
        });

        store.put({
          _proto: v("Foo"),
          _id: v("Bar")
        });

        const id0 = store.create({
          _proto: v("Bar")
        });
        const id1 = store.create({
          _proto: v("Bar")
        });

        const cls = store.fetch("Foo");
        const all = store.instanceIDs(cls);
        assert.deepStrictEqual(all.length, 2);
        assert.deepStrictEqual(all[0], id0);
        assert.deepStrictEqual(all[1], id1);
      });
    });
  });

  describe("#delete", () => {
    it("should delete the obj", () => {
      store.put({
        _id: v("Foo")
      });
      const cls = store.fetch("Foo");

      const id = store.create({
        _proto: v("Foo")
      });

      const all = store.instanceIDs(cls);
      assert.deepStrictEqual(all.length, 1);
      assert.deepStrictEqual(all[0], id);

      store.delete(id);
      const all2 = store.instanceIDs(cls);
      assert.deepStrictEqual(all2.length, 0);
    });

    context("apply obj", () => {
      it("should delete the obj", () => {
        store.put({
          _id: v("Foo")
        });
        const cls = store.fetch("Foo");

        const id = store.create({
          _proto: v("Foo")
        });

        const all = store.instanceIDs(cls);
        assert.deepStrictEqual(all.length, 1);
        assert.deepStrictEqual(all[0], id);

        const obj = store.fetch(id);
        store.delete(obj);
        const all2 = store.instanceIDs(cls);
        assert.deepStrictEqual(all2.length, 0);
      });
    });

    context("the object dose not exist", () => {
      it("should throw a error", () => {
        const id = uuid();
        assert.throws(() => {
          store.delete(id);
        }, /the object dose not exist. id:/);
      });
    });
  });

  describe("#copy", () => {
    it("should copy the obj", () => {
      const id = store.create({
        foo: v("bar")
      });

      const obj = store.fetch(id);
      const cobj = store.copy(obj);

      assert.deepStrictEqual(cobj.get("foo", store), v("bar"));
      assert.deepStrictEqual(cobj.get("_src", store), id);
      assert.notDeepStrictEqual(cobj.get("_id", store), obj.get("_id", store));
      assert.notDeepStrictEqual(cobj.get("_rev", store), obj.get("_rev", store));
    });

    context("specify id", () => {
      it("should copy the obj", () => {
        const id = store.create({
          foo: v("bar")
        });

        const cobj = store.copy(id);

        const obj = store.fetch(id);
        assert.deepStrictEqual(cobj.get("foo", store), v("bar"));
        assert.notDeepStrictEqual(cobj.get("_id", store), obj.get("_id", store));
        assert.notDeepStrictEqual(cobj.get("_rev", store), obj.get("_rev", store));
      });
    });
  });

  describe("#run", () => {
    it("should run act", () => {
      let a = 0;
      let b = 0;
      const act = new Act(() => {
        a = 2;
        return new Act(() => { b = 3; });
      });

      store.run(act);
      assert.deepStrictEqual(a, 2);
      assert.deepStrictEqual(b, 3);
    });

    context("return multiple act", () => {
      it("should run act", () => {
        store.run(v(1)); // pass with nothing

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
    });

    context("invalid act", () => {
      it("should throw error", () => {
        assert.throws(() => {
          store.run(v([1, new Act(() => {})]));
        }, /not all Act instances Arr:/);
      });
    });
  });
});
