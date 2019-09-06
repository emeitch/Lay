import { sym } from './sym';
import { path } from './path';
import v from './v';

export function parseVal(raw) {
  const type = typeof(raw);
  if (
    raw === null ||
    type === "number" ||
    type === "string" ||
    type === "boolean"
  ) {
    return raw;
  }

  if (Array.isArray(raw)) {
    return raw.map(i => parseVal(i));
  }

  if (type === "object") {
    const type = raw._type;
    if (type === "Arr") {
      return v(raw.origin.map(i => parseVal(i)));
    } else if (type === "Time") {
      return v(new Date(raw.origin));
    } else if (type === "Sym") {
      return sym(raw.origin);
    } else if (type === "Path") {
      return path(...parseVal(raw.origin));
    } else {
      const type = !raw._type ? null : parseVal(raw._type);
      const orig = {};

      for (const key of Object.keys(raw)) {
        if (key == "_type" && type === "Obj") {
          continue;
        }

        orig[key] = parseVal(raw[key]);
      }
      return v(type, orig);
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
