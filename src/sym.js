import { Sym } from './val';

export default Sym;

export function sym(origin) {
  if (origin instanceof Sym) {
    return origin;
  }

  if (typeof(origin) !== "string") {
    return null;
  }

  return new Sym(origin);
}
