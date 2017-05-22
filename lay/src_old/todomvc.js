export default {
  domain: {
    Task: {
      _proto: "Entity",
      title: "string",
      completed: "bool"
    },
    tasks: {
      create: {
        _proto: "EventListener",
        title: { _proto: "Argument", type: "string" },
        _stuff: {
          _proto: [
            "self",
            "append"
          ],
          _stuff: {
            _proto: "Task",
            id: { _proto: "UUID" },
            title: { _proto: "title" },
            completed: false
          }
        }
      },
      all: {
        // todo 本当はただのparent参照にしたいがうまくいかないので無駄にfilterかける
        _proto: [
          "parent",
          "filter"
        ],
        _stuff: {
          _proto: "Lambda",
          task: { _proto: "argument", type: "Task" },
          _stuff: true
        }
      },
      active: {
        _proto: [
          "parent",
          "filter"
        ],
        _stuff: {
          _proto: "Lambda",
          task: { _proto: "Argument", type: "Task" },
          _stuff: {
            _proto: "not",
            _stuff: {
              _proto: [
                "task",
                "completed",
              ]
            }
          }
        }
      },
      completed: {
        _proto: [
          "parent",
          "filter"
        ],
        _stuff: {
          _proto: "Lambda",
          task: { _proto: "Argument", type: "Task" },
          _stuff: {
            _proto: [
              "task",
              "completed",
            ]
          }
        }
      },
      _stuff: [
      ]
    }
  },
  presentation: {
    location: {
      hash: "",
    },
    // taskList: {
    //   _proto: "if",
    //   cond: {
    //     _proto: [
    //       "location",
    //       "hash",
    //       "equals"
    //     ],
    //     _stuff: "#/active"
    //   },
    //   then: {
    //     _proto: [
    //       "domain",
    //       "tasks",
    //       "active",
    //       "filter"
    //     ],
    //     _stuff: {
    //       _proto: "Lambda",
    //       task: { _proto: "argument", type: "Task" },
    //       _stuff: true
    //     }
    //   },
    //   else: {
    //     _proto: "if",
    //     cond: {
    //       _proto: [
    //         "location",
    //         "hash",
    //         "equals"
    //       ],
    //       _stuff: "#/completed"
    //     },
    //     then: {
    //       _proto: [
    //         "domain",
    //         "tasks",
    //         "completed",
    //         "filter"
    //       ],
    //       _stuff: {
    //         _proto: "Lambda",
    //         task: { _proto: "argument", type: "Task" },
    //         _stuff: true
    //       }
    //     },
    //     else: {
    //       _proto: [
    //         "domain",
    //         "tasks",
    //         "all",
    //         "filter"
    //       ],
    //       _stuff: {
    //         _proto: "Lambda",
    //         task: { _proto: "argument", type: "Task" },
    //         _stuff: true
    //       }
    //     }
    //   }
    // },
    body: {
      _proto: "Body",
      _stuff: [
        {
          _proto: "Section",
          class: "todoapp",
          _stuff: [
            {
              _proto: "Div",
              _stuff: [
                {
                  _proto: "Header",
                  class: "header",
                  _stuff: [
                    {
                      _proto: "H1",
                      _stuff: [
                        "todos"
                      ]
                    },
                    {
                      _proto: "Input",
                      class: "new-todo",
                      placeholder: "What needs to be done?",
                      autofocus: true,
                      clear: {
                        _proto: "EventListener",
                        _stuff: {
                          _proto: [
                            "self",
                            "set"
                          ],
                          value: "",
                        }
                      },
                      keyup: {
                        _proto: "EventListener",
                        keyCode: { _proto: "Argument", type: "Literal" },
                        _stuff: {
                          _proto: "if",
                          cond: {
                            _proto: [
                              "keyCode",
                              "equals"
                            ],
                            _stuff: 13
                          },
                          then: {
                            _proto: "Stuff",
                            _stuff: [
                              {
                                _proto: [
                                  "domain",
                                  "tasks",
                                  "create"
                                ],
                                title: {
                                  _proto: "value"
                                }
                              },
                              {
                                _proto: "clear"
                              }
                            ]
                          },
                          else: undefined
                        }
                      }
                    }
                  ]
                },
                {
                  _proto: "Section",
                  class: "main",
                  _stuff: [
                    {
                      _proto: "Input",
                      class: "toggle-all",
                      type: "checkbox"
                    },
                    {
                      _proto: "Ul",
                      class: "todo-list",
                      _stuff: { 
                        _proto: [
                          "domain",
                          "tasks",
                          "map"
                        ],
                        _stuff: [
                          {
                            _proto: "Lambda",
                            task: { _proto: "Argument", type: "Task" },
                            _stuff: [
                              {
                                _proto: "Li",
                                key: {
                                  _proto: [
                                    "task",
                                    "id"
                                  ]
                                },
                                _stuff: [
                                  {
                                    _proto: "Div",
                                    class: "view",
                                    _stuff: [
                                      {
                                        _proto: "Input",
                                        class: "toggle",
                                        type: "checkbox",
                                      },
                                      {
                                        _proto: "Label",
                                        _stuff: {
                                          _proto: [
                                            "task",
                                            "title"
                                          ],
                                        }
                                      },
                                      {
                                        _proto: "Button",
                                        class: "destroy",
                                      }
                                    ]
                                  },
                                  {
                                    _proto: "Input",
                                    class: "edit",
                                    value: {
                                      _proto: [
                                        "task",
                                        "title"
                                      ],
                                    }
                                  }
                                ]
                              }
                            ]
                          }
                        ]
                      }
                    }
                  ]
                },
                {
                  _proto: "Footer",
                  class: "footer",
                  _stuff: [
                    {
                      _proto: "Span",
                      class: "todo-count",
                      _stuff: [
                        {
                          _proto: "Strong",
                          _stuff: {
                            _proto: [
                              "domain",
                              "tasks",
                              "count"
                            ]
                          }
                        },
                        {
                          _proto: "Span",
                          _stuff: " "
                        },
                        {
                          _proto: "Span",
                          _stuff: {
                            _proto: "if",
                            cond: {
                              _proto: [
                                "domain", 
                                "tasks", 
                                "count", 
                                "equals"
                              ],
                              _stuff: 1
                            },
                            then: "item",
                            else: "items"
                          }
                        },
                        {
                          _proto: "Span",
                          _stuff: " left"
                        }
                      ]
                    },
                    {
                      _proto: "Ul",
                      class: "filters",
                      _stuff: [
                        {
                          _proto: "Li",
                          _stuff: [
                            {
                              _proto: "A",
                              href: "#/",
                              class: "selected",
                              _stuff: "All"
                            }
                          ]
                        },
                        {
                          _proto: "Span",
                        },
                        {
                          _proto: "Li",
                          _stuff: [
                            {
                              _proto: "A",
                              href: "#/active",
                              _stuff: "Active"
                            }
                          ]
                        },
                        {
                          _proto: "Span",
                        },
                        {
                          _proto: "Li",
                          _stuff: [
                            {
                              _proto: "A",
                              href: "#/completed",
                              _stuff: "Completed"
                            }
                          ]
                        },
                      ]
                    },
                    {
                      _proto: "Button",
                      class: "clear-completed",
                      _stuff: "Clear Completed"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          _proto: "Footer",
          class: "info",
          _stuff: [
            {
              _proto: "P",
              _stuff: "Double-click to edit a todo"
            },
            {
              _proto: "P",
              _stuff: [
                "Created by ",
                {
                  _proto: "A",
                  href: "http://github.com/emeitch/",
                  _stuff: "Hideyuki MORITA (emeitch)"
                }
              ]
            },
            {
              _proto: "P",
              _stuff: [
                "Part of ",
                {
                  _proto: "A",
                  href: "http://todomvc.com",
                  _stuff: "TodoMVC"
                }
              ]
            }
          ]
        }
      ]
    }
  }
};