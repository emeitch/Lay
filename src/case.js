import Func from './func';
import Book from './book';
import Val from './val';

class CaseAlt {
  constructor(pat, ...grds) {
    this.pat = pat;
    this.grds = grds;
  }
}
export function alt(pat, ...grds) {
  return new CaseAlt(pat, ...grds);
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
  constructor(exp, ...alts) {
    super();
    this.exp = exp;
    this.alts = alts;
  }

  reduce(book=new Book()) {
    const val = this.exp.reduce(book);
    for (const alt of this.alts) {
      const bindings = val.match(alt.pat);
      if (bindings) {
        const e = new Book(book);
        for (const k of Object.keys(bindings)) {
          e.assign(k, bindings[k]);
        }
        for (const grd of alt.grds) {
          if (grd instanceof CaseGrd) {
            if (grd.cond.reduce(e).origin) {
              return grd.exp.reduce(e);
            }
          } else {
            const exp = grd;
            return exp.reduce(e);
          }
        }
      }
    }

    throw "matched pattern not found";
  }
}
