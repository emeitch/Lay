/* eslint-env browser */
import Book from './book';
import { stdlib } from './stdlib';
import { exp } from './exp';
import { path } from './path';
import { func, concat } from './func';
import v from './v';
import DOM from './dom';

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

function n(head, origin) {
  if (Array.isArray(origin)) {
    return path("Array", ["new", head].concat(origin));
  } else {
    const o = Object.keys(origin).reduce((r, k) => r.concat([k, origin[k]]), []);
    return path("Map", ["new", head].concat(o));
  }
}

function elm(head, attr, ...children) {
  if (children.length > 0) {
    Object.assign(attr, {children: n("children", children)});
  }

  return n(head, attr);
}

DOM.setup(d);
{
  const dom = elm("div", {
    children: path("Task", "all", ["map", func("tid",
      elm("div", {},
        path("tid", "title")
      )
    )])
  });
  d.put(d.get("DOM"), "dom", dom);
  d.run(path("DOM", "setup"));
}
