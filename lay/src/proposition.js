import jsSHA from 'jssha';

export default class Proposition {
  constructor(subject, relation, object, transaction, holder) {
    this.subject = subject;
    this.relation = relation;
    this.object = object;
    
    this.transaction = transaction;
    
    this.holder = holder;
  }
  
  get id() {
    const str = JSON.stringify(this);
    const jssha = new jsSHA("SHA-256", "TEXT");
    jssha.update(str);
    const hash = jssha.getHash("HEX");
    return "urn:sha256:" + hash;
  }
}