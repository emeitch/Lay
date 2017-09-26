import Func from './func';
import Book from './book';
import Val from './val';

class CaseAlt {
  constructor(...args) {
    this.pats = args.slice(0, -1);
    this.grds = args[args.length-1];
  }
}
export function alt(...args) {
  return new CaseAlt(...args);
}

class CaseGrd {
  constructor(cond, exp) {
    this.cond = cond;
    this.exp = exp;
  }
}
export function grd(cond, exp) {
  return new CaseGrd(cond, exp);
}

class CaseGrdOtherwise extends Val {
  reduce(_) {
    return new Val(true);
  }
}
export const otherwise = new CaseGrdOtherwise();

export default class Case extends Func {
  constructor(...alts) {
    super();
    this.alts = alts;
  }

  apply(book, ...args) {
    for (const alt of this.alts) {
      const matches = args.map((v, i) => v.match(alt.pats[i]));
      if (matches.every(v => v !== undefined)) {
        const e = new Book(book);
        for (const match of matches) {
          for (const key of Object.keys(match)) {
            e.assign(key, match[key]);
          }
        }
        if (Array.isArray(alt.grds)) {
          for (const grd of alt.grds) {
            if (grd.cond.reduce(e).origin) {
              return grd.exp.reduce(e);
            }
          }
        } else {
          const exp = alt.grds;
          return exp.reduce(e);
        }
      }
    }

    throw "matched pattern not found";
  }
}
