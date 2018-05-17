import Val from './val';

export default class Lid extends Val {
}

export function lid(...args) {
  return new Lid(...args);
}
