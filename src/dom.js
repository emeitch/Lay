/* eslint-env browser */
import { h, createProjector } from 'maquette';

import Book from './book';
import Prim from './prim';
import Act from './act';
import v from './v';
import { exp } from './exp';
import { sym } from './sym';
import { path } from './path';
import { func, LiftedNative } from './func';

function render(ev, book) {
  if (ev.equals(v(null))) {
    return undefined;
  }

  const children = [];
  const cs = ev.get("children");
  if (!cs.equals(v(null))) {
    for (let i = 0; i < cs.origin.length; i++) {
      const c = cs.get(i);
      if (c instanceof Prim) {
        children.push(c.origin);
      } else {
        children.push(render(c, book));
      }
    }
  }

  const attr = {};
  for (const key of Object.keys(ev.origin)) {
    if (key === "children") {
      continue;
    }
    attr[key] = path(ev, key).reduce(book).origin;
  }
  return h(ev.tag.origin, attr, children);
}

let contentLoaded = false;
function replaceProjector(book) {
  const placeholder = sym("dom");
  const domtree = placeholder.reduce(book);
  if (contentLoaded && !domtree.equals(placeholder)) {
    projector.replace(document.body, () => render(domtree, book));
  }
}

export const dom = new Book();
const projector = createProjector();
dom.set(
  "onImport",
  exp(func(
    new LiftedNative(function() { return new Act(() => {
      const book = this;
      document.addEventListener('DOMContentLoaded', () => {
        contentLoaded = true;
        replaceProjector(book);
      });
    });
  })))
);

dom.set(
  "onPut",
  exp(func(
    new LiftedNative(function() { return new Act(() => {
      const book = this;
      replaceProjector(book);
    });
  })))
);

function n(head, origin) {
  if (Array.isArray(origin)) {
    return path("Array", ["new", head].concat(origin));
  } else {
    const o = Object.keys(origin).reduce((r, k) => r.concat([k, origin[k]]), []);
    return path("Map", ["new", head].concat(o));
  }
}

export function elm(head, ...children) {
  let attr = {};
  if (children[0].constructor === Object) {
    attr = children.shift();
  }

  if (children && children.length > 0) {
    Object.assign(attr, {children: n("children", children)});
  }

  return n(head, attr);
}

export const e = {};
const etags = [
  "a",
  "abbr",
  "acronym",
  "address",
  "applet",
  "area",
  "article",
  "aside",
  "audio",
  "b",
  "base",
  "basefont",
  "bdi",
  "bdo",
  "big",
  "blockquote",
  "body",
  "br",
  "button",
  "canvas",
  "caption",
  "center",
  "cite",
  "code",
  "col",
  "colgroup",
  "datalist",
  "dd",
  "del",
  "details",
  "dfn",
  "dialog",
  "dir",
  "div",
  "dl",
  "dt",
  "em",
  "embed",
  "fieldset",
  "figcaption",
  "figure",
  "font",
  "footer",
  "form",
  "frame",
  "frameset",
  "h1",
  "h2",
  "h3",
  "h4",
  "head",
  "header",
  "hr",
  "html",
  "i",
  "iframe",
  "img",
  "input",
  "ins",
  "kbd",
  "keygen",
  "label",
  "legend",
  "li",
  "link",
  "main",
  "map",
  "mark",
  "menu",
  "menuitem",
  "meta",
  "meter",
  "nav",
  "noframes",
  "noscript",
  "object",
  "ol",
  "optgroup",
  "option",
  "output",
  "p",
  "param",
  "picture",
  "pre",
  "progress",
  "q",
  "rp",
  "rt",
  "ruby",
  "s",
  "samp",
  "script",
  "section",
  "select",
  "small",
  "source",
  "span",
  "strike",
  "strong",
  "style",
  "sub",
  "summary",
  "sup",
  "table",
  "tbody",
  "td",
  "textarea",
  "tfoot",
  "th",
  "thead",
  "time",
  "title",
  "tr",
  "track",
  "tt",
  "u",
  "ul",
  "var",
  "video",
  "wbr"
];
etags.forEach(etag => {
  e[etag] = (...args) => elm(etag, ...args);
});
