import jsSHA from 'jssha';

export default class Log {
  constructor(oid, rel, val, in_) {
    if (!oid) {
      throw "oid is required";
    }
    
    if (!rel) {
      throw "rel is required";
    }

    this.oid = oid;
    this.rel = rel;
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
