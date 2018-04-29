import assert from 'assert';

import UUID from '../src/uuid';
import v from '../src/v';
import { sym } from '../src/sym';
import { parse } from '../src/store';

describe("parse", () => {
  it("should parse raw logs", () => {
    const raws = [
      {
        logid: {class: "UUID", origin: "logid1"},
        id: {class: "UUID", origin: "uuidexample"},
        key: "key0",
        val: {class: "Number", origin: 1},
        at: "2018-04-01T00:00:00z"
      },
      {
        logid: {class: "UUID", origin: "logid2"},
        id: {class: "UUID", origin: "uuidexample"},
        key: "key1",
        val: {class: "String", origin: "2"},
        at: "2018-04-02T00:00:00z"
      },
      {
        logid: {class: "UUID", origin: "logid3"},
        id: {class: "UUID", origin: "uuidexample"},
        key: "key2",
        val: {class: "Comp", head: {class: "String", origin: "foo"}, origin: 3},
        at: "2018-04-02T00:00:00z"
      },
      {
        logid: {class: "UUID", origin: "logid4"},
        id: {class: "UUID", origin: "uuidexample"},
        key: "key3",
        val: {class: "CompArray", origin: [1, 2, 3]},
        at: "2018-04-02T00:00:00z"
      },
      {
        logid: {class: "UUID", origin: "logid4"},
        id: {class: "UUID", origin: "uuidexample"},
        key: "key4",
        val: {class: "CompArray", head: {class: "String", origin: "foo"}, origin: [{class: "CompMap", head: {class: "String", origin: "bar"}, origin: {a: 1, b: 2}}]},
        at: "2018-04-02T00:00:00z"
      },
      {
        logid: {class: "UUID", origin: "logid4"},
        id: {class: "UUID", origin: "uuidexample"},
        key: "key5",
        val: {class: "CompMap", head: {class: "String", origin: "foo"}, origin: {a: {class: "CompArray", head: {class: "String", origin: "bar"}, origin: [1, 2, 3]}}},
        at: "2018-04-02T00:00:00z"
      },
      {
        logid: {class: "UUID", origin: "logid4"},
        id: {class: "UUID", origin: "uuidexample"},
        key: "key6",
        val: {class: "Comp", head: {class: "String", origin: "foo"}, origin: {class: "Comp", head: {class: "String", origin: "bar"}, origin: 1} },
        at: "2018-04-02T00:00:00z"
      },
      {
        logid: {class: "UUID", origin: "logid4"},
        id: {class: "UUID", origin: "uuidexample"},
        key: "key7",
        val: {class: "Comp", head: {class: "String", origin: "foo"}, origin: null },
        at: "2018-04-02T00:00:00z"
      },
    ];
    const logs = parse(raws);
    assert.deepStrictEqual(logs[0].id, new UUID("uuidexample"));
    assert.deepStrictEqual(logs[0].key, sym("key0"));
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
    assert.throws(() => parse([{id: {class: "Dummy"}}]), /can not identify a val:/);
    assert.throws(() => parse([{id: 1}]), /can not identify a val:/);
  });
});
