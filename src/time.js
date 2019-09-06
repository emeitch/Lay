import Val from './val';

export default class Time extends Val {
  get typeName() {
     return "Time";
  }

  object(store) {
    const o = super.object(store);
    return Object.assign(o, {
      origin: this.origin.toISOString()
    });
  }

  stringify(indent=0) {
    return " ".repeat(indent) + this.typeName + " { iso: \"" + this.origin.toISOString() + "\" }";
  }
}
