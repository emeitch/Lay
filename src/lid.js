import ID from './id';
import UUID from './uuid';

export default class LID extends ID {
  /* istanbul ignore next */
  constructor(origin = UUID.generateString()) {
    super(origin);
  }

  prefix() {
    return "_:";
  }
}
