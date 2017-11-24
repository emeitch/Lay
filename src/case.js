import Val from './val';
import v from './v';
import Sym, { sym } from './sym';
import { exp } from './exp';

export class Native extends Val {
  apply(book, ...args) {
    const rest = this.origin.length - args.length;
    if (rest > 0) {
      let pats = [];
      for (let i = 0; i < rest; i++) {
        // todo: もっと適切なシンボルにしたい
        const vname = "__" + "arg_" + i + "__";
        pats.push(vname);
      }
      const e = exp(this, ...args.concat(pats));
      return Func.func(...pats.concat([e]));
    }

    const syms = args.filter(arg => arg instanceof Sym);
    if (syms.length > 0) {
      const e = exp(this, ...args);
      return Func.func(...syms.concat([e]));
    }

    for (let i = 0; i < args.length; i++) {
      const a = args[i];
      const na = a.step(book);

      if (!na.equals(a)) {
        const nargs = args.concat();
        nargs[i] = na;
        return exp(this, ...nargs);
      }
    }

    if (args.some(arg => arg.reducible)) {
      return exp(this, ...args);
    }

    const oargs = args.map(a => a.origin);
    const orig = this.origin.apply(undefined, oargs);
    return v(orig);
  }

  replaceAsTop(matches) {
    const args = matches.reduce((prv, match) =>
      prv.concat(Object.keys(match).filter(k =>
        k === "it").map(k => match[k])), []);
    return exp(this, ...args);
  }
}

class CaseAlt {
  constructor(...args) {
    const pats = args.slice(0, -1);
    this.pats = pats.map(p => typeof(p) === "string" ? sym(p) : p);
    this.grds = this.parseGuards(args[args.length-1]);
  }

  parseGuards(grds) {
    if (grds instanceof Function) {
      if (grds.length > 0 && grds.length != this.pats.length) {
        throw "arity mismatched for native function";
      }
      grds = new Native(grds);
    }

    if (!Array.isArray(grds)) {
      grds = [grd(v(true), grds)];
    }

    return grds;
  }

  replaceAsTop(matches) {
    const pats = matches.reduce((prv, m) =>
      prv.concat(
        this.pats.filter(p =>
          Object.keys(m).some(k =>
            k !== "it" && !sym(k).equals(p)
        )
      )), []);
    const grds = this.grds.map(grd => grd.replaceAsTop(matches));
    return new this.constructor(...pats.concat([grds]));
  }

  replace(matches) {
    if (matches.some(m =>
          this.pats.some(p =>
            Object.keys(m).some(k =>
              sym(k).equals(p))))) {
                return this;
              }
    const grds = this.grds.map(grd => grd.replace(matches));
    return new this.constructor(...this.pats.concat([grds]));
  }
}
export function alt(...args) {
  return new CaseAlt(...args);
}

class CaseGrd {
  constructor(cond, exp) {
    this.cond = cond;
    if (typeof(exp) === "string") {
      this.exp = sym(exp);
    } else {
      this.exp = exp;
    }
  }

  replaceAsTop(matches) {
    const exp = this.exp.replaceAsTop(matches);
    return new this.constructor(
      this.cond.replaceAsTop(matches),
      exp
    );
  }

  replace(matches) {
    const exp = this.exp.replace(matches);
    return new this.constructor(
      this.cond.replace(matches),
      exp
    );
  }
}
export function grd(cond, exp) {
  return new CaseGrd(cond, exp);
}

export const otherwise = v(true);

export default class Case extends Val {
  static func(...args) {
    return new this(alt(...args));
  }

  constructor(...alts) {
    super();
    this.alts = alts;
  }

  replace(matches) {
    const alts = this.alts.map(alt => alt.replace(matches));
    return new this.constructor(...alts);
  }

  apply(book, ...args) {
    for (const alt of this.alts) {
      const matches = args.map((arg, i) => arg.match(alt.pats[i]));
      if (matches.every(match => match !== undefined)) {
        const nalt = alt.replaceAsTop(matches);
        for (const grd of nalt.grds) {
          if (grd.cond.reduce(book).origin) {
            return grd.exp;
          }
        }
      }
    }

    throw "matched pattern not found";
  }
}

export function kase(...args) {
  return new Case(...args);
}

export class Func extends Case {
  get exp() {
    return this.alts[0].grds[0].exp;
  }
}
