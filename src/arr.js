import Val from './val';
import v from './v';

export default class Arr extends Val {
  get typeName() {
     return "Arr";
  }

  get jsObj() {
    return this.origin.map(val => {
      return val instanceof Val ? val.jsObj : val;
    });
  }

  getJSArrayItem(key) {
    const index = key.origin;
    if (typeof(index) !== "number") {
      return undefined;
    }

    const item = this.origin[index];
    return item ? v(item) : undefined;
  }

  getOwnProp(key) {
    return this.getJSArrayItem(key) || super.getOwnProp(key);
  }

  get(k, store) {
    const key = v(k);
    return this.getOwnProp(key) || super.get(key, store);
  }

  collate(target) {
    if (this.constructor !== target.constructor || this.origin.length !== target.origin.length) {
      return super.collate(target);
    }

    const result = {};
    let i = 0;
    for (const pat of this.origin) {
      const m = pat.collate(v(target.origin[i]));
      Object.assign(result, m.result);
      i++;
    }
    return { pattern: this, target, result };
  }

  object(store) {
    const o = super.object(store);
    o.origin = this.origin.map(o => o instanceof Val ? o.object(store) : o);
    return o;
  }

  stringify(_indent=0) {
    return Val.stringify(this.origin, _indent);
  }
}
