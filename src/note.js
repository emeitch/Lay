import Val from './val';
import UUID from './uuid';

export default class Note {
  constructor(id, key, val, at_, in_) {
    if (!id) {
      throw "id is required";
    }

    if (!key) {
      throw "key is required";
    }

    if (val && !(val instanceof Val)) {
      throw "val is not a Val";
    }

    this.noteid = new UUID();
    this.id = id;
    this.key = key;
    this.val = val;
    this.at = at_;
    this.in = in_;
  }
}

export const n = (...args) => {
  return new Note(...args);
};
