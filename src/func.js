import Case from './case';

export default class Func extends Case {}

export function func(...args) {
  return Func.func(...args);
}

export const plus = func("x", "y", (x, y) => x + y);
