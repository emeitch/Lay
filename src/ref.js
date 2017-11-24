import Val from './val';

export default class Ref extends Val {
  get id() {
    return this;
  }
  
  toJSON() {
    return this.toString();
  }
}
