import { sym } from './sym';
import { path } from './path';
import v from './v';

export function parseVal(raw) {
  const jstype = typeof(raw);
  if (
    raw === null ||
    jstype === "number" ||
    jstype === "string" ||
    jstype === "boolean"
  ) {
    return raw;
  }

  if (Array.isArray(raw)) {
    return raw.map(i => parseVal(i));
  }

  if (jstype === "object") {
    const proto = raw._proto;
    if (proto === "Arr") {
      return v(raw.origin.map(i => parseVal(i)));
    } else if (proto === "Time") {
      return v(new Date(raw.origin));
    } else if (proto === "Sym") {
      return sym(raw.origin);
    } else if (proto === "Path") {
      return path(...parseVal(raw.origin));
    } else {
      const proto = !raw._proto ? null : raw._proto;
      const orig = {};

      for (const key of Object.keys(raw)) {
        if (key === "_proto" && proto === "Obj") {
          continue;
        }

        orig[key] = parseVal(raw[key]);
      }
      return v(proto, orig);
    }
  }

  throw `can not identify a val: ${JSON.stringify(raw)}`;
}

export function parseObjs(raws) {
  const objs = [];
  for (const raw of raws) {
    const obj = parseVal(raw);
    objs.push(obj);
  }
  return objs;
}
