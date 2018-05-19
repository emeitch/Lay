import Val from './val';

export default class Pack extends Val {
}

export function pack(...args) {
  return new Pack(...args);
}
