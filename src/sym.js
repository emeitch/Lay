import Val from './val';

export default class Sym extends Val {
  collate(val) {
    return {
      it: val,
      [this.origin]: val
    };
  }

  replace(matches) {
    for (const match of matches) {
      for (const key of Object.keys(match)) {
        if (this.equals(sym(key))) {
          return match[key];
        }
      }
    }
    return this;
  }

  step(book) {
    return book.resolve(this.origin);
  }
}

export function sym(origin) {
  if (typeof(origin) !== "string") {
    return undefined;
  }

  return new Sym(origin);
}
