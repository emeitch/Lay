import Ref from './ref';

export default class Path extends Ref {
  constructor(...ids) {
    /* istanbul ignore next */
    super(ids);
  }

  toString() {
    return this.origin.join("/");
  }
}
