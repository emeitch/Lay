import { sym } from './sym';
import { path } from './path';
import v from './v';

export function parseVal(raw) {
  const head = !raw || raw._head === undefined ? null : parseVal(raw._head);
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
    if (type === "Comp") {
      return v(head, parseVal(raw.origin));
    } else if (type === "Array") {
      return v(head, raw.origin.map(i => parseVal(i)));
    } else if (type === "Date") {
      return v(head, new Date(raw.origin));
    } else if (type === "Sym") {
      return sym(raw.origin);
    } else if (type === "Path") {
      return path(...parseVal(raw.origin));
    } else {
      const org = {};
      for (const key of Object.keys(raw)) {
        if (key == "_type" && type === "Map") {
          continue;
        }

        if (key == "_head") {
          continue;
        }

        org[key] = parseVal(raw[key]);
      }
      return v(head, org);
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
