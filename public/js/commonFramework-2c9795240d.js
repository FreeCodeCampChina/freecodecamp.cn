"use strict";
function _objectWithoutProperties(e, n) {
    var t = {};
    for (var o in e)
        n.indexOf(o) >= 0 || Object.prototype.hasOwnProperty.call(e, o) && (t[o] = e[o]);
    return t
}
function _objectWithoutProperties(e, n) {
    var t = {};
    for (var o in e)
        n.indexOf(o) >= 0 || Object.prototype.hasOwnProperty.call(e, o) && (t[o] = e[o]);
    return t
}
window.common = function(e) {
    var n = e.Rx
      , t = n.Disposable
      , o = n.Observable
      , r = n.config
      , i = e.common
      , a = void 0 === i ? {
        init: []
    } : i;
    r.longStackSupport = !0,
    a.head = a.head || [],
    a.tail = a.tail || [],
    a.salt = Math.random(),
    a.challengeTypes = {
        HTML: "0",
        JS: "1",
        VIDEO: "2",
        ZIPLINE: "3",
        BASEJUMP: "4",
        BONFIRE: "5",
        HIKES: "6",
        STEP: "7"
    },
    a.arrayToNewLineString = function(e) {
        return e = Array.isArray(e) ? e : [e],
        e.reduce(function(e, n) {
            return "" + e + n + "\n"
        }, "")
    }
    ,
    a.seed = a.arrayToNewLineString(a.challengeSeed),
    a.replaceScriptTags = function(e) {
        return e.replace(/<script>/gi, "fccss").replace(/<\/script>/gi, "fcces")
    }
    ,
    a.replaceSafeTags = function(e) {
        return e.replace(/fccss/gi, "<script>").replace(/fcces/gi, "</script>")
    }
    ,
    a.replaceFormActionAttr = function(e) {
        return e.replace(/<form[^>]*>/, function(e) {
            return e.replace(/action(\s*?)=/, "fccfaa$1=")
        })
    }
    ,
    a.replaceFccfaaAttr = function(e) {
        return e.replace(/<form[^>]*>/, function(e) {
            return e.replace(/fccfaa(\s*?)=/, "action$1=")
        })
    }
    ,
    a.scopejQuery = function(e) {
        return e.replace(/\$/gi, "j$").replace(/document/gi, "jdocument").replace(/jQuery/gi, "jjQuery")
    }
    ,
    a.unScopeJQuery = function(e) {
        return e.replace(/j\$/gi, "$").replace(/jdocument/gi, "document").replace(/jjQuery/gi, "jQuery")
    }
    ;
    var l = /(\/\*[^(\*\/)]*\*\/)|([ \n]\/\/[^\n]*)/g;
    a.removeComments = function(e) {
        return e.replace(l, "")
    }
    ;
    var c = /(console\.[\w]+\s*\(.*\;)/g;
    a.removeLogs = function(e) {
        return e.replace(c, "")
    }
    ,
    a.reassembleTest = function() {
        var e = arguments.length <= 0 || void 0 === arguments[0] ? "" : arguments[0]
          , n = arguments[1]
          , t = n.line
          , o = n.text
          , r = new RegExp("//" + t + a.salt);
        return e.replace(r, o)
    }
    ,
    a.getScriptContent$ = function(e) {
        return o.create(function(n) {
            var o = $.get(e, null , null , "text").success(function(e) {
                n.onNext(e),
                n.onCompleted()
            }).fail(function(e) {
                return n.onError(e)
            }).always(function() {
                return n.onCompleted()
            });
            return new t(function() {
                o.abort()
            }
            )
        })
    }
    ;
    var s = /\<\s?script\s?\>/gi
      , u = /\<\s?\/\s?script\s?\>/gi;
    return a.hasJs = function(e) {
        return !!a.getJsFromHtml(e)
    }
    ,
    a.getJsFromHtml = function(e) {
        return (e.split(s)[1] || "").split(u)[0] || ""
    }
    ,
    a
}(window),
window.common = function(e) {
    var n = e.$
      , t = e.Rx.Observable
      , o = e.common
      , r = void 0 === o ? {
        init: []
    } : o;
    return r.ctrlEnterClickHandler = function i(e) {
        13 === e.keyCode && (e.metaKey || e.ctrlKey) && (n("#complete-courseware-dialog").off("keydown", i),
        n("#submit-challenge").length > 0 ? n("#submit-challenge").click() : window.location = "/challenges/next-challenge?id=" + r.challengeId)
    }
    ,
    r.init.push(function(e) {
        var n = e(".innerMarginFix");
        n.css("min-height", n.height()),
        r.submitBtn$ = t.fromEvent(e("#submitButton"), "click"),
        r.resetBtn$ = t.fromEvent(e("#reset-button"), "click"),
        e("#complete-courseware-dialog").on("shown.bs.modal", function() {
            e("#complete-courseware-dialog").keydown(r.ctrlEnterClickHandler)
        }),
        e("#complete-courseware-dialog").on("hidden.bs.modal", function() {
            e("#complete-courseware-dialog").off("keydown", r.ctrlEnterClickHandler)
        }),
        e(".challenge-list-checkbox").on("change", function() {
            var n = e(this).parent().parent().attr("id");
            e(this).is(":checked") && (e(this).parent().siblings().children().addClass("faded"),
            localStorage && localStorage[n] || (localStorage[n] = !0)),
            e(this).is(":checked") || (e(this).parent().siblings().children().removeClass("faded"),
            localStorage[n] && localStorage.removeItem(n))
        }),
        e(".checklist-element").each(function() {
            var n = e(this).attr("id");
            localStorage[n] && (e(this).children().children("li").addClass("faded"),
            e(this).children().children("input").trigger("click"))
        }),
        e("#next-courseware-button").on("click", function() {
            if (e("#next-courseware-button").unbind("click"),
            e(".signup-btn-nav").length < 1) {
                var n, t = e("#public-url").val() || null , o = e("#github-url").val() || null ;
                switch (r.challengeType) {
                case r.challengeTypes.VIDEO:
                    n = {
                        id: r.challengeId,
                        name: r.challengeName,
                        challengeType: +r.challengeType
                    },
                    e.ajax({
                        url: "/completed-challenge/",
                        type: "POST",
                        data: JSON.stringify(n),
                        contentType: "application/json",
                        dataType: "json"
                    }).success(function(e) {
                        e && (window.location.href = "/challenges/next-challenge?id=" + r.challengeId)
                    }).fail(function() {
                        window.location.replace(window.location.href)
                    });
                    break;
                case r.challengeTypes.BASEJUMP:
                case r.challengeTypes.ZIPLINE:
                    n = {
                        id: r.challengeId,
                        name: r.challengeName,
                        challengeType: +r.challengeType,
                        solution: t,
                        githubLink: o
                    },
                    e.ajax({
                        url: "/completed-zipline-or-basejump/",
                        type: "POST",
                        data: JSON.stringify(n),
                        contentType: "application/json",
                        dataType: "json"
                    }).success(function() {
                        window.location.href = "/challenges/next-challenge?id=" + r.challengeId
                    }).fail(function() {
                        window.location.replace(window.location.href)
                    });
                    break;
                case r.challengeTypes.BONFIRE:
                    window.location.href = "/challenges/next-challenge?id=" + r.challengeId;
                    break;
                default:
                    console.log("Happy Coding!")
                }
            }
        }),
        r.challengeName && window.ga("send", "event", "Challenge", "load", r.gaName),
        e("#complete-courseware-dialog").on("hidden.bs.modal", function() {
            r.editor.focus && r.editor.focus()
        }),
        e("#trigger-issue-modal").on("click", function() {
            e("#issue-modal").modal("show")
        }),
        e("#trigger-help-modal").on("click", function() {
            e("#help-modal").modal("show")
        }),
        e("#trigger-reset-modal").on("click", function() {
            e("#reset-modal").modal("show")
        }),
        e("#trigger-pair-modal").on("click", function() {
            e("#pair-modal").modal("show")
        }),
        e("#completed-courseware").on("click", function() {
            e("#complete-courseware-dialog").modal("show")
        }),
        e("#help-ive-found-a-bug-wiki-article").on("click", function() {
            window.open("https://github.com/freecodecampchina/freecodecamp.cn/wiki/Help-I've-Found-a-Bug", "_blank")
        }),
        e("#search-issue").on("click", function() {
            var e = window.location.href.toString().split("?")[0].replace(/(#*)$/, "");
            window.open("https://github.com/freecodecampchina/freecodecamp.cn/issues?q=is:issue is:all " + r.challengeName + " OR " + e.substr(e.lastIndexOf("challenges/") + 11).replace("/", ""), "_blank")
        })
    }),
    r
}(window),
window.common = function(e) {
    var n, t = e.localStorage, o = e.common, r = void 0 === o ? {
        init: []
    } : o, i = ["Bonfire: ", "Waypoint: ", "Zipline: ", "Basejump: ", "Checkpoint: "], a = {
        getStoredValue: function(e) {
            if (!t || "function" != typeof t.getItem || !e || "string" != typeof e)
                return console.log("unable to read from storage"),
                "";
            if (t.getItem(e + "Val"))
                return "" + t.getItem(e + "Val");
            for (var o = 0; o <= i.length; o++)
                if (n = t.getItem(i[o] + e + "Val"))
                    return "" + n;
            return null
        },
        isAlive: function(e) {
            var n = this.getStoredValue(e);
            return "null" !== n && "undefined" !== n && n && n.length > 0
        },
        updateStorage: function(e, n) {
            return t && "function" == typeof t.setItem && e && "string" == typeof e ? (t.setItem(e + "Val", n),
            n) : (console.log("unable to save to storage"),
            n)
        }
    };
    return r.codeStorage = a,
    r
}(window, window.common),
window.common = function(e) {
    function n(e) {
        return s(d(e))
    }
    function t(e) {
        return u(p(e))
    }
    var o = e.encodeURIComponent
      , r = e.decodeURIComponent
      , i = e.location
      , a = e.history
      , l = e.common
      , c = void 0 === l ? {
        init: []
    } : l
      , s = c.replaceScriptTags
      , u = c.replaceSafeTags
      , d = c.replaceFormActionAttr
      , p = c.replaceFccfaaAttr
      , h = /^(\?|#\?)/
      , f = {
        encode: function(e) {
            return o(e)
        },
        decode: function(e) {
            try {
                return r(e)
            } catch (n) {
                return null
            }
        },
        isInQuery: function(e) {
            var n = f.decode(e);
            return n && "function" == typeof n.split ? n.replace(h, "").split("&").reduce(function(e, n) {
                var t = n.split("=")[0];
                return "solution" === t ? !0 : e
            }, !1) : !1
        },
        isAlive: function() {
            return f.enabled && f.isInQuery(i.search) || f.isInQuery(i.hash)
        },
        getKeyInQuery: function(e) {
            var n = arguments.length <= 1 || void 0 === arguments[1] ? "" : arguments[1];
            return e.split("&").reduce(function(e, t) {
                var o = t.split("=")[0]
                  , r = t.split("=").slice(1).join("=");
                return o === n ? r : e
            }, null )
        },
        getSolutionFromQuery: function() {
            var e = arguments.length <= 0 || void 0 === arguments[0] ? "" : arguments[0];
            return t(f.decode(f.getKeyInQuery(e, "solution")))
        },
        parse: function() {
            if (!f.enabled)
                return null ;
            var e;
            return i.search && f.isInQuery(i.search) ? (e = i.search.replace(/^\?/, ""),
            a && "function" == typeof a.replaceState && (a.replaceState(a.state, null , i.href.split("?")[0]),
            i.hash = "#?" + n(e))) : e = i.hash.replace(/^\#\?/, ""),
            e ? this.getSolutionFromQuery(e) : null
        },
        querify: function(e) {
            if (!f.enabled)
                return null ;
            if (a && "function" == typeof a.replaceState) {
                var t = i.href.split("?")[0].replace(/(#*)$/, "");
                a.replaceState(a.state, null , t + "#?" + (f.shouldRun() ? "" : "run=disabled&") + "solution=" + f.encode(n(e)))
            } else
                i.hash = "?solution=" + f.encode(n(e));
            return e
        },
        enabled: !0,
        shouldRun: function() {
            return !this.getKeyInQuery((i.search || i.hash).replace(h, ""), "run")
        }
    };
    return c.init.push(function() {
        f.parse()
    }),
    c.codeUri = f,
    c.shouldRun = function() {
        return f.shouldRun()
    }
    ,
    c
}(window),
window.common = function(e) {
    var n = e.loopProtect
      , t = e.common
      , o = void 0 === t ? {
        init: []
    } : t;
    return n.hit = function(e) {
        var n = "Error: Exiting potential infinite loop at line " + e + ". To disable loop protection, write: \n\\/\\/ noprotect\nas the firstline. Beware that if you do have an infinite loop in your codethis will crash your browser.";
        console.error(n)
    }
    ,
    o.addLoopProtect = function() {
        var e = arguments.length <= 0 || void 0 === arguments[0] ? "" : arguments[0];
        return n(e)
    }
    ,
    o
}(window),
window.common = function(e) {
    var n = e.common
      , t = void 0 === n ? {
        init: []
    } : n
      , o = e.document;
    return t.getIframe = function() {
        var e = arguments.length <= 0 || void 0 === arguments[0] ? "preview" : arguments[0]
          , n = o.getElementById(e);
        return n || (n = o.createElement("iframe"),
        n.id = e,
        n.setAttribute("style", "display: none"),
        o.body.appendChild(n)),
        n.contentDocument || n.contentWindow.document
    }
    ,
    t
}(window),
window.common = function(e) {
    var n = e.Rx
      , t = n.BehaviorSubject
      , o = n.Observable
      , r = e.common
      , i = void 0 === r ? {
        init: []
    } : r
      , a = "\n<script>\n  window.loopProtect = parent.loopProtect;\n  window.__err = null;\n  window.loopProtect.hit = function(line) {\n    window.__err = new Error(\n      'Potential infinite loop at line ' +\n      line +\n      '. To disable loop protection, write:' +\n      ' \\n\\/\\/ noprotect\\nas the first' +\n      ' line. Beware that if you do have an infinite loop in your code' +\n      ' this will crash your browser.'\n    );\n  };\n</script>\n<link\n  rel='stylesheet'\n  href='//cdn.bootcss.com/animate.css/3.2.0/animate.min.css'\n  />\n<link\n  rel='stylesheet'\n  href='//cdn.bootcss.com/bootstrap/3.3.1/css/bootstrap.min.css'\n  />\n\n<link\n  rel='stylesheet'\n  href='//cdn.bootcss.com/font-awesome/4.2.0/css/font-awesome.min.css'\n  />\n<style>\n  body { padding: 0px 3px 0px 3px; }\n</style>\n  "
      , l = "\n    <script>\n      window.__err = new Error('code has been disabled');\n    </script>\n  "
      , c = i.getScriptContent$("/js/iFrameScripts-08bc15b460.js").shareReplay()
      , s = i.getScriptContent$("/bower_components/jquery/dist/jquery.js").shareReplay();
    return i.previewReady$ = new t(!1),
    i.runPreviewTests$ = i.checkPreview$ = function() {
        return o["throw"](new Error("Preview not fully loaded"))
    }
    ,
    i.updatePreview$ = function() {
        var e = arguments.length <= 0 || void 0 === arguments[0] ? "" : arguments[0]
          , n = i.getIframe("preview");
        return o.combineLatest(c, s, function(e, n) {
            return {
                iframeScript: "<script>" + e + "</script>",
                jQuery: "<script>" + n + "</script>"
            }
        }).first().flatMap(function(t) {
            var o = t.iframeScript
              , r = t.jQuery;
            return i.previewReady$.onNext(!1),
            n.open(),
            n.write(a + r + (i.shouldRun() ? e : l) + "<!-- -->" + o),
            n.close(),
            i.previewReady$.filter(function(e) {
                return e
            }).first().delay(400)
        }).map(function() {
            return e
        })
    }
    ,
    i
}(window),
window.common = function(e) {
    var n = e.Rx
      , t = n.Subject
      , o = n.Observable
      , r = e.CodeMirror
      , i = e.emmetCodeMirror
      , a = e.common
      , l = void 0 === a ? {
        init: []
    } : a
      , c = l.challengeType
      , s = void 0 === c ? "0" : c
      , u = l.challengeTypes;
    if (!r || s === u.BASEJUMP || s === u.ZIPLINE || s === u.VIDEO || s === u.STEP || s === u.HIKES)
        return l.editor = {},
        l;
    var d = r.fromTextArea(document.getElementById("codeEditor"), {
        lint: !0,
        lineNumbers: !0,
        mode: "javascript",
        theme: "monokai",
        runnable: !0,
        matchBrackets: !0,
        autoCloseBrackets: !0,
        scrollbarStyle: "null",
        lineWrapping: !0,
        gutters: ["CodeMirror-lint-markers"]
    });
    d.setSize("100%", "auto"),
    l.editorExecute$ = new t,
    l.editorKeyUp$ = o.fromEventPattern(function(e) {
        return d.on("keyup", e)
    }, function(e) {
        return d.off("keyup", e)
    }),
    d.setOption("extraKeys", {
        Tab: function(e) {
            if (e.somethingSelected())
                e.indentSelection("add");
            else {
                var n = Array(e.getOption("indentUnit") + 1).join(" ");
                e.replaceSelection(n)
            }
        },
        "Shift-Tab": function(e) {
            if (e.somethingSelected())
                e.indentSelection("subtract");
            else {
                var n = Array(e.getOption("indentUnit") + 1).join(" ");
                e.replaceSelection(n)
            }
        },
        "Ctrl-Enter": function() {
            return l.editorExecute$.onNext(),
            !1
        },
        "Cmd-Enter": function() {
            return l.editorExecute$.onNext(),
            !1
        }
    });
    var p = d.getScrollInfo()
      , h = d.charCoords({
        line: d.getCursor().line + 1,
        ch: 0
    }, "local").top;
    return p.top + p.clientHeight < h && d.scrollTo(null , h - p.clientHeight + 3),
    i && i(d, {
        "Cmd-E": "emmet.expand_abbreviation",
        Tab: "emmet.expand_abbreviation_with_tab",
        Enter: "emmet.insert_formatted_line_break_only"
    }),
    l.init.push(function() {
        var e = void 0;
        e = l.codeUri.isAlive() ? l.codeUri.parse() : l.codeStorage.isAlive(l.challengeName) ? l.codeStorage.getStoredValue(l.challengeName) : l.seed,
        d.setValue(l.replaceSafeTags(e)),
        d.refresh()
    }),
    l.editor = d,
    l
}(window),
window.common = function(e) {
    var n = e.Rx.Observable
      , t = e.common
      , o = void 0 === t ? {
        init: []
    } : t
      , r = /function\s*?\(|function\s+\w+\s*?\(/gi
      , i = /\$\s*?\(\s*?\$\s*?\)/gi
      , a = /if\s\(null\)\sconsole\.log\(1\);/gi;
    return o.detectUnsafeCode$ = function(e) {
        var t = e.match(/\/\*/gi)
          , o = e.match(/\*\//gi);
        return t && (!o || t.length > o.length) ? n["throw"](new Error("SyntaxError: Unfinished multi-line comment")) : e.match(i) ? n["throw"](new Error("Unsafe $($)")) : e.match(/function/g) && !e.match(r) ? n["throw"](new Error("SyntaxError: Unsafe or unfinished function declaration")) : e.match(a) ? n["throw"](new Error("Invalid if (null) console.log(1); detected")) : n.just(e)
    }
    ,
    o
}(window),
window.common = function(e) {
    var n = e.$
      , t = e.common
      , o = void 0 === t ? {
        init: []
    } : t;
    return o.displayTestResults = function() {
        var e = arguments.length <= 0 || void 0 === arguments[0] ? [] : arguments[0];
        return n("#testSuite").children().remove(),
        e.forEach(function(e) {
            var t = e.err
              , o = void 0 === t ? !1 : t
              , r = e.text
              , i = void 0 === r ? "" : r
              , a = o ? '"ion-close-circled big-error-icon"' : '"ion-checkmark-circled big-success-icon"';
            n("<div></div>").html("\n        <div class='row'>\n          <div class='col-xs-2 text-center'>\n            <i class=" + a + "></i>\n          </div>\n          <div class='col-xs-10 test-output'>\n            " + i.split("message: ").pop().replace(/\'\);/g, "") + "\n          </div>\n          <div class='ten-pixel-break'/>\n        </div>\n      ").appendTo(n("#testSuite"))
        }),
        e
    }
    ,
    o
}(window),
window.common = function(e) {
    var n = e.ga
      , t = e.common
      , o = void 0 === t ? {
        init: []
    } : t
      , r = o.addLoopProtect
      , i = o.getJsFromHtml
      , a = o.detectUnsafeCode$
      , l = o.updatePreview$
      , c = o.challengeType
      , s = o.challengeTypes;
    return o.executeChallenge$ = function() {
        var e = o.editor.getValue()
          , t = e
          , u = o.arrayToNewLineString(o.head)
          , d = o.arrayToNewLineString(o.tail)
          , p = u + e + d;
        return n("send", "event", "Challenge", "ran-code", o.gaName),
        a(e).map(function() {
            return c !== s.HTML ? "<script>;" + r(p) + "/**/</script>" : r(p)
        }).flatMap(function(e) {
            return l(e)
        }).flatMap(function(e) {
            var n = void 0;
            return c === s.HTML && o.hasJs(e) ? n = o.getJsOutput(i(e)) : c !== s.HTML && (n = o.getJsOutput(r(p))),
            o.runPreviewTests$({
                tests: o.tests.slice(),
                originalCode: t,
                output: n
            })
        })
    }
    ,
    o
}(window),
window.common = function(e) {
    var n = e.CodeMirror
      , t = e.document
      , o = e.common
      , r = void 0 === o ? {
        init: []
    } : o
      , i = r.challengeTypes
      , a = r.challengeType
      , l = void 0 === a ? "0" : a;
    if (!n || l !== i.JS && l !== i.BONFIRE)
        return r.updateOutputDisplay = function() {}
        ,
        r.appendToOutputDisplay = function() {}
        ,
        r;
    var c = n.fromTextArea(t.getElementById("codeOutput"), {
        lineNumbers: !1,
        mode: "text",
        theme: "monokai",
        readOnly: "nocursor",
        lineWrapping: !0
    });
    return c.setValue("/**\n  * Your output will go here.\n  * Any console.log() -type\n  * statements will appear in\n  * your browser's DevTools\n  * JavaScript console.\n  */"),
    c.setSize("100%", "100%"),
    r.updateOutputDisplay = function() {
        var e = arguments.length <= 0 || void 0 === arguments[0] ? "" : arguments[0];
        return "string" != typeof e && (e = JSON.stringify(e)),
        c.setValue(e),
        e
    }
    ,
    r.appendToOutputDisplay = function() {
        var e = arguments.length <= 0 || void 0 === arguments[0] ? "" : arguments[0];
        return c.setValue(c.getValue() + e),
        e
    }
    ,
    r
}(window),
window.common = function(e) {
    var n = e.common
      , t = void 0 === n ? {
        init: []
    } : n;
    return t.lockTop = function() {
        var e;
        $(window).width() >= 990 ? ($(".editorScrollDiv").html() && (e = $(window).height() - $(".navbar").height(),
        0 > e && (e = 0),
        $(".editorScrollDiv").css("height", e - 50 + "px")),
        e = $(window).height() - $(".navbar").height(),
        0 > e && (e = 0),
        $(".scroll-locker").css("min-height", $(".editorScrollDiv").height()).css("height", e - 50)) : ($(".editorScrollDiv").css("max-height", "500px"),
        $(".scroll-locker").css("position", "inherit").css("top", "inherit").css("width", "100%").css("max-height", "100%"))
    }
    ,
    t.init.push(function(e) {
        if (e(".iphone-position").html() || e(".iphone").html()) {
            var n = parseInt(e(".iphone-position").css("top").replace("px", ""), 10)
              , o = parseInt(e(".iphone").css("top").replace("px", ""), 10);
            e(window).on("scroll", function() {
                var t = e(".courseware-height").height()
                  , r = e(".courseware-height").offset().top
                  , i = e(window).scrollTop()
                  , a = e(".iphone-position").height();
                0 >= t + r - i - a ? (e(".iphone-position").css("top", n + t + r - i - a),
                e(".iphone").css("top", n + t + r - i - a + 120)) : (e(".iphone-position").css("top", n),
                e(".iphone").css("top", o))
            })
        }
        if (e(".scroll-locker").html()) {
            e(".scroll-locker").html() && (t.lockTop(),
            e(window).on("resize", function() {
                t.lockTop()
            }),
            e(window).on("scroll", function() {
                t.lockTop()
            }));
            var r = !1;
            document.getElementById("scroll-locker").addEventListener("previewUpdateSpy", function(n) {
                return r ? null : (r = !0,
                setTimeout(function() {
                    if (e(e(".scroll-locker").children()[0]).height() - 800 > n.detail)
                        e(".scroll-locker").scrollTop(n.detail);
                    else {
                        var t = e(e(".scroll-locker").children()[0]).height();
                        e(".scroll-locker").animate({
                            scrollTop: t
                        }, 175)
                    }
                    r = !1
                }, 750))
            }, !1)
        }
    }),
    t
}(window),
window.common = function(e) {
    var n = e.common
      , t = void 0 === n ? {
        init: []
    } : n;
    return t.init.push(function(e) {
        e("#report-issue").on("click", function() {
            var n = ["Challenge [", t.challengeName || window.location.pathname, "](", window.location.href, ") has an issue.\n", "User Agent is: <code>", navigator.userAgent, "</code>.\n", "Please describe how to reproduce this issue, and include ", "links to screenshots if possible.\n\n"].join("");
            if (t.editor && "function" == typeof t.editor.getValue && t.editor.getValue().trim()) {
                var o;
                switch (t.challengeType) {
                case t.challengeTypes.HTML:
                    o = "html";
                    break;
                case t.challengeTypes.JS:
                case t.challengeTypes.BONFIRE:
                    o = "javascript";
                    break;
                default:
                    o = ""
                }
                n += ["My code:\n```", o, "\n", t.editor.getValue(), "\n```\n\n"].join("")
            }
            n = encodeURIComponent(n),
            e("#issue-modal").modal("hide"),
            window.open("https://github.com/freecodecampchina/freecodecamp.cn/issues/new?&body=" + n, "_blank")
        })
    }),
    t
}(window);
var _extends = Object.assign || function(e) {
    for (var n = 1; n < arguments.length; n++) {
        var t = arguments[n];
        for (var o in t)
            Object.prototype.hasOwnProperty.call(t, o) && (e[o] = t[o])
    }
    return e
}
;
window.common = function(global) {
    var Observable = global.Rx.Observable
      , chai = global.chai
      , _global$common = global.common
      , common = void 0 === _global$common ? {
        init: []
    } : _global$common;
    return common.runTests$ = function runTests$(_ref) {
        var code = _ref.code
          , originalCode = _ref.originalCode
          , userTests = _ref.userTests
          , rest = _objectWithoutProperties(_ref, ["code", "originalCode", "userTests"]);
        return Observable.from(userTests).map(function(test) {
            var assert = chai.assert
              , editor = {
                getValue: function() {
                    return originalCode
                }
            };
            try {
                test && eval(common.reassembleTest(code, test))
            } catch (e) {
                test.err = e.message
            }
            return test
        }).toArray().map(function(e) {
            return _extends({}, rest, {
                tests: e
            })
        })
    }
    ,
    common
}(window),
window.common = function(e) {
    function n(e) {
        e.preventDefault();
        var n = l.editor.getValue();
        t("#submit-challenge").attr("disabled", "true").removeClass("btn-primary").addClass("btn-warning disabled");
        var r = t("#checkmark-container");
        r.css({
            height: r.innerHeight()
        }),
        t("#challenge-checkmark").addClass("zoomOutUp").delay(1e3).queue(function(e) {
            t(this).replaceWith('<div id="challenge-spinner" class="animated zoomInUp inner-circles-loader">submitting...</div>'),
            e()
        });
        var i = "UTC";
        try {
            i = o.tz.guess()
        } catch (a) {
            a.message = "\n          known bug, see: https://github.com/moment/moment-timezone/issues/294:\n          " + a.message + "\n        ",
            console.error(a)
        }
        var c = JSON.stringify({
            id: l.challengeId,
            name: l.challengeName,
            challengeType: +l.challengeType,
            solution: n,
            timezone: i
        });
        t.ajax({
            url: "/completed-challenge/",
            type: "POST",
            data: c,
            contentType: "application/json",
            dataType: "json"
        }).success(function(e) {
            e && (window.location = "/challenges/next-challenge?id=" + l.challengeId)
        }).fail(function() {
            window.location.replace(window.location.href)
        })
    }
    var t = e.$
      , o = e.moment
      , r = e.ga
      , i = void 0 === r ? function() {}
    : r
      , a = e.common
      , l = void 0 === a ? {
        init: []
    } : a;
    return l.showCompletion = function() {
        i("send", "event", "Challenge", "solved", l.gaName, !0),
        t("#complete-courseware-dialog").modal("show"),
        t("#complete-courseware-dialog .modal-header").click(),
        t("#submit-challenge").off("click"),
        t("#submit-challenge").on("click", n)
    }
    ,
    l
}(window),
window.common = function(e) {
    function n(e) {
        var n = !1
          , t = 0;
        return e.each(function(e) {
            var n = c(this);
            n.hasClass("hidden") || (t = e - 1)
        }),
        n = e[t]
    }
    function t(e) {
        var n = e.length
          , t = !1
          , o = 0;
        return e.each(function(e) {
            var t = c(this);
            t.hasClass("hidden") || e + 1 === n || (o = e + 1)
        }),
        t = e[o]
    }
    function o(e) {
        e.preventDefault();
        var t = n(c(d));
        c(this).parent().parent().removeClass("slideInLeft slideInRight").addClass("animated fadeOutRight fast-animation").delay(250).queue(function(e) {
            c(this).addClass("hidden"),
            t && c(t).removeClass("hidden").removeClass("fadeOutLeft fadeOutRight").addClass("animated slideInLeft fast-animation").delay(500).queue(function(e) {
                e()
            }),
            e()
        })
    }
    function r(e) {
        e.preventDefault();
        var n = t(c(d));
        c(this).parent().parent().removeClass("slideInRight slideInLeft").addClass("animated fadeOutLeft fast-animation").delay(250).queue(function(e) {
            c(this).addClass("hidden"),
            n && c(n).removeClass("hidden").removeClass("fadeOutRight fadeOutLeft").addClass("animated slideInRight fast-animation").delay(500).queue(function(e) {
                e()
            }),
            e()
        })
    }
    function i(e) {
        var n = u.challengeSeed[0] || {
            stepIndex: []
        }
          , t = c(this)
          , o = +t.attr("id")
          , r = n.stepIndex.indexOf(o);
        if (-1 === r)
            return t.parent().find(".disabled").removeClass("disabled");
        e.preventDefault();
        var i = n.properties[r]
          , a = n.apis[r];
        return u[i] ? t.parent().find(".disabled").removeClass("disabled") : c.post(a).done(function(e) {
            return "boolean" == typeof e ? t.parent().find(".disabled").removeClass("disabled") : t.parent().find(".disabled").replaceWith("<p>" + e + "</p>")
        }).fail(function() {
            console.log("failed")
        })
    }
    function a(e) {
        e.preventDefault(),
        c(w).modal("show"),
        c(w + ".modal-header").click(),
        c(g).click(l)
    }
    function l(e) {
        e.preventDefault(),
        c("#submit-challenge").attr("disabled", "true").removeClass("btn-primary").addClass("btn-warning disabled");
        var n = c("#checkmark-container");
        n.css({
            height: n.innerHeight()
        }),
        c("#challenge-checkmark").addClass("zoomOutUp").delay(1e3).queue(function(e) {
            c(this).replaceWith('<div id="challenge-spinner" class="animated zoomInUp inner-circles-loader">submitting...</div>'),
            e()
        }),
        c.ajax({
            url: "/completed-challenge/",
            type: "POST",
            data: JSON.stringify({
                id: u.challengeId,
                name: u.challengeName,
                challengeType: +u.challengeType
            }),
            contentType: "application/json",
            dataType: "json"
        }).success(function(e) {
            e && (window.location = "/challenges/next-challenge?id=" + u.challengeId)
        }).fail(function() {
            window.location.replace(window.location.href)
        })
    }
    var c = e.$
      , s = e.common
      , u = void 0 === s ? {
        init: []
    } : s
      , d = ".challenge-step"
      , p = ".challenge-step-btn-prev"
      , h = ".challenge-step-btn-next"
      , f = ".challenge-step-btn-action"
      , m = ".challenge-step-btn-finish"
      , g = "#challenge-step-btn-submit"
      , w = "#challenge-step-modal";
    return u.init.push(function(e) {
        return "7" !== u.challengeType ? null : (e(p).click(o),
        e(h).click(r),
        e(f).click(i),
        e(m).click(a),
        null )
    }),
    u
}(window);
var _extends = Object.assign || function(e) {
    for (var n = 1; n < arguments.length; n++) {
        var t = arguments[n];
        for (var o in t)
            Object.prototype.hasOwnProperty.call(t, o) && (e[o] = t[o])
    }
    return e
}
;
$(document).ready(function() {
    var e = window.common
      , n = window.Rx.Observable
      , t = e.addLoopProtect
      , o = e.challengeName
      , r = e.challengeType
      , i = e.challengeTypes;
    if (e.init.forEach(function(e) {
        e($)
    }),
    e.editor.getValue) {
        var a = e.editorKeyUp$.debounce(750).map(function() {
            return e.editor.getValue()
        }).distinctUntilChanged().shareReplay();
        a.subscribe(function(n) {
            e.codeStorage.updateStorage(e.challengeName, n),
            e.codeUri.querify(n)
        }, function(e) {
            return console.error(e)
        }),
        a.filter(function() {
            return e.challengeType === i.HTML
        }).flatMap(function(o) {
            return e.detectUnsafeCode$(o).map(function() {
                var n = e.head + o + e.tail;
                return t(n)
            }).flatMap(function(n) {
                return e.updatePreview$(n)
            }).flatMap(function() {
                return e.checkPreview$({
                    code: o
                })
            })["catch"](function(e) {
                return n.just({
                    err: e
                })
            })
        }).subscribe(function(n) {
            var t = n.err;
            return t ? (console.error(t),
            e.updatePreview$("\n              <h1>" + t + "</h1>\n            ").subscribe(function() {})) : null
        }, function(e) {
            return console.error(e)
        })
    }
    if (e.resetBtn$.doOnNext(function() {
        e.editor.setValue(e.replaceSafeTags(e.seed))
    }).flatMap(function() {
        return e.executeChallenge$()["catch"](function(e) {
            return n.just({
                err: e
            })
        })
    }).subscribe(function(n) {
        var t = n.err
          , r = n.output
          , i = n.originalCode;
        return t ? (console.error(t),
        e.updateOutputDisplay("" + t)) : (e.codeStorage.updateStorage(o, i),
        e.codeUri.querify(i),
        e.updateOutputDisplay(r),
        null )
    }, function(n) {
        n && console.error(n),
        e.updateOutputDisplay("" + n)
    }),
    n.merge(e.editorExecute$, e.submitBtn$).flatMap(function() {
        return e.appendToOutputDisplay("\n// testing challenge..."),
        e.executeChallenge$().map(function(e) {
            var n = e.tests
              , t = _objectWithoutProperties(e, ["tests"])
              , o = n.every(function(e) {
                return !e.err
            });
            return _extends({}, t, {
                tests: n,
                solved: o
            })
        })["catch"](function(e) {
            return n.just({
                err: e
            })
        })
    }).subscribe(function(n) {
        var t = n.err
          , o = n.solved
          , r = n.output
          , i = n.tests;
        return t ? (console.error(t),
        e.challengeType === e.challengeTypes.HTML ? e.updatePreview$("\n              <h1>" + t + "</h1>\n            ").first().subscribe(function() {}) : e.updateOutputDisplay("" + t)) : (e.updateOutputDisplay(r),
        e.displayTestResults(i),
        o && e.showCompletion(),
        null )
    }, function(n) {
        var t = n.err;
        console.error(t),
        e.updateOutputDisplay("" + t)
    }),
    r === i.HTML) {
        var l = $("#preview");
        return n.fromCallback(l.ready, l)().delay(500).flatMap(function() {
            return e.executeChallenge$()
        })["catch"](function(e) {
            return n.just({
                err: e
            })
        }).subscribe(function(n) {
            var t = n.err
              , o = n.tests;
            return t ? (console.error(t),
            e.challengeType === e.challengeTypes.HTML ? e.updatePreview$("\n                <h1>" + t + "</h1>\n              ").subscribe(function() {}) : e.updateOutputDisplay("" + t)) : (e.displayTestResults(o),
            null )
        }, function(e) {
            var n = e.err;
            console.error(n)
        })
    }
    return r === i.BONFIRE || r === i.JS ? n.just({}).delay(500).flatMap(function() {
        return e.executeChallenge$()
    })["catch"](function(e) {
        return n.just({
            err: e
        })
    }).subscribe(function(n) {
        var t = n.err
          , r = n.originalCode
          , i = n.tests;
        return t ? (console.error(t),
        e.updateOutputDisplay("" + t)) : (e.codeStorage.updateStorage(o, r),
        e.displayTestResults(i),
        null )
    }, function(n) {
        console.error(n),
        e.updateOutputDisplay("" + n)
    }) : null
});
