/* eslint-env browser */
import { h, createProjector } from 'maquette';

import Prim from './prim';
import UUID from './uuid';
import Act from './act';
import v from './v';
import { sym } from './sym';
import { path } from './path';
import { func, LiftedNative } from './func';

export default class DOM {
  static setup(book) {
    const DOM = new UUID();
    book.set("DOM", DOM);

    function render(ev) {
      if (ev.equals(v(null))) {
        return undefined;
      }

      const children = [];
      const cs = ev.get("children");
      for (let i = 0; i < cs.origin.length; i++) {
        const c = cs.get(i);
        if (c instanceof Prim) {
          children.push(c.origin);
        } else {
          children.push(render(c));
        }
      }
      return h(ev.tag.origin, children);
    }

    book.put(
      DOM,
      sym("setup"),
      func(new LiftedNative(function() {
        const book = this;
        return new Act(() => {
          const projector = createProjector();
          document.addEventListener('DOMContentLoaded', function () {
            projector.append(document.body, () => render(path("DOM", "dom").reduce(book)));
          });
        });
      }))
    );
  }
}
