import Ref from './ref';

export default class Self extends Ref {
  toString() {
    return "$:self";
  }

  reduce(ctx) {
    return ctx.id ? ctx.id : this;
  }
}

export const self = new Self();
