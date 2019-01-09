/* eslint-env browser */
import Store from './store';
import Act from './act';
import { std, n } from './stdlib';
import { exp } from './exp';
import { pack } from './pack';
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
      path("self", "state", ["equals", n("active")]),
      path("self", ["set", "state", n("completed")]),
      path("self", ["set", "state", n("active")])
    )
  );
  d.set("Task", "editing", v(false));
}

{
  d.set("todos", "_type", sym("App"));
  d.set("todos", "var", v("0.2.0"));
  d.set("todos", "state", n("all"));
  d.set("todos", "newTaskTitle", v(""));
  d.set("todos", "changeState", func("s", path("self", ["set", "state", path("s")])));
  d.set("todos", "changeStateByHash", func(
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
  d.run(path("Console", ["puts", path("todos", "var")]));
}

{
  d.set("TaskView", "editing", v(false));
}

{
  const viewmodel = "viewmodel";
  d.put({
    _id: viewmodel
  });
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
                        "_type": pack(sym("Task")),
                        "title": path("ev", "value", "trim"),
                        "state": n("active"),
                      })
                    ],
                    // todo: 本来ならviewmodel構築のロジックは入れるべきでないので下記を取り除きたい
                    [
                      "then",
                      path(
                        "Act",
                        [
                          "new",
                          func("id",
                            path("Object",
                            [
                              "new",
                              n({
                                "_type": pack(sym("TaskView")),
                              })
                            ],
                            [
                              "then",
                              path(
                                "Act",
                                [
                                  "new",
                                  func(
                                    "vid",
                                    path("viewmodel", ["set", sym("id"), sym("vid")])
                                  )
                                ]
                              )
                            ]
                            )
                          )
                        ]
                      )
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
                    key: path("tid", "_id", "toStr"),
                    class: path(
                      n([
                        path("tid", "state", "head"),
                        exp(
                          "if",
                          path("viewmodel", sym("tid"), "editing"),
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
                            "_status",
                            v("deleted", null)
                          ]
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
                        path("ev", "keyCode", ["equals", v(27)]),
                        path(
                          "viewmodel",
                          sym("tid"),
                          [
                            "set",
                            "editingTitle",
                            path("tid", "title")
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
                                    "_status",
                                    v("deleted", null)
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
                                    "viewmodel",
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
                                  "_status",
                                  v("deleted", null)
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
                                  "viewmodel",
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
                          "ev",
                          "value",
                          "trim"
                        )
                      )
                    ),
                    // oninput: func("ev",
                    //   path(
                    //     "viewmodel",
                    //     sym("tid"),
                    //     [
                    //       "set",
                    //       "editingTitle",
                    //       path("ev", "value")
                    //     ]
                    //   )
                    // )
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
                            "_status",
                            v("deleted", null)
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
  d.set("document", "body", domtree);

  d.patch("document", {
    eventListeners: {
      DOMContentLoaded: func("win",
        path(
          "todos", ["changeStateByHash", path("win", "location", "hash")],
          ["then", path("localStorage", ["read", v("todos-lay-objs")])],
          ["then", exp("load")],
          // todo: 本来ならviewmodel構築のロジックは入れるべきでないので下記を取り除きたい
          ["then", path(
            "Act",
            [
              "new",
              func("objs",
                path(
                "objs",
                [
                  "map",
                  func("obj",
                    path("Object",
                    [
                      "new",
                      n({
                        "_type": pack(sym("TaskView")),
                      })
                    ],
                    [
                      "then",
                      path(
                        "Act",
                        [
                          "new",
                          func(
                            "vid",
                            path("viewmodel", ["set", sym("obj"), sym("vid")])
                          )
                        ]
                      )
                    ])
                  )
                ]
              ))
            ]
          )]
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
