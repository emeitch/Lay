import assert from 'assert';

import UUID from '../src/uuid';
import v from '../src/v';
import { parse } from '../src/store';

describe("parse", () => {
  it("should parse raw logs", () => {
    const raws = [
      {
        logid: {class: {origin: "UUID"}, origin: "logid1"},
        id: {class: {origin: "UUID"}, origin: "uuidexample"},
        key: {class: {origin: "String"}, origin: "key0"},
        val: {class: {origin: "Number"}, origin: 1},
        at: "2018-04-01T00:00:00z"
      },
      {
        logid: {class: {origin: "UUID"}, origin: "logid2"},
        id: {class: {origin: "UUID"}, origin: "uuidexample"},
        key: {class: {origin: "String"}, origin: "key1"},
        val: {class: {origin: "String"}, origin: "2"},
        at: "2018-04-02T00:00:00z"
      },
      {
        logid: {class: {origin: "UUID"}, origin: "logid3"},
        id: {class: {origin: "UUID"}, origin: "uuidexample"},
        key: {class: {origin: "String"}, origin: "key2"},
        val: {class: {origin: "Comp"}, head: {class: {origin: "String"}, origin: "foo"}, origin: 3},
        at: "2018-04-02T00:00:00z"
      },
      {
        logid: {class: {origin: "UUID"}, origin: "logid4"},
        id: {class: {origin: "UUID"}, origin: "uuidexample"},
        key: {class: {origin: "String"}, origin: "key3"},
        val: {class: {origin: "CompArray"}, origin: [1, 2, 3]},
        at: "2018-04-02T00:00:00z"
      },
      {
        logid: {class: {origin: "UUID"}, origin: "logid4"},
        id: {class: {origin: "UUID"}, origin: "uuidexample"},
        key: {class: {origin: "String"}, origin: "key4"},
        val: {class: {origin: "CompArray"}, head: {class: {origin: "String"}, origin: "foo"}, origin: [{class: {origin: "CompMap"}, head: {class: {origin: "String"}, origin: "bar"}, origin: {a: 1, b: 2}}]},
        at: "2018-04-02T00:00:00z"
      },
      {
        logid: {class: {origin: "UUID"}, origin: "logid4"},
        id: {class: {origin: "UUID"}, origin: "uuidexample"},
        key: {class: {origin: "String"}, origin: "key5"},
        val: {class: {origin: "CompMap"}, head: {class: {origin: "String"}, origin: "foo"}, origin: {a: {class: {origin: "CompArray"}, head: {class: {origin: "String"}, origin: "bar"}, origin: [1, 2, 3]}}},
        at: "2018-04-02T00:00:00z"
      },
      {
        logid: {class: {origin: "UUID"}, origin: "logid4"},
        id: {class: {origin: "UUID"}, origin: "uuidexample"},
        key: {class: {origin: "String"}, origin: "key6"},
        val: {class: {origin: "Comp"}, head: {class: {origin: "String"}, origin: "foo"}, origin: {class: {origin: "Comp"}, head: {class: {origin: "String"}, origin: "bar"}, origin: 1} },
        at: "2018-04-02T00:00:00z"
      },
      {
        logid: {class: {origin: "UUID"}, origin: "logid4"},
        id: {class: {origin: "UUID"}, origin: "uuidexample"},
        key: {class: {origin: "String"}, origin: "key7"},
        val: {class: {origin: "Comp"}, head: {class: {origin: "String"}, origin: "foo"}, origin: null },
        at: "2018-04-02T00:00:00z"
      },
    ];
    const logs = parse(raws);
    assert.deepStrictEqual(logs[0].id, new UUID("uuidexample"));
    assert.deepStrictEqual(logs[0].key, v("key0"));
    assert.deepStrictEqual(logs[0].val, v(1));
    assert.deepStrictEqual(logs[1].val, v("2"));
    assert.deepStrictEqual(logs[2].val, v("foo", 3));
    assert.deepStrictEqual(logs[3].val, v([1, 2, 3]));
    assert.deepStrictEqual(logs[4].val, v("foo", [v("bar", {a: 1, b: 2})]));
    assert.deepStrictEqual(logs[5].val, v("foo", {a: v("bar", [1, 2, 3])}));
    assert.deepStrictEqual(logs[6].val, v("foo", v("bar", 1)));
    assert.deepStrictEqual(logs[7].val, v("foo", null));
  });

  it("should raise error unparsed raw logs", () => {
    assert.throws(() => parse([{id: {class: {origin: "Dummy"}}}]), /can not identify a val:/);
    assert.throws(() => parse([{id: 1}]), /can not identify a val:/);
  });
});
