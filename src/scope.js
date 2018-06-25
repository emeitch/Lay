import ID from './id';

export default class Scope extends ID {
  constructor(...ids) {
    super(ids);
  }

  get(index, book) {
    if (typeof(index) === "number") {
      return this.origin[index];
    }

    return super.get(index, book);
  }

  stringify(_indent) {
    return this.origin.map(o => o.stringify(_indent)).join("::");
  }
}

export function scope(...args) {
  return new Scope(...args);
}
