import Val from './val';

export default class Ctx extends Val {
}

export function ctx(...args) {
  return new Ctx(...args);
}
