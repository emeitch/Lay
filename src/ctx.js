import Val from './val';
import v from './v';

export default class Ctx extends Val {
  constructor(...ids) {
    super(ids.map(i => typeof(i) === "string" ? v(i) : i));
  }

  object(_book) {
    const base = super.object(_book);
    return Object.assign({}, base, {
      origin: this.origin.map(i => i.object(_book))
    });
  }
}

export function ctx(...args) {
  return new Ctx(...args);
}
