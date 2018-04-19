/* eslint-env browser */
import { h, createProjector } from 'maquette';

import Book from './book';
import Prim from './prim';
import Act from './act';
import UUID from './uuid';
import v from './v';
import { sym } from './sym';
import { exp } from './exp';
import { path } from './path';
import { func, LiftedNative } from './func';
import { n } from './stdlib';

let dirty = false;
let vdomCache = null;
export const dom = new Book();
const doc = new UUID();
dom.set("document", doc);
dom.put(doc, "eventListeners", new UUID());
const projector = createProjector();
dom.set(
  "onImport",
  func(
    new LiftedNative(function() { return new Act(() => {
      const book = this;
      function render(elm) {
        if (elm === undefined) {
          return undefined;
        }

        const children = [];
        const cs = elm.get("children");
        if (cs !== undefined) {
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
        for (const key of Object.keys(elm.origin)) {
          if (key === "children") {
            continue;
          }

          if (key.match(/^on/)) {
            const callback = ev => {
              // todo: イベントデータの扱いがアドホックな対応なのであとで改修する
              const eo = {
                keyCode: ev.keyCode,
                value: ev.target.value,
                location: {
                  hash: window.location.hash
                }
              };
              const event = v("Event", eo);
              const act = path(elm, [key, event]).deepReduce(book);
              return book.run(act);
            };

            if (elm.class.equals(sym("body"))) {
              window[key] = (...args) => {
                const res = callback(...args);
                dirty = true;
                projector.scheduleRender();
                return res;
              };
            } else {
              attr[key] = callback;
            }
          } else if (key.match(/^after/)) {
            attr[key] = element => {
              const env = {element};
              const act = path(elm, key).deepReduce(book);
              return book.run(new Act(() => env).then(act));
            };
          } else {
            const val = path(elm, key).deepReduce(book);
            attr[key] = val.origin;
          }
        }
        return h(elm.class.origin, attr, children);
      }

      function renderMaquette() {
        if (dirty || !vdomCache) {
          const placeholder = path("document", "body");
          const domtree = placeholder.deepReduce(book);
          dirty = false;
          vdomCache = render(domtree);
        }
        return vdomCache;
      }

      document.addEventListener("DOMContentLoaded", () => {
        const placeholder = path("document", "eventListeners", "DOMContentLoaded");
        const win = v({
          location: {
            hash: window.location.hash
          }
        });
        const act = exp(placeholder, win).deepReduce(book);
        book.run(act);

        projector.append(document.body, renderMaquette);
      });
    });
  }))
);

dom.set(
  "onPut",
  func(
    new LiftedNative(function() { return new Act(() => {
      dirty = true;
    });
  }))
);

dom.set(
  "focusAfterAct",
  new Act(env => {
    const e = env.element;
    setTimeout(() => {
      e.focus();
    }, 0);
  })
);

const localStorage = new UUID();
dom.set("localStorage", localStorage);
dom.put(
  localStorage,
  "read",
  func(
    "key",
    new LiftedNative(function(key) {
      const k = key.deepReduce(this);
      return new Act(() => {
        return window.localStorage.getItem(k.origin);
      });
    })
  )
);
dom.put(
  localStorage,
  "appendLog",
  func(
    new LiftedNative(function() {
      return new Act(log => {
        if (log) {
          const storageKey = "todos-lay";
          const storage = JSON.parse(window.localStorage.getItem(storageKey)) || [];
          storage.push(log.object(this));
          return JSON.stringify(storage);
        } else {
          return null;
        }
      });
    })
  )
);
dom.put(
  localStorage,
  "write",
  func(
    "key",
    new LiftedNative(function(key) {
      const k = key.deepReduce(this);
      return new Act(str => {
        if (typeof(str) === "string") {
          window.localStorage.setItem(k.origin, str);
        }
      });
    })
  )
);

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
