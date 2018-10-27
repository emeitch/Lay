import assert from 'assert';

import UUID from '../src/uuid';
// import { sym } from '../src/sym';
// import { path } from '../src/path';
import v from '../src/v';
import { parse } from '../src/store';

describe("parse", () => {
  it("should parse raw edges", () => {
    const raws = [
      {
        tail: {type: {origin: "UUID"}, origin: "uuidexample"},
        label: "foo",
        head: 1,
        rev: {type: {origin: "UUID"}, origin: "rev1"},
      },
      // {
      //   logid: {type: {origin: "UUID"}, origin: "logid2"},
      //   id: {type: {origin: "UUID"}, origin: "uuidexample"},
      //   key: "key1",
      //   val: "2",
      //   at: {type: {origin: "Date"}, origin: "2018-04-02T00:00:00z"}
      // },
      // {
      //   logid: {type: {origin: "UUID"}, origin: "logid3"},
      //   id: {type: {origin: "UUID"}, origin: "uuidexample"},
      //   key: "key2",
      //   val: {type: {origin: "Comp"}, head: "foo", origin: 3},
      //   at: {type: {origin: "Date"}, origin: "2018-04-02T00:00:00z"}
      // },
      // {
      //   logid: {type: {origin: "UUID"}, origin: "logid4"},
      //   id: {type: {origin: "UUID"}, origin: "uuidexample"},
      //   key: "key3",
      //   val: {type: {origin: "CompArray"}, origin: [1, 2, 3]},
      //   at: {type: {origin: "Date"}, origin: "2018-04-02T00:00:00z"}
      // },
      // {
      //   logid: {type: {origin: "UUID"}, origin: "logid4"},
      //   id: {type: {origin: "UUID"}, origin: "uuidexample"},
      //   key: "key4",
      //   val: {type: {origin: "CompArray"}, head: "foo", origin: [{type: {origin: "CompMap"}, head: "bar", origin: {a: 1, b: 2}}]},
      //   at: {type: {origin: "Date"}, origin: "2018-04-02T00:00:00z"}
      // },
      // {
      //   logid: {type: {origin: "UUID"}, origin: "logid4"},
      //   id: {type: {origin: "UUID"}, origin: "uuidexample"},
      //   key: "key5",
      //   val: {type: {origin: "CompMap"}, head: "foo", origin: {a: {type: {origin: "CompArray"}, head: "bar", origin: [1, 2, 3]}}},
      //   at: {type: {origin: "Date"}, origin: "2018-04-02T00:00:00z"}
      // },
      // {
      //   logid: {type: {origin: "UUID"}, origin: "logid4"},
      //   id: {type: {origin: "UUID"}, origin: "uuidexample"},
      //   key: "key6",
      //   val: {type: {origin: "Comp"}, head: "foo", origin: {type: {origin: "Comp"}, head: "bar", origin: 1} },
      //   at: {type: {origin: "Date"}, origin: "2018-04-02T00:00:00z"}
      // },
      // {
      //   logid: {type: {origin: "UUID"}, origin: "logid4"},
      //   id: {type: {origin: "UUID"}, origin: "uuidexample"},
      //   key: "key7",
      //   val: {type: {origin: "Comp"}, head: "foo", origin: null },
      //   at: {type: {origin: "Date"}, origin: "2018-04-02T00:00:00z"}
      // },
      // {
      //   logid: {type: {origin: "UUID"}, origin: "logid4"},
      //   id: {type: {origin: "UUID"}, origin: "uuidexample"},
      //   key: "key8",
      //   val: {type: {origin: "Path"}, origin: [{origin: "Foo"}] },
      //   at: {type: {origin: "Date"}, origin: "2018-04-02T00:00:00z"}
      // },
      // {
      //   logid: {type: {origin: "UUID"}, origin: "logid4"},
      //   id: {type: {origin: "UUID"}, origin: "uuidexample"},
      //   key: "key9",
      //   val: {origin: "Foo"},
      //   at: {type: {origin: "Date"}, origin: "2018-04-02T00:00:00z"}
      // }
    ];
    const edges = parse(raws);

    assert.deepStrictEqual(edges[0].tail, new UUID("uuidexample"));
    assert.deepStrictEqual(edges[0].label, "foo");
    assert.deepStrictEqual(edges[0].head, v(1));
    assert.deepStrictEqual(edges[0].rev, new UUID("rev1"));

    // todo: 以下のテストも修正する
    // assert.deepStrictEqual(edges[1].val, v("2"));
    // assert.deepStrictEqual(edges[2].val, v("foo", 3));
    // assert.deepStrictEqual(edges[3].val, v([1, 2, 3]));
    // assert.deepStrictEqual(edges[4].val, v("foo", [v("bar", {a: 1, b: 2})]));
    // assert.deepStrictEqual(edges[5].val, v("foo", {a: v("bar", [1, 2, 3])}));
    // assert.deepStrictEqual(edges[6].val, v("foo", v("bar", 1)));
    // assert.deepStrictEqual(edges[7].val, v("foo", null));
    // assert.deepStrictEqual(edges[8].val, path("Foo"));
    // assert.deepStrictEqual(edges[9].val, sym("Foo"));
  });

  it("should raise error unparsed raw edges", () => {
    assert.throws(() => parse([{id: {type: {origin: "Dummy"}}}]), /can not identify a val:/);
    assert.throws(() => parse([{id: 1}]), /can not identify a val:/);
  });
});
