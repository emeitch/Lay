import jsSHA from 'jssha';

export default class Proposition {
  constructor(id, rel, val, location) {
    if (!id) {
      throw "id is required";
    }
    
    if (!rel) {
      throw "rel is required";
    }

    this.id = id;
    this.rel = rel;
    this.val = val;
    this.location = location;
  }
  
  get hash() {
    const str = JSON.stringify(this);
    const jssha = new jsSHA("SHA-256", "TEXT");
    jssha.update(str);
    const hash = jssha.getHash("HEX");
    return "urn:sha256:" + hash;
  }
}
