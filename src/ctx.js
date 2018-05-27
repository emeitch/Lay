import Val from './val';
import v from './v';

export default class Ctx extends Val {
  constructor(...ids) {
    super(ids.map(i => typeof(i) === "string" ? v(i) : i));
  }
}

export function ctx(...args) {
  return new Ctx(...args);
}
