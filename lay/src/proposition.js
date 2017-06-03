import jsSHA from 'jssha';

export default class Proposition {
  constructor(id, rel, val, in_) {
    if (!id) {
      throw "id is required";
    }
    
    if (!rel) {
      throw "rel is required";
    }

    this.id = id;
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
