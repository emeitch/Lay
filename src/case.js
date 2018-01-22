import Val from './val';
import Comp from './comp';
import v from './v';
import { sym } from './sym';
import { exp } from './exp';

export class Native extends Val {
  _apply(book, ...args) {
    if (args.some(arg => arg.reducible)) {
      return exp(this, ...args);
    }

    const oargs = args.map(a => a.origin);
    const orig = this.origin.apply(book, oargs);
    return v(orig);
  }

  apply(book, ...args) {
    for (let i = 0; i < args.length; i++) {
      const a = args[i];
      const na = a.step(book);

      if (!na.equals(a)) {
        const nargs = args.concat();
        nargs[i] = na;
        return exp(this, ...nargs);
      }
    }

    return this._apply(book, ...args);
  }

  replaceAsTop(matches) {
    const args = matches.map(m => m.target ? m.target : m.pattern);
    return exp(this, ...args);
  }

  stringify(indent) {
    return `<Native ${this.appendIndent(this.origin, indent)}>`;
  }
}

export class LiftedNative extends Native {
  _apply(book, ...args) {
    return this.origin.apply(book, args);
  }

  stringify(indent) {
    return `<LiftedNative ${this.appendIndent(this.origin, indent)}>`;
  }
}

class CaseAlt extends Comp {
  constructor(...args) {
    const pats = args.slice(0, -1).map(p => typeof(p) === "string" ? sym(p) : p);
    let grds = args[args.length-1];
    {
      if (grds instanceof Function) {
        if (grds.length > 0 && grds.length != pats.length) {
          throw "arity mismatched for native function";
        }
        grds = new Native(grds);
      }

      if (!Array.isArray(grds)) {
        grds = [grd(v(true), grds)];
      }
    }

    super({ pats, grds });
    this.head = sym(this.constructor.name);
  }

  get pats() {
    return this.origin.pats;
  }

  get grds() {
    return this.origin.grds;
  }

  replaceAsTop(matches) {
    const pats = matches.filter(m => !m.target).map(m => m.pattern);
    const grds = this.grds.map(grd => grd.replaceAsTop(matches));
    return new this.constructor(...pats.concat([grds]));
  }

  replace(matches) {
    // todo: Compのfiledsにバインドしている物を除外できていないのを修正する必要あり
    const submatches = matches.filter(m =>
      m.target &&
      Object.keys(m.result).every(k =>
        this.pats.every(p =>
          !sym(k).equals(p))));
    const grds = this.grds.map(grd => grd.replace(submatches));
    return new this.constructor(...this.pats.concat([grds]));
  }
}
export function alt(...args) {
  return new CaseAlt(...args);
}

class CaseGrd extends Comp {
  constructor(cond, exp) {
    if (typeof(exp) === "string") {
      exp = sym(exp);
    }

    super({cond, exp});
    this.head = sym(this.constructor.name);
  }

  get cond() {
    return this.origin.cond;
  }

  get exp() {
    return this.origin.exp;
  }

  replaceAsTop(matches) {
    return new this.constructor(
      this.cond.replaceAsTop(matches),
      this.exp.replaceAsTop(matches)
    );
  }

  replace(matches) {
    return new this.constructor(
      this.cond.replace(matches),
      this.exp.replace(matches)
    );
  }
}
export function grd(cond, exp) {
  return new CaseGrd(cond, exp);
}

export const otherwise = v(true);

export default class Case extends Comp {
  static func(...args) {
    return new this(alt(...args));
  }

  constructor(...alts) {
    super(alts);
    this.head = sym(this.constructor.name);
  }

  get alts() {
    return this.origin;
  }

  replace(matches) {
    const alts = this.alts.map(alt => alt.replace(matches));
    return new this.constructor(...alts);
  }

  apply(book, ...args) {
    for (const alt of this.alts) {
      const matches = alt.pats.map((pattern, i) => {
        const target = args[i];
        if (target) {
          const result = target.match(pattern);
          return {pattern, target, result};
        } else {
          return {pattern};
        }
      });

      if (matches.every(match => match.result !== null)) {
        const nalt = alt.replaceAsTop(matches);
        if (nalt.pats.length > 0) {
          return new this.constructor(nalt);
        }

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
