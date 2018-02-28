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
const etags = [
  "a",
  "abbr",
  "acronym",
  "address",
  "applet",
  "area",
  "article",
  "aside",
  "audio",
  "b",
  "base",
  "basefont",
  "bdi",
  "bdo",
  "big",
  "blockquote",
  "body",
  "br",
  "button",
  "canvas",
  "caption",
  "center",
  "cite",
  "code",
  "col",
  "colgroup",
  "datalist",
  "dd",
  "del",
  "details",
  "dfn",
  "dialog",
  "dir",
  "div",
  "dl",
  "dt",
  "em",
  "embed",
  "fieldset",
  "figcaption",
  "figure",
  "font",
  "footer",
  "form",
  "frame",
  "frameset",
  "h1",
  "h2",
  "h3",
  "h4",
  "head",
  "header",
  "hr",
  "html",
  "i",
  "iframe",
  "img",
  "input",
  "ins",
  "kbd",
  "keygen",
  "label",
  "legend",
  "li",
  "link",
  "main",
  "map",
  "mark",
  "menu",
  "menuitem",
  "meta",
  "meter",
  "nav",
  "noframes",
  "noscript",
  "object",
  "ol",
  "optgroup",
  "option",
  "output",
  "p",
  "param",
  "picture",
  "pre",
  "progress",
  "q",
  "rp",
  "rt",
  "ruby",
  "s",
  "samp",
  "script",
  "section",
  "select",
  "small",
  "source",
  "span",
  "strike",
  "strong",
  "style",
  "sub",
  "summary",
  "sup",
  "table",
  "tbody",
  "td",
  "textarea",
  "tfoot",
  "th",
  "thead",
  "time",
  "title",
  "tr",
  "track",
  "tt",
  "u",
  "ul",
  "var",
  "video",
  "wbr"
];
etags.forEach(etag => {
  e[etag] = (...args) => elm(etag, ...args);
});

DOM.setup(d);
{
  const dom = e.body({},
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
  d.put(d.get("DOM"), "dom", dom);
  d.run(path("DOM", "setup"));
}
