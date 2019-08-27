import Val from './val';
import Prim from './prim';
import {CompArray, CompMap, CompDate} from './comp';

export default function v(...args) {
  const origin = args.pop();
  const typesrc = args.pop() || null;
  const type = !typesrc || typesrc instanceof Val ? typesrc : new Prim(typesrc);
  const jstype = typeof(origin);

  if (!type && origin instanceof Val) {
    return origin;
  }

  if (type === null &&
      (jstype === "number" ||
       jstype === "string" ||
       jstype === "boolean" ||
       origin === null)) {
    return new Prim(origin);
  }

  if (type || origin) {
    let orgn;
    if (Array.isArray(origin)) {
      orgn = origin.map(val => val instanceof Prim ? val.origin : val);
      return new CompArray(orgn, type);
    } else if (jstype === "object" && origin && origin.constructor === Object) {
      orgn = {};
      for (const key of Object.keys(origin)) {
        const val = origin[key];
        orgn[key] = val instanceof Prim ? val.origin : val;
      }
      return new CompMap(orgn, type);
    } else if (jstype === "object" && origin && origin.constructor === Date) {
      return new CompDate(origin, type);
    }
    throw `not supported origin: ${origin && origin.stringify ? origin.stringify() : origin}, type: ${type.stringify()}`;
  }

  throw `not supported origin: ${origin}`;
}
