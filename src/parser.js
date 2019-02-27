import { sym } from './sym';
import { ref } from './ref';
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
    if (!raw._type) {
      return ref(raw.origin);
    }

    const klass = parseVal(raw._type);
    if (klass.equals(ref("Comp"))) {
      return v(head, parseVal(raw.origin));
    } else if (klass.equals(ref("Array"))) {
      return v(head, raw.origin.map(i => parseVal(i)));
    } else if (klass.equals(ref("Date"))) {
      return v(head, new Date(raw.origin));
    } else if (klass.equals(ref("Sym"))) {
      return sym(raw.origin);
    } else if (klass.equals(ref("Path"))) {
      return path(...parseVal(raw.origin));
    } else {
      const org = {};
      for (const key of Object.keys(raw)) {
        if (key == "_type" && klass.equals(ref("Map"))) {
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

export function parseRef(str) {
  const s = v(str);

  const keys = s.origin.split(".");
  if (keys.length > 1) {
    return path(...keys);
  }

  if (s.origin.match(/^urn:uuid:(.*)/)) {
    return s;
  }

  return ref(s);
}
