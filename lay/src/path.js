import State from './state'

export default class Path extends State {
  static generateUUID() {
    // UUID ver 4 / RFC 4122
    var uuid = "", i, random;
    for (i = 0; i < 32; i++) {
      random = Math.random() * 16 | 0;
      
      if (i == 8 || i == 12 || i == 16 || i == 20) {
        uuid += "-"
      }
      uuid += (i == 12 ? 4 : (i == 16 ? (random & 3 | 8) : random)).toString(16);
    }
    return uuid;
  }

  static uuid() {
    return "urn:uuid:" + this.generateUUID();
  }
  
  static isUUID(key) {
    return key.match(/^urn:uuid:/);
  }
  
  static isName(key) {
    return !this.isUUID(key);
  }
  
  static isConst(key) {
    return !!key.match(/^[A-Z]/);
  }

  constructor(...keys) {
    super();
    this.keys = keys;
  }
  
  get top() {
    return this.keys[0];
  }
  
  get last() {
    return this.keys[this.keys.length-1];
  }
  
  get rest() {
    return this.keys.slice(1);
  }
  
  parent() {
    if (this.keys.length === 1) {
      return undefined;
    }
    
    const keys = this.keys.concat();
    keys.pop();
    return new this.constructor(...keys);
  }
  
  child(key) {
    const keys = this.keys.concat([key]);
    return new this.constructor(...keys);
  }
}