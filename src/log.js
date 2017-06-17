import UUID from './uuid';

export default class Log {
  constructor(id, key, val, at_, in_) {
    if (!id) {
      throw "id is required";
    }

    if (!key) {
      throw "key is required";
    }

    this.logid = new UUID();
    this.id = id;
    this.key = key;
    this.val = val;
    this.at = at_;
    this.in = in_;
  }
}
