import Val from './val';

export default class Sym extends Val {
  collate(val) {
    return {
      it: val,
      [this.origin]: val
    };
  }

  replace(matches) {
    const mresults = matches.filter(m => m.result).map(m => m.result);
    for (const result of mresults) {
      for (const key of Object.keys(result)) {
        if (this.equals(sym(key))) {
          return result[key];
        }
      }
    }
    return this;
  }

  step(book) {
    const val = book.get(this.origin);
    return val !== undefined ? val : this;
  }

  stringify(_indent) {
    return this.origin;
  }
}

export function sym(origin) {
  if (typeof(origin) !== "string") {
    return undefined;
  }

  return new Sym(origin);
}
