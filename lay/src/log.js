import UUID from './uuid';

export default class Log {
  constructor(id, key, val, in_) {
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
    this.in = in_;
  }
}
