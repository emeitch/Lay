/* eslint-env browser */
import Book from './book';
import Act from './act';
import { sym } from './sym';
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
    exp(sym("if"),
      path(sym("self"), "state", ["equals", n("active")]),
      path(sym("self"), ["set", "state", n("completed")]),
      path(sym("self"), ["set", "state", n("active")])
    )
  );
  d.put(Task, "editing", v(false));
  d.set("Task", Task);
}

{
  const todos = d.new();
  d.set("todos", todos);
  d.put(todos, "class", sym("App"));
  d.put(todos, "var", v("0.2.0"));
  d.put(todos, "state", n("all"));
  d.put(todos, "newTaskTitle", v(""));
  d.put(todos, "changeState", func("s", path(sym("self"), ["set", "state", sym("s")])));
  d.put(todos, "changeStateByHash", func(
    "hash",
    exp(
      sym("if"),
      path(sym("hash"), ["equals", v("#/active")]),
      path(sym("todos"), ["changeState", n("active")]),
      exp(
        sym("if"),
        path(sym("hash"), ["equals", v("#/completed")]),
        path(sym("todos"), ["changeState", n("completed")]),
        path(sym("todos"), ["changeState", n("all")])
      )
    )
  ));
  d.run(path(sym("Console"), ["puts", path(todos, "var")]));
}

