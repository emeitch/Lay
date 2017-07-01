import Ref from './ref';

class Self extends Ref {
  toString() {
    return "$:self";
  }
}

export default new Self();
