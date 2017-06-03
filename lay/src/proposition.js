import jsSHA from 'jssha';

export default class Proposition {
  constructor(eid, rel, val, in_) {
    if (!eid) {
      throw "eid is required";
    }
    
    if (!rel) {
      throw "rel is required";
    }

    this.eid = eid;
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
