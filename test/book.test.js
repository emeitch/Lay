import assert from 'assert';
import _ from 'underscore';

import v from '../src/v';
import UUID from '../src/uuid';
import LID from '../src/lid';
import Edge from '../src/edge';
import Book from '../src/book';
import Act from '../src/act';
import { path } from '../src/path';
import { sym } from '../src/sym';
import { pack } from '../src/pack';
import { func, plus } from '../src/func';
import { exp } from '../src/exp';

describe("Book", () => {
  const id = new UUID();
  const key = new UUID();
  const val = new UUID();

  let book;
  beforeEach(() => {
    book = new Book();
  });

  describe("#id", () => {
    it("should return the book uuid", () => {
      assert.deepStrictEqual(book.id.constructor, UUID);
    });

    describe("#type", () => {
      it("should return a path to 'Book'", () => {
        assert.deepStrictEqual(path(book.id, "type").reduce(book), sym("Book"));
      });
    });
  });

  describe("currentBookId", () => {
    it("should return the current book id", () => {
      assert.deepStrictEqual(path("currentBookId").reduce(book), book.id);
    });
  });

  describe("#put", () => {
    context("standard arguments with time", () => {
      const time = new Date(2017, 0);

      let rel;
      beforeEach(() => {
        rel = book.put(id, key, val, time);
      });

      it("should append edges", () => {
        assert(book.edges.some(e =>
          e.tail === rel &&
          e.label === "type" &&
          e.head === key
        ));

        assert(book.edges.some(e =>
          e.tail === rel &&
          e.label === "subject" &&
          e.head === id
        ));

        assert(book.edges.some(e =>
          e.tail === rel &&
          e.label === "object" &&
          e.head === val
        ));
      });
    });

    context("path as id", () => {
      it("should append a rel", () => {
        const pth = path(id, "foo");
        const rel = book.put(pth, key, val);

        assert(book.getEdgeHead(rel, "subject") instanceof LID);
        assert(book.getEdgeHead(rel, "type") === key);
        assert(book.getEdgeHead(rel, "object") === val);

        assert(book.activeRel(book.getEdgeHead(rel, "subject"), key));
      });

      context("intermediate object isn't lid", () => {
        it("should raise exception", () => {
          book.put(path(id), "foo", v(1));

          assert.throws(() => book.put(path(id, "foo"), "bar", v(2)), /can't put val for not ID object: /);

          assert.throws(() => book.put(path(id, "foo", "bar"), "buz", v(3)), /can't put val for not ID object: /);
        });
      });
    });
  });

  describe("getEdgeByTailAndLabel", () => {
    let rel;
    beforeEach(() => {
      rel = book.put(id, key, val);
    });

    it("should return a edge which has argument tail and label", () => {
      const e = book.getEdgeByTailAndLabel(rel, "object");
      assert.deepStrictEqual(e.tail, rel);
      assert.deepStrictEqual(e.label, "object");
      assert.deepStrictEqual(e.head, val);
    });

    context("no put tail and label", () => {
      it("should return undefined", () => {
        assert.deepStrictEqual(book.getEdgeByTailAndLabel(new UUID(), new UUID()), undefined);
      });
    });
  });

  describe("getEdgeHead", () => {
    let rel;
    beforeEach(() => {
      rel = book.put(id, key, val);
    });

    it("should return a edge head value matched the tail and the label", () => {
      assert.deepStrictEqual(book.getEdgeHead(rel, "type"), key);
    });

    context("no put tail and label", () => {
      it("should return undefined", () => {
        assert.deepStrictEqual(book.getEdgeHead(new UUID(), new UUID()), undefined);
      });
    });
  });

  describe("getEdgeByLabelAndHead", () => {
    beforeEach(() => {
      book.put(id, key, val);
    });

    it("should return edges which has argument label and head", () => {
      {
        const edges = book.getEdgesByLabelAndHead("subject", id);
        assert(edges.some(e => _.isEqual(book.getEdgeHead(e.tail, "subject"), id)));
      }

      {
        const edges = book.getEdgesByLabelAndHead("type", key);
        assert(edges.some(e => _.isEqual(book.getEdgeHead(e.tail, "type"), key)));
      }

      {
        const edges = book.getEdgesByLabelAndHead("object", val);
        assert(edges.some(e => _.isEqual(book.getEdgeHead(e.tail, "object"), val)));
      }
    });

    context("no put label and head", () => {
      it("should return empty", () => {
        assert.deepStrictEqual(book.getEdgesByLabelAndHead(new UUID(), new UUID()), []);
      });
    });
  });

  describe("getEdgeTails", () => {
    let rel;
    beforeEach(() => {
      rel = book.put(id, key, val);
    });

    it("should return tail values matched the label and the head", () => {
      assert.deepStrictEqual(book.getEdgeTails("type", key), [rel]);
    });

    context("no put label and head", () => {
      it("should return empty", () => {
        assert.deepStrictEqual(book.getEdgeTails(new UUID(), new UUID()), []);
      });
    });
  });

  describe("getEdgesBySubject", () => {
    beforeEach(() => {
      book.put(id, key, val);
      book.put(id, key, v(2));
    });

    it("should return a edges which has subject head", () => {
      const edges = book.getEdgesBySubject(id);
      assert(edges.some(e => _.isEqual(book.getEdgeHead(e.tail, "object"), val)));
      assert(edges.some(e => _.isEqual(book.getEdgeHead(e.tail, "object"), v(2))));
    });

    context("no put id", () => {
      it("should return empty", () => {
        assert.deepStrictEqual(book.getEdgesBySubject(new UUID()), []);
      });
    });
  });

  describe("getEdgesByObject", () => {
    const id2 = new UUID();
    beforeEach(() => {
      book.put(id, key, val);
      book.put(id2, key, val);
    });

    it("should return a edges which has object head", () => {
      const edges = book.getEdgesByObject(val);
      assert(edges.some(e => _.isEqual(book.getEdgeHead(e.tail, "subject"), id)));
      assert(edges.some(e => _.isEqual(book.getEdgeHead(e.tail, "subject"), id2)));
    });

    context("no put val", () => {
      it("should return empty", () => {
        assert.deepStrictEqual(book.getEdgesByObject(new UUID()), []);
      });
    });
  });


  describe("putAct", () => {
    it("should return a calling put act", () => {
      const id = new UUID();
      const key = new UUID();
      const val = new UUID();

      const pae = book.putAct(id, key, val);
      let pa = pae.reduce(book);

      assert(!book.activeRel(id, key));
      while(!pa.settled) {
        pa = pa.proceed();
      }
      assert(book.activeRel(id, key));
    });
  });

  describe("#lid", () => {
    it("should return book LID", () => {
      assert(book.root instanceof LID);
    });
  });

  describe("#exist", () => {
    it("should create lid reached from book by key", () => {
      const key = new UUID();
      const rel = book.exist(key);

      assert(book.getEdgeHead(rel, "subject") === book.root);
      assert(book.getEdgeHead(rel, "type") === key);
      assert(book.getEdgeHead(rel, "object") instanceof LID);

      const arel = book.activeRel(book.root, key);

      assert.deepStrictEqual(arel, rel);
    });

    context("multiple key", () => {
      it("should create lid reached from book by key path", () => {
        const key1 = new UUID();
        const key2 = new UUID();
        const rel = book.exist(key1, key2);

        assert(book.getEdgeHead(rel, "type") === key2);
        assert(book.getEdgeHead(rel, "object") instanceof LID);

        const r1 = book.activeRel(book.root, key1);
        const r2 = book.activeRel(book.getEdgeHead(r1, "object"), key2);

        assert.deepStrictEqual(r2, rel);
      });
    });
  });

  describe("#key", () => {
    it("should return obj's key", () => {
      const key = new UUID();
      const rel = book.exist(key);

      assert.deepStrictEqual(book.key(book.getEdgeHead(rel, "object")), key);
    });
  });

  describe("#parent", () => {
    it("should return parent obj", () => {
      const key = new UUID();
      const rel = book.exist(key);

      assert.deepStrictEqual(book.parent(book.getEdgeHead(rel, "object")), book.root);
    });
  });

  describe("#path", () => {
    it("should return obj's path", () => {
      const key1 = new UUID();
      const key2 = new UUID();
      const rel = book.exist(key1, key2);
      const obj = book.getEdgeHead(rel, "object");
      assert.deepStrictEqual(book.path(obj), path(v("/"), key1, key2));
    });
  });

  describe("#fetch", () => {
    it("should return path's obj", () => {
      const key1 = new UUID();
      const key2 = new UUID();
      const rel = book.exist(key1, key2);
      const obj = book.getEdgeHead(rel, "object");
      assert.deepStrictEqual(book.fetch([key1, key2]), obj);
    });

    context("not exist key2", () => {
      it("should return undefined", () => {
        const key1 = new UUID();
        const key2 = new UUID();
        book.exist(key1);
        assert.deepStrictEqual(book.fetch([key1, key2]), undefined);
      });
    });
  });

  describe("#derefer", () => {
    it("should return objs that dereferd by path and key", () => {
      const key1 = new UUID();
      book.exist(key1);

      book.put(book.root, v("foo"), path(key1));

      const key2 = new UUID();
      const rel = book.exist(key2);
      book.put(book.getEdgeHead(rel, "object"), v("foo"), path(key1));

      assert.deepStrictEqual(book.derefer(path(key1), v("foo")), v([book.root, book.getEdgeHead(rel, "object")]));
    });
  });

  describe("#query", () => {
    it("should retrieve absolute keys and reduce path", () => {
      const key1 = new UUID();
      const rel1 = book.exist(key1);
      book.put(book.getEdgeHead(rel1, "object"), v("foo"), v(2));

      const key2 = new UUID();
      const rel2 = book.exist(key2);
      book.put(book.getEdgeHead(rel2, "object"), v("bar"), path(key1, v("foo")));

      assert.deepStrictEqual(book.query([key2, v("bar")]), v(2));
    });

    context("relative path", () => {
      it("should retrieve relative keys", () => {
        const key1 = new UUID();
        const rel1 = book.exist(key1);
        const obj1 = book.getEdgeHead(rel1, "object");
        book.put(obj1, v("foo"), v(2));
        book.put(obj1, v("bar"), v(3));

        const key2 = new UUID();
        const rel2 = book.exist(key2);
        const obj2 = book.getEdgeHead(rel2, "object");
        book.put(obj2, v("baz"), path(key1, v("foo")));
        book.put(obj2, v("fiz"), path(key1, v("bar")));

        const rel3 = book.exist(key2, key1);
        const obj3 = book.getEdgeHead(rel3, "object");
        book.put(obj3, v("bar"), v(4));

        assert.deepStrictEqual(book.query([key2, v("baz")]), v(2));
        assert.deepStrictEqual(book.query([key2, v("fiz")]), v(4)); // override
      });
    });

    context("specifying absolute path", () => {
      it("should retrieve absolute keys", () => {
        const key1 = new UUID();
        const rel1 = book.exist(key1);
        const obj1 = book.getEdgeHead(rel1, "object");
        book.put(obj1, v("foo"), v(2));
        book.put(obj1, v("bar"), v(3));

        const key2 = new UUID();
        const rel2 = book.exist(key2);
        const obj2 = book.getEdgeHead(rel2, "object");
        book.put(obj2, v("baz"), path(v("/"), key1, v("foo")));
        book.put(obj2, v("fiz"), path(v("/"), key1, v("bar")));

        const rel3 = book.exist(key2, key1);
        const obj3 = book.getEdgeHead(rel3, "object");
        book.put(obj3, v("bar"), v(4));

        assert.deepStrictEqual(book.query([key2, v("baz")]), v(2));
        assert.deepStrictEqual(book.query([key2, v("fiz")]), v(3));
      });
    });

    context("func val", () => {
      it("should apply by args", () => {
        const key1 = new UUID();
        const rel1 = book.exist(key1);
        const obj1 = book.getEdgeHead(rel1, "object");
        book.put(obj1, v("foo"), func("x", exp(plus, "x", v(1))));

        assert.deepStrictEqual(book.query([key1, [v("foo"), v(2)]]), v(3));
      });
    });
  });

  describe("#transactionID", () => {
    let tid;
    beforeEach(() => {
      const rel = book.put(id, key, val);
      tid = book.transactionID(rel);
    });

    it("should return trasncation id", () => {
      assert(tid instanceof UUID);
    });

    context("tid as arg", () => {
      it("should return tid", () => {
        assert.deepStrictEqual(book.transactionID(tid), tid);
      });
    });
  });

  describe("#get", () => {
    context("name un assigned", () => {
      it("should return null", () => {
        assert.deepStrictEqual(book.get("unassigned"), undefined);
      });
    });

    context("name assigned", () => {
      beforeEach(() => {
        book.set(v("i"), id);
        book.set("k", key);
        book.set("v", val);
      });

      it("should return a id by name", () => {
        assert(book.get("i") === id);
        assert(book.get("k") === key);
        assert(book.get("v") === val);
      });

      context("name re-assigned", () => {
        const key2 = new UUID();

        beforeEach(() => {
          book.set("r", key2);
        });

        it("should return a re-assigned id by name", () => {
          assert(book.get("r") === key2);
        });
      });

      context("parent-child", () => {
        it("should return a parent assigned value", () => {
          const cbook = new Book(book);
          assert(cbook.get("i") === id);
        });
      });
    });
  });

  describe("Val#get", () => {
    context("prototype assigned", () => {
      beforeEach(() => {
        book.set("Number", id);
        book.put(id, "foo", v("bar"));
      });

      it("should return type's prop", () => {
        assert.deepStrictEqual(v(1).get("foo", book), v("bar"));
      });

      it("should return id's prop", () => {
        assert.deepStrictEqual(id.get("foo", book), v("bar"));
        assert.deepStrictEqual(id.get("type", book), sym("UUID"));
        assert.deepStrictEqual(id.get("type"), sym("UUID"));
      });
    });
  });

  describe("#name", () => {
    it("should return assigned name", () => {
      book.set("Foo", id);
      assert.deepStrictEqual(book.name(id), v("Foo"));
      assert.deepStrictEqual(book.name(new UUID()), v(null));
    });
  });

  describe("#putEdge", () => {
    it("should append a edge", () => {
      const edge = book.putEdge(new UUID(), "subject", new UUID());

      assert(book.edges.some(e => e === edge));
    });
  });

  describe("#transactionIdFromEdge", () => {
    it("should return transaction id by edge argument", () => {
      const tail = new UUID();
      const label = "subject";
      const head = new UUID();
      const edge = book.putEdge(tail, label, head);

      assert.deepStrictEqual(book.transactionIdFromEdge(new Edge(tail, label, head)), edge.rev);
    });
  });

  describe("#activeRels and #rels", () => {
    context("no edges", () => {
      it("should return empty", () => {
        const rels = book.rels(id, key);
        assert(rels.length === 0);
      });
    });

    context("put with same ids & keys but different vals", () => {
      let rel0;
      let rel1;
      beforeEach(() => {
        rel0 = book.put(id, key, v("val0"));
        rel1 = book.put(id, key, v("val1"));
      });

      it("should return all rel id", () => {
        const rels = book.activeRels(id, key);
        assert(rels[0].equals(rel0));
        assert(rels[1].equals(rel1));
      });

      context("set valid end time to the last edge", () => {
        beforeEach(() => {
          const rels = book.activeRels(id, key);
          book.putEdge(rels[1], "to", v(new Date()));
        });

        describe("#rels", () => {
          it("should return all edges", () => {
            const rels = book.rels(id, key);
            assert(rels[0].equals(rel0));
            assert(rels[1].equals(rel1));
          });
        });

        it("should return only the first edge", () => {
          const rels = book.activeRels(id, key);
          assert(rels[0].equals(rel0));
          assert(!rels[1]);
        });
      });

      context("set valid start time to the last edge", () => {
        beforeEach(() => {
          const rels = book.activeRels(id, key);
          book.putEdge(rels[1], "from", v(new Date("2018-08-01T00:00:00")));
        });

        context("after from", () => {
          it("should return all edges", () => {
            const rels = book.activeRels(id, key);
            assert(rels[0].equals(rel0));
            assert(rels[1].equals(rel1));
          });
        });

        context("specify before from", () => {
          it("should return only the first edge", () => {
            const at = new Date("2018-01-01T00:00:00");
            const rels = book.activeRels(id, key, at);
            assert(rels[0].equals(rel0));
            assert(!rels[1]);
          });
        });
      });
    });
  });

  describe("#activeRelsByTypeAndObject and #relsByTypeAndObject", () => {
    context("no rels", () => {
      it("should return empty", () => {
        const rels = book.relsByTypeAndObject(key, val);
        assert(rels.length === 0);
      });
    });

    context("put with same ids & keys but different vals", () => {
      const id1 = new UUID();
      let rel0;
      let rel1;
      beforeEach(() => {
        rel0 = book.put(id, key, val);
        rel1 = book.put(id1, key, val);
      });

      it("should return all rel id", () => {
        const rels = book.activeRelsByTypeAndObject(key, val);
        assert(rels[0].equals(rel0));
        assert(rels[1].equals(rel1));
      });

      context("set valid end time to the last edge", () => {
        beforeEach(() => {
          book.putEdge(rel1, "to", v(new Date()));
        });

        describe("#relsByTypeAndObject", () => {
          it("should return all edges", () => {
            const rels = book.relsByTypeAndObject(key, val);
            assert(rels[0].equals(rel0));
            assert(rels[1].equals(rel1));
          });
        });

        it("should return only the first edge", () => {
          const rels = book.activeRelsByTypeAndObject(key, val);
          assert(rels[0].equals(rel0));
          assert(!rels[1]);
        });
      });
    });
  });

  describe("#instanceIDs", () => {
    let t1;

    let id0;
    let id1;
    let id2;
    beforeEach(() => {
      t1 = book.new();
      book.set("T1", t1);

      id0 = book.new({"type": pack(path("T1"))});
      id1 = book.new({"type": pack(path("T1"))});
      id2 = book.new({"type": pack(path("T1"))});
    });

    it("should return type object id list", () => {
      assert.deepStrictEqual(book.instanceIDs(t1), [id0, id1, id2]);

      const t2 = book.new();
      assert.deepStrictEqual(book.instanceIDs(t2), []);
    });

    context("set exists false", () => {
      beforeEach(() => {
        book.put(id1, "exists", v(false));
      });

      it("should return new generated ids", () => {
        const ids = book.instanceIDs(t1);
        assert(ids.length === 2);
        assert(ids[0] === id0);
        assert(ids[1] === id2);
      });
    });
  });

  describe("#new", () => {
    it("should return new id", () => {
      const id = book.new();
      assert(id.constructor === UUID);

      const rels = book.activeRels(id, v("exists"));
      assert(rels.length > 0);
    });

    context("with properties", () => {
      it("should return the set properties", () => {
        const id = book.new({
          foo: 1,
          bar: v("bar"),
          baz: "baz"
        });

        assert.deepStrictEqual(id.get(v("foo"), book), v(1));
        assert.deepStrictEqual(id.get(v("bar"), book), v("bar"));
        assert.deepStrictEqual(id.get(v("baz"), book), v("baz"));

        assert(book.activeRels(id, v("foo")).length === 1);
      });
    });
  });

  describe("#import", () => {
    it("should add search target books", () => {
      const alib1 = new Book();
      const id0 = new UUID();
      alib1.put(id0, "bar", v(1));

      const alib2 = new Book();
      const id1 = new UUID();
      alib2.put(id1, "baz", v(2));

      const lib = new Book(alib1, alib2);
      const id2 = new UUID();
      const rel = lib.put(id2, "foo", v(3));
      lib.set("bar", v(4));
      book.import(lib);

      assert(book.activeRels(id0, v("bar")).length === 1);
      assert(book.activeRels(id1, v("baz")).length === 1);

      assert(book.activeRels(id2, v("foo")).length === 1);
      assert(book.activeRelsByTypeAndObject(v("foo"), v(3)).length === 1);

      assert.deepStrictEqual(book.getEdgeByTailAndLabel(rel, "object").head, v(3));
      assert(book.getEdgesByLabelAndHead("object", v(3)).some(e => e.tail.equals(rel)));

      assert.deepStrictEqual(book.get("bar"), v(4));
      assert(book.logIDs().some(lid => lid.equals(rel)));

      assert(book.activeRels(id2, v("nothing")).length === 0);
      assert(book.activeRelsByTypeAndObject(v("nothing"), v(3)).length === 0);
    });

    context("with name", () => {
      it("should assign a imported book to name", () => {
        const lib = new Book();
        book.import(lib, "foo");

        assert.deepStrictEqual(path("foo").reduce(book), lib.id);
      });
    });

    context("set up onImport", () => {
      it("should run the returned act", () => {
        let b = 0;
        const alib = new Book();
        alib.set("onImport", new Act(() => { b = 1; }));
        const lib = new Book(alib);
        assert.deepStrictEqual(b, 1);

        let a = 0;
        lib.set("onImport", new Act(() => { a = 1; }));
        book.import(lib);

        assert.deepStrictEqual(a, 1);
      });
    });

    context("set up onPut", () => {
      it("should run the returned act", () => {
        let b = 0;
        const alib = new Book();
        alib.set("onPut", new Act(edge => {
          if (edge.label === "type" && edge.head.equals(v("foo"))) {
            b += 1;
          }
        }));

        let a = 0;
        const lib = new Book(alib);
        lib.set("onPut", new Act(edge => {
          if (edge.label === "type" && edge.head.equals(v("foo"))) {
            a += 1;
          }
        }));
        book.import(lib);

        book.put(new UUID(), "foo", v(1));
        assert.deepStrictEqual(a, 1);
        assert.deepStrictEqual(b, 1);

        book.put(new UUID(), "foo", v(1));
        assert.deepStrictEqual(a, 2);
        assert.deepStrictEqual(b, 2);
      });
    });
  });

  describe("run", () => {
    it("should execute arg Act", () => {
      const book = new Book();
      book.run(v(1)); // pass

      let a = 0;
      book.run(new Act(() => { a = 1; }));
      assert.deepStrictEqual(a, 1);

      let b = 0;
      book.run(v([new Act(() => { a = 2; }), new Act(() => { b = 2; })]));
      assert.deepStrictEqual(a, 2);
      assert.deepStrictEqual(b, 2);
    });

    context("with error act", () => {
      it("should recovery error", () => {
        const book = new Book();

        let err;
        const act = new Act(() => {
          throw "error";
        }).catch(new Act(e => {
          err = e;
        }));

        book.run(act);
        assert.deepStrictEqual(err, "error");
      });
    });

    context("with not act val", () => {
      it("should return null", () => {
        const book = new Book();
        assert.throws(() => book.run(v([1])), /not Act instance:/);
      });
    });
  });
});

describe("Book", () => {
  let book;
  beforeEach(() => {
    book = new Book();
  });

  describe("putLog", () => {
    it("should put for first imported book", () => {
      const id = new UUID();

      const importer = new Book();
      importer.put(id, "k1", v("v1"));
      assert(book.activeRels(id, v("k1")).length == 0);
      assert(importer.activeRels(id, v("k1")).length == 1);

      importer.import(book);

      importer.put(id, "k2", v("v2"));
      assert(book.activeRels(id, v("k2")).length == 0);
      assert(importer.activeRels(id, v("k2")).length == 1);
    });
  });
});
