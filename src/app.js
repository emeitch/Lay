/* eslint-env browser */
import Book from './book';
import { stdlib } from './stdlib';
import { exp } from './exp';
import { path } from './path';
import { func, concat } from './func';
import v from './v';
import { dom, e } from './dom';

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

{
  const domtree = e.body({},
    e.section({class: "todoapp"},
      e.div(
        e.header({class: "header"},
          e.h1(
            v("todos")
          ),
          e.input({class: "new-todo",
            placeholder: "What needs to be done?"})
        ),
        e.section({class: "main"},
          e.input({class: "toggle-all", type: "checkbox"}),
          e.ul({class: "todo-list",
            children:
              path("Task", "all", ["map", func("tid",
                e.li(
                  e.div({class: "view"},
                    e.input({class: "toggle", type: "checkbox"}),
                    e.label(path("tid", "title")),
                    e.button({class: "destroy"})
                  ),
                  e.input({class: "edit", value: "buy the milk"})
                )
              )])
            }
          )
        ),
        e.footer({class: "footer"},
          e.span({class: "todo-count"},
            e.strong(v("3")),
            e.span(v(" ")),
            e.span(v("itmes")),
            e.span(v(" left"))
          ),
          e.ul({class: "filters"},
            e.li(
              e.a({href: "#/", class: "selected"},
                v("All")
              )
            ),
            e.li(
              e.a({href: "#/active"},
                v("Active")
              )
            ),
            e.li(
              e.a({href: "#/completed"},
                v("Completed")
              )
            )
          )
        )
      )
    ),
    e.footer({class: "info"},
      e.p(
        v("Double-click to edit a todo")
      ),
      e.p(
        v("Created by "),
        e.a({href: "https://github.com/emeitch"},
          v("emeitch")
        )
      ),
      e.p(
        v("Part of "),
        e.a({href: "http://todomvc.com/"},
          v("TodoMVC")
        )
      )
    )
  );
  d.set("dom", domtree);
  d.import(dom);
}
