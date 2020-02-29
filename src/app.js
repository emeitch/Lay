/* eslint-env browser */
import Store from './store';
import Act from './act';
import { std, n } from './stdlib';
import { exp } from './exp';
import { path } from './path';
import { func } from './func';
import v from './v';
import { sym } from './sym';
import { dom, e } from './dom';

const d = new Store(std);

{
  const task = d.create({
    _key: "Task"
  });

  d.set(task,
    "toggle",
    exp("if",
      path("self", "state", ["equals", path("active")]),
      path("self", ["set", "state", path("completed")]),
      path("self", ["set", "state", path("active")])
    )
  );
  d.set(task, "editing", v(false));
}

{
  const todos = d.create({});
  d.assign("todos", path(todos));
  d.set(todos, "_proto", "App");
  d.set(todos, "var", v("0.3.0"));
  d.set(todos, "state", path("all"));
  d.set(todos, "newTaskTitle", v(""));
  d.set(todos, "changeState", func("s", path("self", ["set", "state", sym("s")])));
  d.set(todos, "changeStateByHash", func(
    "hash",
    exp(
      "if",
      path(sym("hash"), ["equals", v("#/active")]),
      path("todos", ["changeState", path("active")]),
      exp(
        "if",
        path(sym("hash"), ["equals", v("#/completed")]),
        path("todos", ["changeState", path("completed")]),
        path("todos", ["changeState", path("all")])
      )
    )
  ));
  d.run(path("Console", ["puts", path("todos", "var")]));
}

{
  const taskview = d.create({
    _key: "TaskView"
  });
  d.set(taskview, "editing", v(false));
}

{
  const vm = d.create({
    _stereo: "TaskView"
  });
  d.assign("vm", path(vm));
}

