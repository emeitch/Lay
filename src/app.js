/* eslint-env browser */
import { h, createProjector } from 'maquette';

import Book from './book';
import { stdlib } from './stdlib';
import { exp } from './exp';
import { path } from './path';
import { func, concat } from './func';
import Prim from './Prim';
import v from './v';

const d = new Book(stdlib);

{
  const id = d.new();
  d.put(id, "tag", "Task");
  d.put(id, "title", v("buy the milk"));
  d.put(id, "state", "active");
}

{
  const id = d.new();
  d.put(id, "tag", "Task");
  d.put(id, "title", v("buy the beer"));
  d.put(id, "state", "active");
}

{
  const id = d.new();
  d.put(id, "tag", "Task");
  d.put(id, "title", v("buy the wine"));
  d.put(id, "state", "active");
}

d.existsIDs().forEach(i => {
  const logs = d.findLogs({id: i});
  logs.forEach(l => {
    console.log(l.key.stringify(), ":", l.val.stringify());
  });
  console.log("----------");
});

{
  const Task = d.new();
  d.put(Task, "complete", path("self", ["set", "state", "completed"]));
  d.set("Task", Task);
}

{
  const vtasks = path("Task", "all");

  {
    d.run(path(vtasks, ["map", func("tid", path("tid", "complete"))]));
  }

  {
    d.run(path(vtasks, ["map", func("tid",
      path(
        "Console",
        ["puts",
          exp(concat,
            v("tag: "),
            path("tid", "tag"))],
        ["then",
          path("Console",
            ["puts",
              exp(concat,
                v("state: "),
                path("tid", "state"))])
        ],
        ["then",
          path("Console", ["puts", v("-----------")])
        ]
    ))]));
  }
}

const dom = path("Map", ["new", "div", "children",
  path("Task", "all", ["map", func("tid", path("Map", ["new", "div", "children", path("Array", ["new", "foo", path("tid", "title")])]))])]);

function render(ev) {
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

const projector = createProjector();
document.addEventListener('DOMContentLoaded', function () {
  projector.append(document.body, () => render(dom.reduce(d)));
});
