import Ref from './ref';

export default class Self extends Ref {
  toString() {
    return "$:self";
  }

  reduce(env) {
    return env.id ? env.id : this;
  }
}

export const self = new Self();
