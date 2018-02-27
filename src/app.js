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

function elm(head, ...children) {
  let attr = {};
  if (children[0].constructor === Object) {
    attr = children.shift();
  }

  if (children && children.length > 0) {
    Object.assign(attr, {children: n("children", children)});
  }

  return n(head, attr);
}

const e = {};
const etags = ["div"];
etags.forEach(etag => {
  e[etag] = (...args) => elm(etag, ...args);
});

DOM.setup(d);
{
  const dom = elm("body", {},
    elm("section", {class: "todoapp"},
      e.div(
        elm("header", {class: "header"},
          elm("h1",
            v("todos")
          ),
          elm("input", {class: "new-todo", placeholder: "What needs to be done?"})
        ),
        elm("section", {class: "main"},
          elm("input", {class: "toggle-all", type: "checkbox"}),
          elm("ul", {class: "todo-list",
            children:
              path("Task", "all", ["map", func("tid",
                elm("li",
                  e.div({class: "view"},
                    elm("input", {class: "toggle", type: "checkbox"}),
                    elm("label", path("tid", "title")),
                    elm("button", {class: "destroy"})
                  ),
                  elm("input", {class: "edit", value: "buy the milk"})
                )
              )])
            }
          )
        ),
        elm("footer", {class: "footer"},
          elm("span", {class: "todo-count"},
            elm("strong", v("3")),
            elm("span", v(" ")),
            elm("span", v("itmes")),
            elm("span", v(" left"))
          ),
          elm("ul", {class: "filters"},
            elm("li",
              elm("a", {href: "#/", class: "selected"},
                v("All")
              )
            ),
            elm("li",
              elm("a", {href: "#/active"},
                v("Active")
              )
            ),
            elm("li",
              elm("a", {href: "#/completed"},
                v("Completed")
              )
            )
          )
        )
      )
    ),
    elm("footer", {class: "info"},
      elm("p",
        v("Double-click to edit a todo")
      ),
      elm("p",
        v("Created by "),
        elm("a", {href: "https://github.com/emeitch"},
          v("emeitch")
        )
      ),
      elm("p",
        v("Part of "),
        elm("a", {href: "http://todomvc.com/"},
          v("TodoMVC")
        )
      )
    )
  );
  d.put(d.get("DOM"), "dom", dom);
  d.run(path("DOM", "setup"));
}
