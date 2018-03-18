/* eslint-env browser */
import Book from './book';
import { stdlib } from './stdlib';
import { exp } from './exp';
import { path } from './path';
import { func } from './func';
import v from './v';
import { dom, e, n } from './dom';

const d = new Book(stdlib);

// {
//   const id = d.new();
//   d.put(id, "tag", "Task");
//   d.put(id, "title", v("buy the milk"));
//   d.put(id, "state", "active");
// }
//
// {
//   const id = d.new();
//   d.put(id, "tag", "Task");
//   d.put(id, "title", v("buy the beer"));
//   d.put(id, "state", "active");
// }
//
// {
//   const id = d.new();
//   d.put(id, "tag", "Task");
//   d.put(id, "title", v("buy the wine"));
//   d.put(id, "state", "active");
// }

// d.existsIDs().forEach(i => {
//   const logs = d.findLogs({id: i});
//   logs.forEach(l => {
//     console.log(l.key.stringify(), ":", l.val.stringify());
//   });
//   console.log("----------");
// });

{
  const Task = d.new();
  d.put(Task,
    "toggle",
    exp("if",
      path("self", "state", ["equals", "active"]),
      path("self", ["set", "state", "completed"]),
      path("self", ["set", "state", "active"])
    )
  );
  d.set("Task", Task);
}

{
  const todos = d.new();
  d.set("todos", todos);
  d.put(todos, "tag", "App");
  d.put(todos, "state", "All");
  d.put(todos, "newTaskTitle", v(""));
  d.put(todos, "changeState", func("s", path("self", ["set", "state", "s"])));

  console.log(path(todos, "state").reduce(d));
  console.log("change state");
  d.run(path(todos, ["changeState", "Active"]));
  console.log(path(todos, "state").reduce(d));
  console.log("----------");
}

{
  // const vtasks = path("Task", "all");
  //
  // {
  //   d.run(path(vtasks, ["map", func("tid", path("tid", "toggle"))]));
  // }
  //
  // {
  //   d.run(path(vtasks, ["map", func("tid",
  //     path(
  //       "Console",
  //       ["puts",
  //         exp(concat,
  //           v("tag: "),
  //           path("tid", "tag"))],
  //       ["then",
  //         path("Console",
  //           ["puts",
  //             exp(concat,
  //               v("state: "),
  //               path("tid", "state"))])
  //       ],
  //       ["then",
  //         path("Console", ["puts", v("-----------")])
  //       ]
  //   ))]));
  // }
}

{
  d.import(dom);
  const domtree = e.body({},
    e.section({class: "todoapp"},
      e.div(
        e.header({class: "header"},
          e.h1(
            v("todos")
          ),
          e.input({
            class: "new-todo",
            autofocus: v(true),
            placeholder: "What needs to be done?",
            value: path("todos", "newTaskTitle"),
            onkeyup: func("ev",
              exp("if",
                path("ev", "keyCode", ["equals", v(13)]),
                path("Object",
                  [
                    "new",
                    n("dummy", {
                      "tag": "Task",
                      "title": path("ev", "value"),
                      "state": "active"
                    })
                  ],
                  [
                    "then",
                    path("todos",
                      [
                        "set",
                        "newTaskTitle",
                        v("")
                      ]
                    )
                  ]
                ),
                v(null)
              )
            ),
            onchange: func("ev",
              path(
                "todos",
                [
                  "set",
                  "newTaskTitle",
                  path("ev", "value")
                ]
              )
            )
          })
        ),
        e.section({
            class: "main",
            style: exp("if", path("Task", "all", "count", ["equals", v(0)]), v("display:none;"), v(""))
          },
          e.input({class: "toggle-all", type: "checkbox"}),
          e.ul({class: "todo-list",
            children:
              path("Task", "all", ["map", func("tid",
                e.li({
                    key: "tid",
                    class: path("tid", "state"),
                  },
                  e.div({class: "view"},
                    e.input({
                      class: "toggle",
                      type: "checkbox",
                      checked: path("tid", "state", ["equals", "completed"]),
                      onchange:
                        func("el",
                          path(
                            "tid", "toggle",
                            ["then",
                              path("Console",
                                ["puts", v("onchange:")])],
                            ["then",
                              path("Console",
                                ["puts", "tid"])],
                            ["then",
                              path("Console",
                                ["puts", path("tid", "state")])],
                            ["then",
                              path("Console",
                                ["puts", v("-----------")])]
                          )
                        )
                    }),
                    e.label(path("tid", "title")),
                    e.button({class: "destroy"})
                  ),
                  e.input({class: "edit", value: "buy the milk"})
                )
              )])
            }
          )
        ),
        e.footer({
            class: "footer",
            style: exp("if", path("Task", "all", "count", ["equals", v(0)]), v("display:none;"), v(""))
          },
          e.span({class: "todo-count"},
            e.strong(
              path(
                "Task",
                "all",
                ["filter",
                  func("tid",
                    path(
                      "tid",
                      "state",
                      ["equals", "active"]))],
                "count",
                "toStr")),
            e.span(v(" ")),
            e.span(v("items")),
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

  // setTimeout(() => {
  //   d.new({
  //     "tag": "Task",
  //     "title": v("buy the coffee"),
  //     "state": "active"
  //   });
  // }, 1000);
}
