import Ref from './ref';

export default class Self extends Ref {
  toString() {
    return "$:self";
  }
}

export const self = new Self();