{
  d.import(dom);

  const document = d.create({});
  d.assign("document", path(document));
  const domtree = e.body(
    {
      onhashchange: func("ev",
        path("todos", ["changeStateByHash", path(sym("ev"), "location", "hash")])
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
                path(sym("ev"), "keyCode", ["equals", v(13)]),
                exp(
                  "if",
                  path(sym("ev"), "value", "trim", ["equals", v("")]),
                  v(null),
                  path(
                    "Entity",
                    [
                      "create",
                      n({
                        "_proto": "Task",
                        "title": path(sym("ev"), "value", "trim"),
                        "state": path("active"),
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
            // todo: maquetteの都合上、前回vdomと新vdomのプロパティ値に差分がないと実DOMの書き換えができないので、oninputで毎度newTaskTitleを書き換える。後ほど是正したい。
            oninput: func("ev",
              path(
                "todos",
                [
                  "set",
                  "newTaskTitle",
                  path(sym("ev"), "value")
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
                  path(sym("tid"), "state", ["equals", path("completed")]))
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
                        path(sym("tid"), "state", ["equals", path("completed")]))
                    ]
                  ),
                  path(
                    "Task",
                    "all",
                    [
                      "map",
                      func("tid",
                        path(sym("tid"), ["set", "state", path("active")]))
                    ]
                  ),
                  path(
                    "Task",
                    "all",
                    [
                      "map",
                      func("tid",
                        path(sym("tid"), ["set", "state", path("completed")]))
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
                    path("todos", "state", ["equals", path("all")]),
                    v(true),
                    exp(
                      "if",
                      path("todos", "state", ["equals", path("active")]),
                      path(sym("tid"), "state", ["equals", path("active")]),
                      path(sym("tid"), "state", ["equals", path("completed")])
                    )
                  )
                )],
                ["map", func("tid",
                e.li({
                    key: path(sym("tid"), "_id", "toStr"),
                    class: path(
                      n([
                        path(sym("tid"), "state", "toStr"),
                        exp(
                          "if",
                          path("vm", sym("tid"), "editing"),
                          "editing",
                          v(null)
                        )
                      ]),
                      ["filter", func("i", path(sym("i"), ["equals", v(null)], "not"))],
                      ["join", v(" ")]
                    )
                  },
                  e.div({class: "view"},
                    e.input({
                      class: "toggle",
                      type: "checkbox",
                      checked: path(sym("tid"), "state", ["equals", path("completed")]),
                      onchange:
                        func("ev",
                          path(sym("tid"), "toggle")
                        )
                    }),
                    e.label({
                        ondblclick: func("ev",
                          path(
                            "vm",
                            sym("tid"),
                            [
                              "set",
                              "editing",
                              v(true)
                            ],
                            [
                              "then",
                              path(
                                "vm",
                                sym("tid"),
                                [
                                  "set",
                                  "editingTitle",
                                  path(sym("tid"), "title")
                                ]
                              )
                            ]
                          )
                        )
                      },
                      path(sym("tid"), "title")
                    ),
                    e.button({
                      class: "destroy",
                      onclick: func("ev",
                        path(
                          sym("tid"),
                          "delete"
                        )
                      )
                    })
                  ),
                  e.input({
                    class: "edit",
                    value: path("vm", sym("tid"), "editingTitle"),
                    afterUpdate: exp(
                      "if",
                      path("vm", sym("tid"), "editing"),
                      path("focusAfterAct"),
                      new Act(() => {})
                    ),
                    onkeydown: func(
                      "ev",
                      exp(
                        "if",
                        path(sym("ev"), "keyCode", ["equals", v(27)]),
                        path(
                          "vm",
                          sym("tid"),
                          [
                            "set",
                            "editingTitle",
                            path(sym("tid"), "title")
                          ],
                          [
                            "then",
                            path(
                              "vm",
                              sym("tid"),
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
                        path(sym("ev"), "keyCode", ["equals", v(13)]),
                        exp(
                          func(
                            "t",
                            exp(
                              "if",
                              path(sym("t"), ["equals", v("")]),
                              path(
                                path(
                                  sym("tid"),
                                  "delete"
                                )
                              ),
                              path(
                                "vm",
                                sym("tid"),
                                [
                                  "set",
                                  "editing",
                                  v(false)
                                ],
                                [
                                  "then",
                                  exp(
                                    "if",
                                    path(sym("t"), ["equals", path(sym("tid"), "title")]),
                                    v(null),
                                    path(
                                      sym("tid"),
                                      [
                                        "set",
                                        "title",
                                        path(sym("t"))
                                      ]
                                    )
                                  )
                                ]
                              )
                            )
                          ),
                          path(
                            sym("ev"),
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
                            path(sym("t"), ["equals", v("")]),
                            path(
                              path(
                                sym("tid"),
                                "delete"
                              )
                            ),
                            path(
                              "vm",
                              sym("tid"),
                              [
                                "set",
                                "editing",
                                v(false)
                              ],
                              [
                                "then",
                                exp(
                                  "if",
                                  path(sym("t"), ["equals", path(sym("tid"), "title")]),
                                  v(null),
                                  path(
                                    sym("tid"),
                                    [
                                      "set",
                                      "title",
                                      path(sym("t"))
                                    ]
                                  )
                                )
                              ]
                            )
                          )
                        ),
                        path(
                          sym("ev"),
                          "value",
                          "trim"
                        )
                      )
                    ),
                    oninput: func(
                      "ev",
                      path(
                        "vm",
                        sym("tid"),
                        [
                          "set",
                          "editingTitle",
                          path(sym("ev"), "value")
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
                      sym("tid"),
                      "state",
                      ["equals", path("active")]))],
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
                        sym("tid"),
                        "state",
                        ["equals", path("active")]))],
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
                    path("todos", "state", ["equals", path("all")]),
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
                    path("todos", "state", ["equals", path("active")]),
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
                    path("todos", "state", ["equals", path("completed")]),
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
                  path(sym("tid"), "state", ["equals", path("completed")]))
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
                          sym("tid"),
                          "state",
                          [
                            "equals",
                            path("completed")
                          ]
                        )
                      )
                    ],
                    [
                      "map",
                      func(
                        "tid",
                        path(
                          sym("tid"),
                          "delete"
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
  d.set(document, "body", domtree);
  d.patch(document, {
    eventListeners: {
      DOMContentLoaded: func("win",
        path(
          "todos", ["changeStateByHash", path(sym("win"), "location", "hash")],
          ["then", path("localStorage", ["read", v("todos-lay-objs-0.3")])],
          ["then", path("load")]
        )
      )
    }
  });

  d.assign("onPut", path(
    exp("filterObjs", v(["Task"])),
    ["then", path("localStorage", ["appendObjs", v("todos-lay-objs-0.3")])],
    ["then", path("localStorage", ["write", v("todos-lay-objs-0.3")])]
  ));
}
