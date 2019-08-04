/* eslint-env browser */
import { h, createProjector } from 'maquette';

import Store from './store';
import Prim from './prim';
import Act from './act';
import v from './v';
import { exp } from './exp';
import { path } from './path';
import { func, LiftedNative } from './func';
import { n } from './stdlib';

let dirty = false;
let vdomCache = null;
export const dom = new Store();
const projector = createProjector();
dom.assign(
  "onImport",
  func(
    new LiftedNative(function() { return new Act(() => {
      const store = this;
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
              children.push(render(c, store));
            }
          }
        }

        const tag = elm.getOwnProp("_type");
        const attr = {};
        for (const key of Object.keys(elm.origin)) {
          if (key === "children" || key === "_type") {
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
              const act = path(elm, [key, event]).deepReduce(store);
              return store.run(act);
            };

            if (tag.equals(v("body"))) {
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
              const act = path(elm, key).deepReduce(store);
              return store.run(new Act(() => env).then(act));
            };
          } else {
            const val = path(elm, key).deepReduce(store);
            attr[key] = val.origin;
          }
        }
        return h(tag.origin, attr, children);
      }

      function renderMaquette() {
        if (dirty || !vdomCache) {
          const placeholder = path("document", "body");
          const domtree = placeholder.deepReduce(store);
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
        const act = exp(placeholder, win).deepReduce(store);
        store.run(act);

        projector.append(document.body, renderMaquette);
      });
    });
  }))
);

dom.assign(
  "onPut",
  func(
    new LiftedNative(function() { return new Act(() => {
      dirty = true;
    });
  }))
);

dom.assign(
  "focusAfterAct",
  new Act(env => {
    const e = env.element;
    setTimeout(() => {
      e.focus();
    }, 0);
  })
);

const localStorage = "localStorage";
dom.set(
  localStorage,
  "read",
  func(
    "key",
    new LiftedNative(function(key) {
      return new Act(() => {
        return window.localStorage.getItem(key.origin);
      });
    })
  )
);
dom.set(
  localStorage,
  "appendObjs",
  func(
    new LiftedNative(function(key) {
      return new Act(objs => {
        const storage = JSON.parse(window.localStorage.getItem(key.origin)) || [];
        storage.push(...objs.map(o => o.object(this)));
        return JSON.stringify(storage);
      });
    })
  )
);
dom.set(
  localStorage,
  "write",
  func(
    "key",
    new LiftedNative(function(key) {
      return new Act(str => {
        if (typeof(str) === "string") {
          window.localStorage.setItem(key.origin, str);
        }
      });
    })
  )
);

export function elm(head, ...children) {
  let attr = {};
  if (children[0].constructor === Object) {
    attr = Object.assign({}, children.shift());
  }

  if (children && children.length > 0) {
    Object.assign(attr, {children: n("children", children)});
  }

  attr._type = head;

  return n(attr);
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
