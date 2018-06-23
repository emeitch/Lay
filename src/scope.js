import Val from './val';

export default class Scope extends Val {
  constructor(...ids) {
    super(ids);
  }

  get(index, _book) {
    return this.origin[index];
  }
}

export function scope(...args) {
  if (args.length === 1) {
    return args[0];
  }

  return new Scope(...args);
}
