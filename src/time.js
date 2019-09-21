import Val from './val';

export default class Time extends Val {
  get protoName() {
     return "Time";
  }

  object(store) {
    const o = super.object(store);
    return Object.assign(o, {
      origin: this.origin.toISOString()
    });
  }

  stringify(indent=0) {
    return " ".repeat(indent) + this.protoName + " { iso: \"" + this.origin.toISOString() + "\" }";
  }
}
