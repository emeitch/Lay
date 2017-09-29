import Case, { alt } from './case';
import { sym } from './sym';
import Exp from './exp';

export default class Func extends Case {
  static create(...args) {
    return new this(alt(...args));
  }
}
export function func(...args) {
  return Func.create(...args);
}

export const plus = func(
  sym("x"),
  sym("y"),
  new Exp(
    (x, y) => x + y,
    sym("x"),
    sym("y")
  )
);
