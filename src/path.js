import Ref from './ref';
import ID from './id';

export default class Path extends Ref {
   /* istanbul ignore next */
  constructor(...ids) {
    for (const id of ids) {
      if (!(id instanceof ID)) {
        throw `${id} is not a ID`;
      }
    }
    /* istanbul ignore next */
    super(ids);
  }

  toString() {
    return this.origin.join("/");
  }
}