{
  d.import(dom);
  const domtree = e.body(
    {
      onhashchange: func("ev",
        path(sym("todos"), ["changeStateByHash", path(sym("ev"), "location", "hash")])
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
            value: path(sym("todos"), "newTaskTitle"),
            onkeypress: func("ev",
              exp(sym("if"),
                path(sym("ev"), "keyCode", ["equals", v(13)]),
                exp(
                  sym("if"),
                  path(sym("ev"), "value", "trim", ["equals", v("")]),
                  v(null),
                  path(
                    sym("Object"),
                    [
                      "new",
                      n({
                        "class": sym("Task"),
                        "title": path(sym("ev"), "value", "trim"),
                        "state": n("active"),
                      })
                    ],
                    [
                      "then",
                      path(
                        sym("todos"),
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
                sym("todos"),
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
            style: exp(sym("if"), path(sym("Task"), "all", "count", ["equals", v(0)]), v("display:none;"), v(""))
          },
          e.input({
            class: "toggle-all",
            type: "checkbox",
            checked: path(
              sym("Task"),
              "all",
              [
                "every",
                func("tid",
                  path(sym("tid"), "state", ["equals", n("completed")]))
              ]
            ),
            onchange:
                func("ev",
                exp(
                  sym("if"),
                  path(
                    sym("Task"),
                    "all",
                    [
                      "every",
                      func("tid",
                        path(sym("tid"), "state", ["equals", n("completed")]))
                    ]
                  ),
                  path(
                    sym("Task"),
                    "all",
                    [
                      "map",
                      func("tid",
                        path(sym("tid"), ["set", "state", n("active")]))
                    ]
                  ),
                  path(
                    sym("Task"),
                    "all",
                    [
                      "map",
                      func("tid",
                        path(sym("tid"), ["set", "state", n("completed")]))
                    ]
                  )
                )
              )
          }),
          e.ul({class: "todo-list",
            children:
              path(sym("Task"), "all",
                [
                  "filter", func("tid",
                  exp(
                    sym("if"),
                    path(sym("todos"), "state", ["equals", n("all")]),
                    v(true),
                    exp(
                      sym("if"),
                      path(sym("todos"), "state", ["equals", n("active")]),
                      path(sym("tid"), "state", ["equals", n("active")]),
                      path(sym("tid"), "state", ["equals", n("completed")])
                    )
                  )
                )],
                ["map", func("tid",
                e.li({
                    key: sym("tid"),
                    class: path(
                      n([
                        path(sym("tid"), "state", "head"),
                        exp(
                          sym("if"),
                          path(sym("tid"), "editing"),
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
                      checked: path(sym("tid"), "state", ["equals", n("completed")]),
                      onchange:
                        func("ev",
                          path(sym("tid"), "toggle")
                        )
                    }),
                    e.label({
                        ondblclick: func("ev",
                          path(
                            sym("tid"),
                            [
                              "set",
                              "editing",
                              v("true")
                            ],
                            [
                              "then",
                              path(
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
                        path(sym("tid"),
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
                    value: path(sym("tid"), "editingTitle"),
                    afterUpdate: exp(
                      sym("if"),
                      path(sym("tid"), "editing"),
                      path(sym("focusAfterAct")),
                      new Act(() => {})
                    ),
                    onkeydown: func(
                      "ev",
                      exp(
                        sym("if"),
                        path(sym("ev"), "keyCode", ["equals", v(27)]),
                        path(
                          sym("tid"),
                          [
                            "set",
                            "editingTitle",
                            path(sym("tid"), "title")
                          ],
                          [
                            "then",
                            path(
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
                        sym("if"),
                        path(sym("ev"), "keyCode", ["equals", v(13)]),
                        exp(
                          func(
                            "t",
                            exp(
                              sym("if"),
                              path(sym("t"), ["equals", v("")]),
                              path(
                                path(sym("tid"),
                                  [
                                    "set",
                                    "exists",
                                    v(false)
                                  ]
                                )
                              ),
                              path(
                                sym("tid"),
                                [
                                  "set",
                                  "title",
                                  sym("t")
                                ],
                                [
                                  "then",
                                  path(
                                    sym("tid"),
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
                            sym("if"),
                            path(sym("t"), ["equals", v("")]),
                            path(
                              path(
                                sym("tid"),
                                [
                                  "set",
                                  "exists",
                                  v(false)
                                ]
                              )
                            ),
                            path(
                              sym("tid"),
                              [
                                "set",
                                "title",
                                sym("t")
                              ],
                              [
                                "then",
                                path(
                                  sym("tid"),
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
                          sym("ev"),
                          "value",
                          "trim"
                        )
                      )
                    ),
                    oninput: func("ev",
                      path(
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
            style: exp(sym("if"), path(sym("Task"), "all", "count", ["equals", v(0)]), v("display:none;"), v(""))
          },
          e.span({class: "todo-count"},
            e.strong(
              path(
                sym("Task"),
                "all",
                ["filter",
                  func("tid",
                    path(
                      sym("tid"),
                      "state",
                      ["equals", n("active")]))],
                "count",
                "toStr")),
            e.span(v(" ")),
            e.span(
              exp(
                sym("if"),
                path(
                  sym("Task"),
                  "all",
                  ["filter",
                    func("tid",
                      path(
                        sym("tid"),
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
                    sym("if"),
                    path(sym("todos"), "state", ["equals", n("all")]),
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
                    sym("if"),
                    path(sym("todos"), "state", ["equals", n("active")]),
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
                    sym("if"),
                    path(sym("todos"), "state", ["equals", n("completed")]),
                    "selected",
                    "none"
                  )
                },
                v("Completed")
              )
            )
          ),
          exp(
            sym("if"),
            path(
              sym("Task"),
              "all",
              [
                "filter",
                func("tid",
                  path(sym("tid"), "state", ["equals", n("completed")]))
              ],
              "count",
              ["equals", v(0)],
              "not"
            ),
            e.button({
                class: "clear-completed",
                onclick: func("ev",
                  path(
                    sym("Task"),
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
                          sym("tid"),
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

  const doc = path(sym("document")).deepReduce(d);
  d.put(doc, "body", domtree);
  const eventListeners = path(sym("document"), "eventListeners").deepReduce(d);
  d.put(eventListeners, "DOMContentLoaded", func("win",
    path(
      sym("todos"), ["changeStateByHash", path(sym("win"), "location", "hash")],
      ["then", path(sym("localStorage"), ["read", v("todos-lay")])],
      ["then", exp(sym("load"))]
    )
  ));
  d.set("onPut", path(
    exp(sym("filterLog"), v({"Task": ["class", "exists", "title", "state"]})),
    ["then", path(sym("localStorage"), "appendLog")],
    ["then", path(sym("localStorage"), ["write", v("todos-lay")])]
  ));
}
