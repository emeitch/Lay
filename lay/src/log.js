import jsSHA from 'jssha';

export default class Log {
  constructor(id, key, val, in_) {
    if (!id) {
      throw "id is required";
    }
    
    if (!key) {
      throw "key is required";
    }

    this.id = id;
    this.key = key;
    this.val = val;
    this.in = in_;
  }
  
  get hash() {
    const str = JSON.stringify(this);
    const jssha = new jsSHA("SHA-256", "TEXT");
    jssha.update(str);
    const hash = jssha.getHash("HEX");
    return "urn:sha256:" + hash;
  }
}
