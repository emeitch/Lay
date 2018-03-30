/* eslint-env browser */
import Book from './book';
import Act from './act';
import { stdlib, n } from './stdlib';
import { exp } from './exp';
import { path } from './path';
import { func } from './func';
import v from './v';
import { dom, e } from './dom';

const d = new Book(stdlib);

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
  d.put(Task, "editing", v(false));
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
            onkeypress: func("ev",
              exp("if",
                path("ev", "keyCode", ["equals", v(13)]),
                path("Object",
                  [
                    "new",
                    n({
                      "tag": "Task",
                      "title": path("ev", "value", "trim"),
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
            // todo: maquette利用の都合上、前回vdomと実DOMのプロパティが一緒でないと値の書き換えができないので、oninputで毎度newTaskTitleを書き換えている。後ほど是正したい。
            oninput: func("ev",
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
          e.input({
            class: "toggle-all",
            type: "checkbox",
            checked: path(
              "Task",
              "all",
              [
                "every",
                func("tid",
                  path("tid", "state", ["equals", "completed"]))
              ]
            ),
            onchange:
                func("ev",
                exp(
                  "if",
                  path(
                    "Task",
                    "all",
                    [
                      "every",
                      func("tid",
                        path("tid", "state", ["equals", "completed"]))
                    ]
                  ),
                  path(
                    "Task",
                    "all",
                    [
                      "map",
                      func("tid",
                        path("tid", ["set", "state", "active"]))
                    ]
                  ),
                  path(
                    "Task",
                    "all",
                    [
                      "map",
                      func("tid",
                        path("tid", ["set", "state", "completed"]))
                    ]
                  )
                )
              )
          }),
          e.ul({class: "todo-list",
            children:
              path("Task", "all", ["map", func("tid",
                e.li({
                    key: "tid",
                    class: path(
                      n([
                        path("tid", "state"),
                        exp(
                          "if",
                          path("tid", "editing"),
                          "editing",
                          v(null)
                        )
                      ]),
                      ["filter", func("i", path("i", ["equals", v(null)], "not"))],
                      ["join", v(" ")]
                    )
                  },
                  e.div({class: "view"},
                    e.input({
                      class: "toggle",
                      type: "checkbox",
                      checked: path("tid", "state", ["equals", "completed"]),
                      onchange:
                        func("ev",
                          path("tid", "toggle")
                        )
                    }),
                    e.label({
                        ondblclick: func("ev",
                          path(
                            "tid",
                            [
                              "set",
                              "editing",
                              v("true")
                            ],
                            [
                              "then",
                              path(
                                "tid",
                                [
                                  "set",
                                  "editingTitle",
                                  path("tid", "title")
                                ]
                              )
                            ]
                          )
                        )
                      },
                      path("tid", "title")
                    ),
                    e.button({
                      class: "destroy",
                      onclick: func("ev",
                        path("tid",
                          [
                            "set",
                            "exists",
                            v(false)
                          ]
                        )
                      )
                    })
                  ),
                  e.input({
                    class: "edit",
                    value: path("tid", "editingTitle"),
                    afterUpdate: exp(
                      "if",
                      path("tid", "editing", ["equals", v(null)], "not"),
                      path("focusAfterAct"),
                      new Act(() => {})
                    ),
                    onkeypress: func("ev",
                      exp("if",
                        path("ev", "keyCode", ["equals", v(13)]),
                        path(
                          "tid",
                          [
                            "set",
                            "title",
                            path(
                              "ev",
                              "value"
                            )
                          ],
                          [
                            "then",
                            path(
                              "tid",
                              [
                                "set",
                                "editing",
                                v(false)
                              ]
                            )
                          ]
                        ),
                        v(null)
                      )
                    ),
                    onblur: func("ev",
                      path(
                        "tid",
                        [
                          "set",
                          "title",
                          path(
                            "ev",
                            "value"
                          )
                        ],
                        [
                          "then",
                          path(
                            "tid",
                            [
                              "set",
                              "editing",
                              v(false)
                            ]
                          )
                        ]
                      )
                    ),
                    oninput: func("ev",
                      path(
                        "tid",
                        [
                          "set",
                          "editingTitle",
                          path("ev", "value")
                        ]
                      )
                    )
                  })
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
            e.span(
              exp(
                "if",
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
                  ["equals", v(1)]
                ),
                v("item"),
                v("items")
              )
            ),
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
          ),
          exp(
            "if",
            path(
              "Task",
              "all",
              [
                "filter",
                func("tid",
                  path("tid", "state", ["equals", "completed"]))
              ],
              "count",
              ["equals", v(0)],
              "not"
            ),
            e.button({
                class: "clear-completed",
                onclick: func("ev",
                  path(
                    "Task",
                    "all",
                    [
                      "filter",
                      func(
                        "tid",
                        path(
                          "tid",
                          "state",
                          [
                            "equals",
                            "completed"
                          ]
                        )
                      )
                    ],
                    [
                      "map",
                      func(
                        "tid",
                        path(
                          "tid",
                          [
                            "set",
                            "exists",
                            v(false)
                          ]
                        )
                      )
                    ]
                  )
                )
              },
              v("Clear completed")
            ),
            v(null)
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
}
