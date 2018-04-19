import assert from 'assert';

import { parse } from '../src/store';
import UUID from '../src/uuid';
import v from '../src/v';
import { sym } from '../src/sym';

describe("parse", () => {
  it("should parse raw logs", () => {
    const raws = [
      {
        logid: {class: "UUID", origin: "logid1"},
        id: {class: "UUID", origin: "uuidexample"},
        key: "key1",
        val: {class: "Number", origin: 1},
        at: "2018-04-01T00:00:00z"
      },
      {
        logid: {class: "UUID", origin: "logid2"},
        id: {class: "UUID", origin: "uuidexample"},
        key: "key2",
        val: {class: "String", origin: "2"},
        at: "2018-04-02T00:00:00z"
      },
    ];
    const logs = parse(raws);
    assert.deepStrictEqual(logs[0].id, new UUID("uuidexample"));
    assert.deepStrictEqual(logs[0].key, sym("key1"));
    assert.deepStrictEqual(logs[0].val, v(1));
    assert.deepStrictEqual(logs[1].val, v("2"));
  });

  it("should raise error unparsed raw logs", () => {
    assert.throws(() => parse([{id: {class: "Dummy"}}]), /can not identify a val:/);
    assert.throws(() => parse([{id: 1}]), /can not identify a val:/);

  });
});
