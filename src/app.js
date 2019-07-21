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
  d.set("Task",
    "toggle",
    exp("if",
      path(sym("self"), "state", ["equals", v("active")]),
      path(sym("self"), ["set", "state", v("completed")]),
      path(sym("self"), ["set", "state", v("active")])
    )
  );
  d.set("Task", "editing", v(false));
}

{
  d.set("todos", "_type", "App");
  d.set("todos", "var", v("0.2.0"));
  d.set("todos", "state", v("all"));
  d.set("todos", "newTaskTitle", v(""));
  d.set("todos", "changeState", func("s", path(sym("self"), ["set", "state", sym("s")])));
  d.set("todos", "changeStateByHash", func(
    "hash",
    exp(
      "if",
      path(sym("hash"), ["equals", v("#/active")]),
      path("todos", ["changeState", v("active")]),
      exp(
        "if",
        path(sym("hash"), ["equals", v("#/completed")]),
        path("todos", ["changeState", v("completed")]),
        path("todos", ["changeState", v("all")])
      )
    )
  ));
  d.run(path("Console", ["puts", path("todos", "var")]));
}

{
  d.set("TaskView", "editing", v(false));
}

{
  const viewmodel = "viewmodel";
  d.put({
    _id: viewmodel,
    _stereotype: "TaskView"
  });
}

{
  d.import(dom);
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
                    "Object",
                    [
                      "new",
                      n({
                        "_type": "Task",
                        "title": path(sym("ev"), "value", "trim"),
                        "state": v("active"),
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
                  path(sym("tid"), "state", ["equals", v("completed")]))
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
                        path(sym("tid"), "state", ["equals", v("completed")]))
                    ]
                  ),
                  path(
                    "Task",
                    "all",
                    [
                      "map",
                      func("tid",
                        path(sym("tid"), ["set", "state", v("active")]))
                    ]
                  ),
                  path(
                    "Task",
                    "all",
                    [
                      "map",
                      func("tid",
                        path(sym("tid"), ["set", "state", v("completed")]))
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
                    path("todos", "state", ["equals", v("all")]),
                    v(true),
                    exp(
                      "if",
                      path("todos", "state", ["equals", v("active")]),
                      path(sym("tid"), "state", ["equals", v("active")]),
                      path(sym("tid"), "state", ["equals", v("completed")])
                    )
                  )
                )],
                ["map", func("tid",
                e.li({
                    key: path(sym("tid"), "_id", "toStr"),
                    class: path(
                      n([
                        path(path(sym("tid"), "state"), "_id"),
                        path(sym("tid"), "state", "toStr"),
                        exp(
                          "if",
                          path("viewmodel", sym("tid"), "editing"),
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
                      checked: path(sym("tid"), "state", ["equals", v("completed")]),
                      onchange:
                        func("ev",
                          path(sym("tid"), "toggle")
                        )
                    }),
                    e.label({
                        ondblclick: func("ev",
                          path(
                            "viewmodel",
                            sym("tid"),
                            [
                              "set",
                              "editing",
                              v(true)
                            ],
                            [
                              "then",
                              path(
                                "viewmodel",
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
                    value: path("viewmodel", sym("tid"), "editingTitle"),
                    afterUpdate: exp(
                      "if",
                      path("viewmodel", sym("tid"), "editing"),
                      path("focusAfterAct"),
                      new Act(() => {})
                    ),
                    onkeydown: func(
                      "ev",
                      exp(
                        "if",
                        path(sym("ev"), "keyCode", ["equals", v(27)]),
                        path(
                          "viewmodel",
                          sym("tid"),
                          [
                            "set",
                            "editingTitle",
                            path(sym("tid"), "title")
                          ],
                          [
                            "then",
                            path(
                              "viewmodel",
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
                                "viewmodel",
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
                              "viewmodel",
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
                        "viewmodel",
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
                      ["equals", v("active")]))],
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
                        ["equals", v("active")]))],
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
                    path("todos", "state", ["equals", v("all")]),
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
                    path("todos", "state", ["equals", v("active")]),
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
                    path("todos", "state", ["equals", v("completed")]),
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
                  path(sym("tid"), "state", ["equals", v("completed")]))
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
                            v("completed")
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
  d.set("document", "body", domtree);

  d.patch("document", {
    eventListeners: {
      DOMContentLoaded: func("win",
        path(
          "todos", ["changeStateByHash", path(sym("win"), "location", "hash")],
          ["then", path("localStorage", ["read", v("todos-lay-objs")])],
          ["then", path("load")]
        )
      )
    }
  });

  d.assign("onPut", path(
    exp("filterObjs", v(["Task"])),
    ["then", path("localStorage", ["appendObjs", v("todos-lay-objs")])],
    ["then", path("localStorage", ["write", v("todos-lay-objs")])]
  ));
}
