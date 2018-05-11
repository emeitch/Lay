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
      path("self", "state", ["equals", n("active")]),
      path("self", ["set", "state", n("completed")]),
      path("self", ["set", "state", n("active")])
    )
  );
  d.put(Task, "editing", v(false));
  d.set("Task", Task);
}

{
  const todos = d.new();
  d.set("todos", todos);
  d.put(todos, "type", path("App"));
  d.put(todos, "var", v("0.2.0"));
  d.put(todos, "state", n("all"));
  d.put(todos, "newTaskTitle", v(""));
  d.put(todos, "changeState", func("s", path("self", ["set", "state", path("s")])));
  d.put(todos, "changeStateByHash", func(
    "hash",
    exp(
      "if",
      path("hash", ["equals", v("#/active")]),
      path("todos", ["changeState", n("active")]),
      exp(
        "if",
        path("hash", ["equals", v("#/completed")]),
        path("todos", ["changeState", n("completed")]),
        path("todos", ["changeState", n("all")])
      )
    )
  ));
  d.run(path("Console", ["puts", path(todos, "var")]));
}

{
  d.import(dom);
  const domtree = e.body(
    {
      onhashchange: func("ev",
        path("todos", ["changeStateByHash", path("ev", "location", "hash")])
      )
    },
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
                exp(
                  "if",
                  path("ev", "value", "trim", ["equals", v("")]),
                  v(null),
                  path(
                    "Object",
                    [
                      "new",
                      n({
                        "type": path("Task"),
                        "title": path("ev", "value", "trim"),
                        "state": n("active"),
                      })
                    ],
                    [
                      "then",
                      path(
                        "todos",
                        [
                          "set",
                          "newTaskTitle",
                          v("")
                        ]
                      )
                    ]
                  )
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
                  path("tid", "state", ["equals", n("completed")]))
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
                        path("tid", "state", ["equals", n("completed")]))
                    ]
                  ),
                  path(
                    "Task",
                    "all",
                    [
                      "map",
                      func("tid",
                        path("tid", ["set", "state", n("active")]))
                    ]
                  ),
                  path(
                    "Task",
                    "all",
                    [
                      "map",
                      func("tid",
                        path("tid", ["set", "state", n("completed")]))
                    ]
                  )
                )
              )
          }),
          e.ul({class: "todo-list",
            children:
              path("Task", "all",
                [
                  "filter", func("tid",
                  exp(
                    "if",
                    path("todos", "state", ["equals", n("all")]),
                    v(true),
                    exp(
                      "if",
                      path("todos", "state", ["equals", n("active")]),
                      path("tid", "state", ["equals", n("active")]),
                      path("tid", "state", ["equals", n("completed")])
                    )
                  )
                )],
                ["map", func("tid",
                e.li({
                    key: "tid",
                    class: path(
                      n([
                        path("tid", "state", "head"),
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
                      checked: path("tid", "state", ["equals", n("completed")]),
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
                      path("tid", "editing"),
                      path("focusAfterAct"),
                      new Act(() => {})
                    ),
                    onkeydown: func(
                      "ev",
                      exp(
                        "if",
                        path("ev", "keyCode", ["equals", v(27)]),
                        path(
                          "tid",
                          [
                            "set",
                            "editingTitle",
                            path("tid", "title")
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
                    onkeypress: func("ev",
                      exp(
                        "if",
                        path("ev", "keyCode", ["equals", v(13)]),
                        exp(
                          func(
                            "t",
                            exp(
                              "if",
                              path("t", ["equals", v("")]),
                              path(
                                path("tid",
                                  [
                                    "set",
                                    "exists",
                                    v(false)
                                  ]
                                )
                              ),
                              path(
                                "tid",
                                [
                                  "set",
                                  "title",
                                  path("t")
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
                            )
                          ),
                          path(
                            "ev",
                            "value",
                            "trim"
                          )
                        ),
                        v(null)
                      )
                    ),
                    onblur: func(
                      "ev",
                      exp(
                        func(
                          "t",
                          exp(
                            "if",
                            path("t", ["equals", v("")]),
                            path(
                              path(
                                "tid",
                                [
                                  "set",
                                  "exists",
                                  v(false)
                                ]
                              )
                            ),
                            path(
                              "tid",
                              [
                                "set",
                                "title",
                                path("t")
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
                          )
                        ),
                        path(
                          "ev",
                          "value",
                          "trim"
                        )
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
                      ["equals", n("active")]))],
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
                        ["equals", n("active")]))],
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
              e.a(
                {
                  href: "#/",
                  class: exp(
                    "if",
                    path("todos", "state", ["equals", n("all")]),
                    "selected",
                    "none"
                  )
                },
                v("All")
              )
            ),
            e.li(
              e.a(
                {
                  href: "#/active",
                  class: exp(
                    "if",
                    path("todos", "state", ["equals", n("active")]),
                    "selected",
                    "none"
                  )
                },
                v("Active")
              )
            ),
            e.li(
              e.a(
                {
                  href: "#/completed",
                  class: exp(
                    "if",
                    path("todos", "state", ["equals", n("completed")]),
                    "selected",
                    "none"
                  )
                },
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
                  path("tid", "state", ["equals", n("completed")]))
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
                            n("completed")
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

  const doc = path("document").deepReduce(d);
  d.put(doc, "body", domtree);
  const eventListeners = path("document", "eventListeners").deepReduce(d);
  d.put(eventListeners, "DOMContentLoaded", func("win",
    path(
      "todos", ["changeStateByHash", path("win", "location", "hash")],
      ["then", path("localStorage", ["read", v("todos-lay")])],
      ["then", exp("load")]
    )
  ));
  d.set("onPut", path(
    exp("filterLog", v({"Task": ["type", "exists", "title", "state"]})),
    ["then", path("localStorage", "appendLog")],
    ["then", path("localStorage", ["write", v("todos-lay")])]
  ));
}
