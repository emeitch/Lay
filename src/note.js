import v from './v';

const requiredPropKeys = ["rev", "id", "val"];
const optionalPropKeys = ["prev", "src"];
const propKeys = requiredPropKeys.concat(optionalPropKeys);

export default class Note {
  static get keys() {
    return propKeys;
  }

  static get requiredPropKeys() {
    return requiredPropKeys;
  }

  constructor(...args) {
    if (args.length < this.constructor.requiredPropKeys.length) {
      throw `required props (${requiredPropKeys.join(", ")}) not found. args: ${args}`;
    }

    const keys = this.constructor.keys;
    args.forEach((v, i) => {
      this[keys[i]] = v;
    });
  }

  get(key) {
    const k = v(key).keyVal();

    const matched = k.origin.match(/^_(.*)/);
    const metakey = matched && matched[1];
    if (metakey && this.constructor.keys.includes(metakey)) {
      return this[metakey];
    }

    return this.val.get(key);
  }
}

export function note(...args) {
  return new Note(...args);
}
