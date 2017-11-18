import assert from 'assert';

import { v } from '../src/val';
import { sym } from '../src/sym';
import Hash from '../src/hash';

describe("Hash", () => {
  describe("#toString", () => {
    context("with args", () => {
      it("should return hash string", () => {
        const h1 = new Hash(sym("a"), v(1));
        assert.deepStrictEqual(h1.toString(), "urn:sha3-512:7546c7cdaca54bb2df1e904bff78cad804f39de51c613749b9352db0bc5994a90451b0b230049beff378d25b467b86d04f9117036598663ea1d7a8aea34db60f");

        const h2 = new Hash(sym("a"), v(1), sym("b"), v(2));
        assert.deepStrictEqual(h2.toString(), "urn:sha3-512:3c2e0caa22aba83d6754851d2babbc592c20cda1ab0245b73cf3db0d22f08c2963306a61cdbcaa2e8335893ec79d15f78b34098bfc854054d634c36f245208ef");

        // same h2 args
        const h3 = new Hash(sym("a"), v(1), sym("b"), v(2));
        assert.deepStrictEqual(h3.toString(), "urn:sha3-512:3c2e0caa22aba83d6754851d2babbc592c20cda1ab0245b73cf3db0d22f08c2963306a61cdbcaa2e8335893ec79d15f78b34098bfc854054d634c36f245208ef");
      });
    });
  });
});
