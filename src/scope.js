import Val from './val';

export default class Scope extends Val {
  constructor(...ids) {
    super(ids);
  }
}

export function scope(...args) {
  return new Scope(...args);
}
