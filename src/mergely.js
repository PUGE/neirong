!
function(t, e) {
  "object" == typeof exports && "object" == typeof module ? module.exports = e(require("jQuery"), require("CodeMirror")) : "function" == typeof define && define.amd ? define("mergely", ["jQuery", "CodeMirror"], e) : "object" == typeof exports ? exports.mergely = e(require("jQuery"), require("CodeMirror")) : t.mergely = e(t.jQuery, t.CodeMirror)
} (window, (function(t, e) {
  return function(t) {
    var e = {};
    function i(s) {
      if (e[s]) return e[s].exports;
      var r = e[s] = {
        i: s,
        l: !1,
        exports: {}
      };
      return t[s].call(r.exports, r, r.exports, i),
      r.l = !0,
      r.exports
    }
    return i.m = t,
    i.c = e,
    i.d = function(t, e, s) {
      i.o(t, e) || Object.defineProperty(t, e, {
        enumerable: !0,
        get: s
      })
    },
    i.r = function(t) {
      "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(t, Symbol.toStringTag, {
        value: "Module"
      }),
      Object.defineProperty(t, "__esModule", {
        value: !0
      })
    },
    i.t = function(t, e) {
      if (1 & e && (t = i(t)), 8 & e) return t;
      if (4 & e && "object" == typeof t && t && t.__esModule) return t;
      var s = Object.create(null);
      if (i.r(s), Object.defineProperty(s, "default", {
        enumerable: !0,
        value: t
      }), 2 & e && "string" != typeof t) for (var r in t) i.d(s, r,
      function(e) {
        return t[e]
      }.bind(null, r));
      return s
    },
    i.n = function(t) {
      var e = t && t.__esModule ?
      function() {
        return t.
      default
      }:
      function() {
        return t
      };
      return i.d(e, "a", e),
      e
    },
    i.o = function(t, e) {
      return Object.prototype.hasOwnProperty.call(t, e)
    },
    i.p = "",
    i(i.s = 0)
  } ([function(t, e, i) {
    "use strict"; !
    function(t, e) {
      var s = {};
      s.ChangeExpression = new RegExp(/(^(?![><\-])*\d+(?:,\d+)?)([acd])(\d+(?:,\d+)?)/);
      var r = i(1);
      s.DiffParser = function(t) {
        for (var e = [], i = 0, r = t.split(/\n/), n = 0; n < r.length; ++n) if (0 != r[n].length) {
          var h = {},
          o = s.ChangeExpression.exec(r[n]);
          if (null != o) {
            var l = o[1].split(",");
            h["lhs-line-from"] = l[0] - 1,
            1 == l.length ? h["lhs-line-to"] = l[0] - 1 : h["lhs-line-to"] = l[1] - 1;
            var a = o[3].split(",");
            h["rhs-line-from"] = a[0] - 1,
            1 == a.length ? h["rhs-line-to"] = a[0] - 1 : h["rhs-line-to"] = a[1] - 1,
            h.op = o[2],
            e[i++] = h
          }
        }
        return e
      },
      s.sizeOf = function(t) {
        var e, i = 0;
        for (e in t) t.hasOwnProperty(e) && i++;
        return i
      },
      s.LCS = function(t, e, i) {
        this.x = t && t.replace(/[ ]{1}/g, "\n") || "",
        this.y = e && e.replace(/[ ]{1}/g, "\n") || "",
        this.options = i
      },
      t.extend(s.LCS.prototype, {
        clear: function() {
          this.ready = 0
        },
        diff: function(t, e) {
          for (var i = new s.diff(this.x, this.y, {
            ignorews: !1,
            ignoreaccents: !!this.options.ignoreaccents
          }), r = s.DiffParser(i.normal_form()), n = 0, h = 0, o = 0; o < r.length; ++o) {
            var l = r[o];
            if ("a" != l.op) {
              n = i.getLines("lhs").slice(0, l["lhs-line-from"]).join(" ").length,
              h = l["lhs-line-to"] + 1;
              var a = i.getLines("lhs").slice(l["lhs-line-from"], h).join(" ");
              "d" == l.op ? a += " ": n > 0 && "c" == l.op && (n += 1),
              e(n, n + a.length)
            }
            if ("d" != l.op) {
              n = i.getLines("rhs").slice(0, l["rhs-line-from"]).join(" ").length,
              h = l["rhs-line-to"] + 1;
              var c = i.getLines("rhs").slice(l["rhs-line-from"], h).join(" ");
              "a" == l.op ? c += " ": n > 0 && "c" == l.op && (n += 1),
              t(n, n + c.length)
            }
          }
        }
      }),
      s.CodeifyText = function(e) {
        this._max_code = 0,
        this._diff_codes = {},
        this.ctxs = {},
        t.extend(this, e),
        this.lhs = e.lhs.split("\n"),
        this.rhs = e.rhs.split("\n")
      },
      t.extend(s.CodeifyText.prototype, {
        getCodes: function(t) {
          if (!this.ctxs.hasOwnProperty(t)) {
            var e = this._diff_ctx(this[t]);
            this.ctxs[t] = e,
            e.codes.length = Object.keys(e.codes).length
          }
          return this.ctxs[t].codes
        },
        getLines: function(t) {
          return this.ctxs[t].lines
        },
        _diff_ctx: function(t) {
          var e = {
            i: 0,
            codes: {},
            lines: t
          };
          return this._codeify(t, e),
          e
        },
        _codeify: function(t, e) {
          this._max_code;
          for (var i = 0; i < t.length; ++i) {
            var s = t[i];
            this.options.ignorews && (s = s.replace(/\s+/g, "")),
            this.options.ignorecase && (s = s.toLowerCase()),
            this.options.ignoreaccents && (s = s.normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
            var r = this._diff_codes[s];
            null != r ? e.codes[i] = r: (this._max_code++, this._diff_codes[s] = this._max_code, e.codes[i] = this._max_code)
          }
        }
      }),
      s.diff = function(e, i, r) {
        var n = t.extend({
          ignorews: !1,
          ignoreaccents: !1
        },
        r);
        this.codeify = new s.CodeifyText({
          lhs: e,
          rhs: i,
          options: n
        });
        var h = {
          codes: this.codeify.getCodes("lhs"),
          modified: {}
        },
        o = {
          codes: this.codeify.getCodes("rhs"),
          modified: {}
        };
        h.codes.length,
        o.codes.length;
        this._lcs(h, 0, h.codes.length, o, 0, o.codes.length, [], []),
        this._optimize(h),
        this._optimize(o),
        this.items = this._create_diffs(h, o)
      },
      t.extend(s.diff.prototype, {
        changes: function() {
          return this.items
        },
        getLines: function(t) {
          return this.codeify.getLines(t)
        },
        normal_form: function() {
          for (var t = "",
          e = 0; e < this.items.length; ++e) {
            var i = this.items[e],
            s = "c";
            0 == i.lhs_deleted_count && i.rhs_inserted_count > 0 ? s = "a": i.lhs_deleted_count > 0 && 0 == i.rhs_inserted_count && (s = "d"),
            t += (1 == i.lhs_deleted_count ? i.lhs_start + 1 : 0 == i.lhs_deleted_count ? i.lhs_start: i.lhs_start + 1 + "," + (i.lhs_start + i.lhs_deleted_count)) + s + (1 == i.rhs_inserted_count ? i.rhs_start + 1 : 0 == i.rhs_inserted_count ? i.rhs_start: i.rhs_start + 1 + "," + (i.rhs_start + i.rhs_inserted_count)) + "\n";
            var r = this.getLines("lhs"),
            n = this.getLines("rhs");
            if (n && r) {
              var h;
              for (h = i.lhs_start; h < i.lhs_start + i.lhs_deleted_count; ++h) t += "< " + r[h] + "\n";
              for (i.rhs_inserted_count && i.lhs_deleted_count && (t += "---\n"), h = i.rhs_start; h < i.rhs_start + i.rhs_inserted_count; ++h) t += "> " + n[h] + "\n"
            }
          }
          return t
        },
        _lcs: function(t, e, i, s, r, n, h, o) {
          for (; e < i && r < n && t.codes[e] == s.codes[r];)++e,
          ++r;
          for (; e < i && r < n && t.codes[i - 1] == s.codes[n - 1];)--i,
          --n;
          if (e == i) for (; r < n;) s.modified[r++] = !0;
          else if (r == n) for (; e < i;) t.modified[e++] = !0;
          else {
            var l = this._sms(t, e, i, s, r, n, h, o);
            this._lcs(t, e, l.x, s, r, l.y, h, o),
            this._lcs(t, l.x, i, s, l.y, n, h, o)
          }
        },
        _sms: function(t, e, i, s, r, n, h, o) {
          var l = t.codes.length + s.codes.length + 1,
          a = e - r,
          c = i - n,
          d = 0 != (1 & i - e - (n - r)),
          g = l - a,
          f = l - c,
          u = (i - e + n - r) / 2 + 1;
          o[g + a + 1] = e,
          h[f + c - 1] = i;
          var p, m, _, v, y = {
            x: 0,
            y: 0
          };
          for (p = 0; p <= u; ++p) {
            for (m = a - p; m <= a + p; m += 2) {
              for (m == a - p ? _ = o[g + m + 1] : (_ = o[g + m - 1] + 1, m < a + p && o[g + m + 1] >= _ && (_ = o[g + m + 1])), v = _ - m; _ < i && v < n && t.codes[_] == s.codes[v];) _++,
              v++;
              if (o[g + m] = _, d && c - p < m && m < c + p && h[f + m] <= o[g + m]) return y.x = o[g + m],
              y.y = o[g + m] - m,
              y
            }
            for (m = c - p; m <= c + p; m += 2) {
              for (m == c + p ? _ = h[f + m - 1] : (_ = h[f + m + 1] - 1, m > c - p && h[f + m - 1] < _ && (_ = h[f + m - 1])), v = _ - m; _ > e && v > r && t.codes[_ - 1] == s.codes[v - 1];) _--,
              v--;
              if (h[f + m] = _, !d && a - p <= m && m <= a + p && h[f + m] <= o[g + m]) return y.x = o[g + m],
              y.y = o[g + m] - m,
              y
            }
          }
          throw "the algorithm should never come here."
        },
        _optimize: function(t) {
          for (var e = 0,
          i = 0; e < t.codes.length;) {
            for (; e < t.codes.length && (null == t.modified[e] || 0 == t.modified[e]);) e++;
            for (i = e; i < t.codes.length && 1 == t.modified[i];) i++;
            i < t.codes.length && t.codes[e] == t.codes[i] ? (t.modified[e] = !1, t.modified[i] = !0) : e = i
          }
        },
        _create_diffs: function(t, e) {
          for (var i = [], s = 0, r = 0, n = 0, h = 0; n < t.codes.length || h < e.codes.length;) if (n < t.codes.length && !t.modified[n] && h < e.codes.length && !e.modified[h]) n++,
          h++;
          else {
            for (s = n, r = h; n < t.codes.length && (h >= e.codes.length || t.modified[n]);) n++;
            for (; h < e.codes.length && (n >= t.codes.length || e.modified[h]);) h++; (s < n || r < h) && i.push({
              lhs_start: s,
              rhs_start: r,
              lhs_deleted_count: n - s,
              rhs_inserted_count: h - r
            })
          }
          return i
        }
      }),
      s.mergely = function(t, e) {
        t && this.init(t, e)
      },
      t.extend(s.mergely.prototype, {
        name: "mergely",
        init: function(t, e) {
          this.diffView = new s.CodeMirrorDiffView(t, e),
          this.bind(t)
        },
        bind: function(t) {
          this.diffView.bind(t)
        }
      }),
      s.CodeMirrorDiffView = function(t, i) {
        e.defineExtension("centerOnCursor", (function() {
          var t = this.cursorCoords(null, "local");
          this.scrollTo(null, (t.top + t.bottom) / 2 - this.getScrollerElement().clientHeight / 2)
        })),
        this.init(t, i)
      },
      t.extend(s.CodeMirrorDiffView.prototype, {
        init: function(e, i) {
          this.settings = t.extend(!0, {
            autoupdate: !0,
            autoresize: !0,
            rhs_margin: "right",
            wrap_lines: !1,
            line_numbers: !0,
            lcs: !0,
            sidebar: !0,
            viewport: !1,
            ignorews: !1,
            ignorecase: !1,
            ignoreaccents: !1,
            fadein: "fast",
            resize_timeout: 500,
            change_timeout: 150,
            fgcolor: {
              a: "#4ba3fa",
              c: "#a3a3a3",
              d: "#ff7f7f",
              ca: "#4b73ff",
              cc: "#434343",
              cd: "#ff4f4f"
            },
            bgcolor: "#eee",
            vpcolor: "rgba(0, 0, 200, 0.5)",
            license: "",
            width: "auto",
            height: "auto",
            cmsettings: {
              styleSelectedText: !0
            },
            lhs: function(t) {},
            rhs: function(t) {},
            loaded: function() {},
            resize: function(i) {
              var s, r, n = t(e).parent(),
              h = (s = "auto" == this.width ? n.width() : this.width) / 2 - 16 - 8,
              o = r = "auto" == this.height ? n.height() - 2 : this.height,
              l = t(e);
              l.find(".mergely-column").css({
                width: h + "px"
              }),
              l.find(".mergely-column, .mergely-canvas, .mergely-margin, .mergely-column textarea, .CodeMirror-scroll, .cm-s-default").css({
                height: o + "px"
              }),
              l.find(".mergely-canvas").css({
                height: o + "px"
              }),
              l.find(".mergely-column textarea").css({
                width: h + "px"
              }),
              l.css({
                width: s,
                height: r,
                clear: "both"
              }),
              "none" === l.css("display") && (0 != this.fadein ? l.fadeIn(this.fadein) : l.show()),
              this.resized && this.resized()
            },
            _debug: "",
            resized: function() {}
          },
          i),
          this.element = t(e),
          this.lhs_cmsettings = {
            lineWrapping: this.settings.wrap_lines,
            lineNumbers: this.settings.line_numbers
          },
          this.rhs_cmsettings = {
            lineWrapping: this.settings.wrap_lines,
            lineNumbers: this.settings.line_numbers
          };
          var s = [];
          this.lhs_cmsettings.lineNumbers && (s = ["merge", "CodeMirror-linenumbers"]);
          var r = [];
          this.rhs_cmsettings.lineNumbers && (r = ["merge", "CodeMirror-linenumbers"]),
          t.extend(!0, this.lhs_cmsettings, this.settings.cmsettings, {
            gutters: s
          },
          this.settings.lhs_cmsettings),
          t.extend(!0, this.rhs_cmsettings, this.settings.cmsettings, {
            gutters: r
          },
          this.settings.rhs_cmsettings),
          this.element.bind("destroyed", t.proxy(this.teardown, this)),
          t.data(e, "mergely", this),
          this._setOptions(i)
        },
        unbind: function() {
          null != this.changed_timeout && clearTimeout(this.changed_timeout),
          this.editor[this.id + "-lhs"].toTextArea(),
          this.editor[this.id + "-rhs"].toTextArea(),
          t(window).off(".mergely")
        },
        destroy: function() {
          this.element.unbind("destroyed", this.teardown),
          this.teardown()
        },
        teardown: function() {
          this.unbind()
        },
        lhs: function(t) {
          this.changes = [],
          this.editor[this.id + "-lhs"].setValue(t)
        },
        rhs: function(t) {
          this.changes = [],
          this.editor[this.id + "-rhs"].setValue(t)
        },
        update: function() {
          this._changing(this.id + "-lhs", this.id + "-rhs")
        },
        unmarkup: function() {
          this._clear()
        },
        scrollToDiff: function(t) {
          this.changes.length && ("next" == t ? this._current_diff == this.changes.length - 1 ? this._current_diff = 0 : this._current_diff = Math.min(++this._current_diff, this.changes.length - 1) : "prev" == t && (0 == this._current_diff ? this._current_diff = this.changes.length - 1 : this._current_diff = Math.max(--this._current_diff, 0)), this._scroll_to_change(this.changes[this._current_diff]), this._changed(this.id + "-lhs", this.id + "-rhs"))
        },
        mergeCurrentChange: function(t) {
          this.changes.length && ("lhs" != t || this.lhs_cmsettings.readOnly ? "rhs" != t || this.rhs_cmsettings.readOnly || this._merge_change(this.changes[this._current_diff], "lhs", "rhs") : this._merge_change(this.changes[this._current_diff], "rhs", "lhs"))
        },
        scrollTo: function(t, e) {
          var i = this.editor[this.id + "-lhs"],
          s = this.editor[this.id + "-rhs"];
          "lhs" == t ? (i.setCursor(e), i.centerOnCursor()) : (s.setCursor(e), s.centerOnCursor())
        },
        _setOptions: function(e) {
          if (t.extend(this.settings, e), this.settings.hasOwnProperty("rhs_margin")) if ("left" == this.settings.rhs_margin) this.element.find(".mergely-margin:last-child").insertAfter(this.element.find(".mergely-canvas"));
          else {
            var i = this.element.find(".mergely-margin").last();
            i.appendTo(i.parent())
          }
          var s, r;
          this.settings.hasOwnProperty("sidebar") && (this.settings.sidebar ? this.element.find(".mergely-margin").css({
            display: "block"
          }) : this.element.find(".mergely-margin").css({
            display: "none"
          })),
          this.settings.hasOwnProperty("wrap_lines") && this.editor && (s = this.editor[this.id + "-lhs"], r = this.editor[this.id + "-rhs"], s.setOption("lineWrapping", this.settings.wrap_lines), r.setOption("lineWrapping", this.settings.wrap_lines)),
          this.settings.hasOwnProperty("line_numbers") && this.editor && (s = this.editor[this.id + "-lhs"], r = this.editor[this.id + "-rhs"], s.setOption("lineNumbers", this.settings.line_numbers), r.setOption("lineNumbers", this.settings.line_numbers))
        },
        options: function(t) {
          if (!t) return this.settings;
          this._setOptions(t),
          this.settings.autoresize && this.resize(),
          this.settings.autoupdate && this.update()
        },
        swap: function() {
          if (!this.lhs_cmsettings.readOnly && !this.rhs_cmsettings.readOnly) {
            var t = this.editor[this.id + "-lhs"],
            e = this.editor[this.id + "-rhs"],
            i = e.getValue();
            e.setValue(t.getValue()),
            t.setValue(i)
          }
        },
        merge: function(t) {
          var e = this.editor[this.id + "-lhs"],
          i = this.editor[this.id + "-rhs"];
          "lhs" != t || this.lhs_cmsettings.readOnly ? this.rhs_cmsettings.readOnly || i.setValue(e.getValue()) : e.setValue(i.getValue())
        },
        get: function(t) {
          var e = this.editor[this.id + "-" + t].getValue();
          return null == e ? "": e
        },
        clear: function(t) {
          "lhs" == t && this.lhs_cmsettings.readOnly || ("rhs" == t && this.rhs_cmsettings.readOnly || this.editor[this.id + "-" + t].setValue(""))
        },
        cm: function(t) {
          return this.editor[this.id + "-" + t]
        },
        search: function(t, e, i) {
          var s, r = this.editor[this.id + "-lhs"],
          n = this.editor[this.id + "-rhs"];
          i = "prev" == i ? "findPrevious": "findNext",
          0 != (s = "lhs" == t ? r: n).getSelection().length && this.prev_query[t] == e || (this.cursor[this.id] = s.getSearchCursor(e, {
            line: 0,
            ch: 0
          },
          !1), this.prev_query[t] = e);
          var h = this.cursor[this.id];
          h[i]() ? s.setSelection(h.from(), h.to()) : h = s.getSearchCursor(e, {
            line: 0,
            ch: 0
          },
          !1)
        },
        resize: function() {
          this.settings.resize(),
          this._changing(this.id + "-lhs", this.id + "-rhs"),
          this._set_top_offset(this.id + "-lhs")
        },
        diff: function() {
          var t = this.editor[this.id + "-lhs"].getValue(),
          e = this.editor[this.id + "-rhs"].getValue();
          return new s.diff(t, e, this.settings).normal_form()
        },
        bind: function(i) {
          var s, r, n = this;
          this.trace("init", "bind"),
          this.element.hide(),
          this.id = t(i).attr("id");
          try {
            t("#".concat(this.id))
          } catch(t) {
            return void console.error("jQuery failed to find mergely: #".concat(this.id))
          }
          if (this.changed_timeout = null, this.chfns = {},
          this.chfns[this.id + "-lhs"] = [], this.chfns[this.id + "-rhs"] = [], this.prev_query = [], this.cursor = [], this._skipscroll = {},
          this.change_exp = new RegExp(/(\d+(?:,\d+)?)([acd])(\d+(?:,\d+)?)/), null != t.button) s = '<button title="Merge left"></button>',
          r = '<button title="Merge right"></button>';
          else {
            var h = "opacity:0.6;height:16px;background-color:#bfbfbf;cursor:pointer;text-align:center;color:#eee;border:1px solid #848484;margin-right:-15px;margin-top:-2px;";
            s = '<div style="' + h + '" title="Merge left">&lt;</div>',
            r = '<div style="' + h + '" title="Merge right">&gt;</div>'
          }
          this.merge_rhs_button = t(r),
          this.merge_lhs_button = t(s);
          var o = t('<div id="mergely-splash">'),
          l = t('<div class="mergely-margin" style="height: \''.concat("10px", '\'"><canvas id="lhs-margin" width="8px" height="\'').concat("10px", "'\"></canvas></div>"));
          l.find("#lhs-margin").attr("id", "".concat(this.id, "-lhs-margin"));
          var a = t("<div style=\"position:relative;width:'".concat("10px", "'; height:'").concat("10px", '\'" id="editor-lhs" class="mergely-column"><textarea id="text-lhs"></textarea></div>'));
          a.eq(0).attr("id", "".concat(this.id, "-editor-lhs")),
          a.find("#text-lhs").attr("id", "".concat(this.id, "-lhs"));
          var c = t('<div class="mergely-canvas" style="height: \''.concat("10px", '\'"><canvas id="lhs-rhs-canvas" style="width:28px" width="28px" height="\'').concat("10px", "'\"></canvas></div>"));
          c.find("#mergely-canvas").attr("id", "".concat(this.id, "-mergely-canvas")),
          c.find("#lhs-rhs-canvas").attr("id", "".concat(this.id, "-lhs-").concat(this.id, "-rhs-canvas")),
          this.element.append(o),
          this.element.append(l),
          this.element.append(a),
          this.element.append(c);
          var d = t('<div class="mergely-margin" style="height: \''.concat("10px", '\'"><canvas id="rhs-margin" width="8px" height="\'').concat("10px", "'\"></canvas></div>"));
          d.find("#rhs-margin").attr("id", "".concat(this.id, "-rhs-margin")),
          "left" == this.settings.rhs_margin && this.element.append(d);
          var g, f = t("<div style=\"width:'".concat("10px", "'; height:'").concat("10px", '\'" id="editor-rhs" class="mergely-column"><textarea id="text-rhs"></textarea></div>'));
          if (f.eq(0).attr("id", "".concat(this.id, "-editor-rhs")), f.find("#text-rhs").attr("id", "".concat(this.id, "-rhs")), this.element.append(f), "left" != this.settings.rhs_margin && this.element.append(d), this.settings.sidebar || this.element.find(".mergely-margin").css({
            display: "none"
          }), ["lgpl-separate-notice", "gpl-separate-notice", "mpl-separate-notice", "commercial"].indexOf(this.settings.license) < 0) {
            var u = {
              lgpl: "GNU LGPL v3.0",
              gpl: "GNU GPL v3.0",
              mpl: "MPL 1.1"
            },
            p = u[this.settings.license];
            p || (p = u.lgpl);
            this.element.parent().height();
            var m = this.element.parent().width();
          }
          try {
            g = this.element.find("#".concat(this.id, "-rhs")).get(0)
          } catch(t) {}
          if (g) {
            var _;
            try {
              _ = this.element.find("#".concat(this.id, "-lhs")).get(0)
            } catch(t) {}
            if (_) {
              var v = t('<div style="display:none" class="mergely current start" />').appendTo("body").css("border-top-color");
              this.current_diff_color = v;
              var y = "#".concat(this.id, " .CodeMirror-gutter-text { padding: 5px 0 0 0; }\n\t\t\t'#").concat(this.id, " .CodeMirror-lines pre, #").concat(this.id, " .CodeMirror-gutter-text pre { line-height: 18px; }\n\t\t\t'.CodeMirror-linewidget { overflow: hidden; };");
              this.settings.autoresize && (y += "".concat(this.id, " .CodeMirror-scroll { height: 100%; overflow: auto; }")),
              t('<style type="text/css">'.concat(y += "\n.CodeMirror { line-height: 18px; }", "</style>")).appendTo("head");
              var w = this;
              if (w.trace("init", "binding event listeners"), this.editor = [], this.editor[this.id + "-lhs"] = e.fromTextArea(_, this.lhs_cmsettings), this.editor[this.id + "-rhs"] = e.fromTextArea(g, this.rhs_cmsettings), this.editor[this.id + "-lhs"].on("change", (function() {
                w.settings.autoupdate && w._changing(w.id + "-lhs", w.id + "-rhs")
              })), this.editor[this.id + "-lhs"].on("scroll", (function() {
                w._scrolling(w.id + "-lhs")
              })), this.editor[this.id + "-rhs"].on("change", (function() {
                w.settings.autoupdate && w._changing(w.id + "-lhs", w.id + "-rhs")
              })), this.editor[this.id + "-rhs"].on("scroll", (function() {
                w._scrolling(w.id + "-rhs")
              })), this.settings.autoresize) {
                var b = null,
                x = function(t) {
                  w.settings.resize && w.settings.resize(t),
                  w.editor[w.id + "-lhs"].refresh(),
                  w.editor[w.id + "-rhs"].refresh()
                };
                t(window).on("resize.mergely", (function() {
                  b && clearTimeout(b),
                  b = setTimeout(x, w.settings.resize_timeout)
                })),
                x(!0)
              }
              this.editor[this.id + "-lhs"].on("gutterClick",
              function(t, e, i, s) {
                C.call(this, "lhs", e, s)
              }.bind(this)),
              this.editor[this.id + "-rhs"].on("gutterClick",
              function(t, e, i, s) {
                C.call(this, "rhs", e, s)
              }.bind(this)),
              this.settings.lhs && (w.trace("init", "setting lhs value"), this.settings.lhs(function(t) {
                this._initializing = !0,
                this.editor[this.id + "-lhs"].getDoc().setValue(t)
              }.bind(this))),
              this.settings.rhs && (w.trace("init", "setting rhs value"), this.settings.rhs(function(t) {
                this._initializing = !0,
                this.editor[this.id + "-rhs"].getDoc().setValue(t)
              }.bind(this))),
              this.element.one("updated", (function() {
                n._initializing = !1,
                w.settings.loaded && w.settings.loaded()
              })),
              this.trace("init", "bound"),
              this.editor[this.id + "-lhs"].focus()
            } else console.error("lhs textarea not defined - Mergely not initialized properly")
          } else console.error("rhs textarea not defined - Mergely not initialized properly");
          function C(e, i, s) {
            var r, n;
            if (! (s.target && t(s.target).closest(".merge-button").length > 0)) for (r = 0; r < this.changes.length; r++) if (i >= (n = this.changes[r])[e + "-line-from"] && i <= n[e + "-line-to"]) {
              this._current_diff = r,
              setTimeout(function() {
                this.scrollToDiff()
              }.bind(this), 10);
              break
            }
          }
        },
        _scroll_to_change: function(t) {
          if (t) {
            var e = this.editor[this.id + "-lhs"],
            i = this.editor[this.id + "-rhs"];
            e.setCursor(Math.max(t["lhs-line-from"], 0), 0),
            i.setCursor(Math.max(t["rhs-line-from"], 0), 0),
            t["lhs-line-to"] >= 0 && e.scrollIntoView({
              line: t["lhs-line-to"]
            }),
            e.focus()
          }
        },
        _scrolling: function(e) {
          if (!0 !== this._skipscroll[e]) {
            if (this.changes) {
              var i = t(this.editor[e].getScrollerElement());
              null == this.midway && (this.midway = (i.height() / 2 + i.offset().top).toFixed(2));
              var s = this.editor[e].coordsChar({
                left: 0,
                top: this.midway
              }),
              n = i.scrollTop(),
              h = i.scrollLeft();
              this.trace("scroll", "side", e),
              this.trace("scroll", "midway", this.midway),
              this.trace("scroll", "midline", s),
              this.trace("scroll", "top_to", n),
              this.trace("scroll", "left_to", h);
              var o = this.id + "-lhs",
              l = this.id + "-rhs";
              for (var a in this.editor) if (this.editor.hasOwnProperty(a) && e != a) {
                for (var c = e.replace(this.id + "-", ""), d = a.replace(this.id + "-", ""), g = 0, f = null, u = !1, p = 0; p < this.changes.length; ++p) {
                  var m = this.changes[p];
                  s.line >= m[c + "-line-from"] && (f = m, s.line >= f[c + "-line-to"] && (m.hasOwnProperty(c + "-y-start") && m.hasOwnProperty(c + "-y-end") && m.hasOwnProperty(d + "-y-start") && m.hasOwnProperty(d + "-y-end") ? g += m[c + "-y-end"] - m[c + "-y-start"] - (m[d + "-y-end"] - m[d + "-y-start"]) : u = !0))
                }
                var _ = this.editor[a].getViewport(),
                v = !0;
                f && (this.trace("scroll", "last change before midline", f), s.line >= _.from && s <= _.to && (v = !1)),
                this.trace("scroll", "scroll", v),
                v || u ? (this.trace("scroll", "scrolling other side", n - g), this._skipscroll[a] = !0, this.editor[a].scrollTo(h, n - g)) : this.trace("scroll", "not scrolling other side"),
                this.settings.autoupdate && (r.start(), this._calculate_offsets(o, l, this.changes), this.trace("change", "offsets time", r.stop()), this._markup_changes(o, l, this.changes), this.trace("change", "markup time", r.stop()), this._draw_diff(o, l, this.changes), this.trace("change", "draw time", r.stop())),
                this.trace("scroll", "scrolled")
              }
            }
          } else this._skipscroll[e] = !1
        },
        _changing: function(t, e) {
          this.trace("change", "changing-timeout", this.changed_timeout);
          var i = this;
          null != this.changed_timeout && clearTimeout(this.changed_timeout),
          this.changed_timeout = setTimeout((function() {
            r.start(),
            i._changed(t, e),
            i.trace("change", "total time", r.stop())
          }), this.settings.change_timeout)
        },
        _changed: function(t, e) {
          this._clear(),
          this._diff(t, e)
        },
        _clear: function() {
          var t, e, i, s, n, h, o = this,
          l = function() {
            for (r.start(), s = 0, h = e.lineCount(); s < h; ++s) e.removeLineClass(s, "background");
            for (s = 0; s < i.length; ++s)(n = i[s]).lines.length && o.trace("change", "clear text", n.lines[0].text),
            n.clear();
            e.clearGutter("merge"),
            o.trace("change", "clear time", r.stop())
          };
          for (t in this.editor) this.editor.hasOwnProperty(t) && (e = this.editor[t], i = o.chfns[t], e.operation(l));
          o.chfns[t] = [];
          var a = this._draw_info(this.id + "-lhs", this.id + "-rhs"),
          c = a.clhs.get(0).getContext("2d"),
          d = a.crhs.get(0).getContext("2d"),
          g = a.dcanvas.getContext("2d");
          c.beginPath(),
          c.fillStyle = this.settings.bgcolor,
          c.strokeStyle = "#888",
          c.fillRect(0, 0, 6.5, a.visible_page_height),
          c.strokeRect(0, 0, 6.5, a.visible_page_height),
          d.beginPath(),
          d.fillStyle = this.settings.bgcolor,
          d.strokeStyle = "#888",
          d.fillRect(0, 0, 6.5, a.visible_page_height),
          d.strokeRect(0, 0, 6.5, a.visible_page_height),
          g.beginPath(),
          g.fillStyle = "#fff",
          g.fillRect(0, 0, this.draw_mid_width, a.visible_page_height)
        },
        _diff: function(t, e) {
          var i = this.editor[t].getValue(),
          n = this.editor[e].getValue();
          r.start();
          var h = new s.diff(i, n, this.settings);
          this.trace("change", "diff time", r.stop()),
          this.changes = s.DiffParser(h.normal_form()),
          this.trace("change", "parse time", r.stop()),
          void 0 === this._current_diff && this.changes.length && (this._current_diff = 0, this._initializing && (console.log("init"), this._scroll_to_change(this.changes[0]))),
          this.trace("change", "scroll_to_change time", r.stop()),
          this._calculate_offsets(t, e, this.changes),
          this.trace("change", "offsets time", r.stop()),
          this._markup_changes(t, e, this.changes),
          this.trace("change", "markup time", r.stop()),
          this._draw_diff(t, e, this.changes),
          this.trace("change", "draw time", r.stop()),
          this.element.trigger("updated")
        },
        _parse_diff: function(t, e, i) {
          this.trace("diff", "diff results:\n", i);
          for (var s = [], r = 0, n = i.split(/\n/), h = 0; h < n.length; ++h) if (0 != n[h].length) {
            var o = {},
            l = this.change_exp.exec(n[h]);
            if (null != l) {
              var a = l[1].split(",");
              o["lhs-line-from"] = a[0] - 1,
              1 == a.length ? o["lhs-line-to"] = a[0] - 1 : o["lhs-line-to"] = a[1] - 1;
              var c = l[3].split(",");
              o["rhs-line-from"] = c[0] - 1,
              1 == c.length ? o["rhs-line-to"] = c[0] - 1 : o["rhs-line-to"] = c[1] - 1,
              o["lhs-line-from"] < 0 && (o["lhs-line-from"] = 0),
              o["lhs-line-to"] < 0 && (o["lhs-line-to"] = 0),
              o["rhs-line-from"] < 0 && (o["rhs-line-from"] = 0),
              o["rhs-line-to"] < 0 && (o["rhs-line-to"] = 0),
              o.op = l[2],
              s[r++] = o,
              this.trace("diff", "change", o)
            }
          }
          return s
        },
        _get_viewport_side: function(t) {
          return this.editor[t].getViewport()
        },
        _is_change_in_view: function(t, e, i) {
          return i["".concat(t, "-line-from")] >= e.from && i["".concat(t, "-line-from")] <= e.to || i["".concat(t, "-line-to")] >= e.from && i["".concat(t, "-line-to")] <= e.to || e.from >= i["".concat(t, "-line-from")] && e.to <= i["".concat(t, "-line-to")]
        },
        _set_top_offset: function(t) {
          var e = this.editor[t].getScrollInfo().top;
          this.editor[t].scrollTo(null, 0);
          var i = this.element.find(".CodeMirror-measure").first().offset().top - 4;
          return !! i && (this.editor[t].scrollTo(null, e), this.draw_top_offset = .5 - i, !0)
        },
        _calculate_offsets: function(e, i, s) {
          if (null == this.em_height) {
            if (!this._set_top_offset(e)) return;
            this.em_height = this.editor[e].defaultTextHeight(),
            this.em_height || (console.warn("Failed to calculate offsets, using 18 by default"), this.em_height = 18),
            this.draw_lhs_min = .5;
            var r = t("#" + e + "-" + i + "-canvas");
            if (r.length || console.error("failed to find canvas", "#" + e + "-" + i + "-canvas"), !r.width()) return void console.error("canvas width is 0");
            this.draw_mid_width = t("#" + e + "-" + i + "-canvas").width(),
            this.draw_rhs_max = this.draw_mid_width - .5,
            this.draw_lhs_width = 5,
            this.draw_rhs_width = 5,
            this.trace("calc", "change offsets calculated", {
              top_offset: this.draw_top_offset,
              lhs_min: this.draw_lhs_min,
              rhs_max: this.draw_rhs_max,
              lhs_width: this.draw_lhs_width,
              rhs_width: this.draw_rhs_width
            })
          }
          for (var n = this.editor[e].charCoords({
            line: 0
          }), h = this.editor[i].charCoords({
            line: 0
          }), o = this._get_viewport_side(e), l = (this._get_viewport_side(i), 0); l < s.length; ++l) {
            var a = s[l];
            if (!this.settings.viewport || this._is_change_in_view(o, "lhs", a) || this._is_change_in_view(o, "rhs", a)) {
              var c, d, g, f, u, p, m, _, v, y, w = a["lhs-line-from"] >= 0 ? a["lhs-line-from"] : 0,
              b = a["lhs-line-to"] >= 0 ? a["lhs-line-to"] : 0,
              x = a["rhs-line-from"] >= 0 ? a["rhs-line-from"] : 0,
              C = a["rhs-line-to"] >= 0 ? a["rhs-line-to"] : 0;
              this.editor[e].getOption("lineWrapping") || this.editor[i].getOption("lineWrapping") ? (u = this.editor[e].cursorCoords({
                line: w,
                ch: 0
              },
              "page"), _ = this.editor[e].getLineHandle(w), c = {
                top: u.top,
                bottom: u.top + _.height
              },
              p = this.editor[e].cursorCoords({
                line: b,
                ch: 0
              },
              "page"), m = this.editor[e].getLineHandle(b), d = {
                top: p.top,
                bottom: p.top + m.height
              },
              u = this.editor[i].cursorCoords({
                line: x,
                ch: 0
              },
              "page"), v = this.editor[i].getLineHandle(x), g = {
                top: u.top,
                bottom: u.top + v.height
              },
              p = this.editor[i].cursorCoords({
                line: C,
                ch: 0
              },
              "page"), y = this.editor[i].getLineHandle(C), f = {
                top: p.top,
                bottom: p.top + y.height
              }) : (c = {
                top: n.top + w * this.em_height,
                bottom: n.bottom + w * this.em_height + 2
              },
              d = {
                top: n.top + b * this.em_height,
                bottom: n.bottom + b * this.em_height + 2
              },
              g = {
                top: h.top + x * this.em_height,
                bottom: h.bottom + x * this.em_height + 2
              },
              f = {
                top: h.top + C * this.em_height,
                bottom: h.bottom + C * this.em_height + 2
              }),
              "a" == a.op ? x > 0 && (c.top = c.bottom, c.bottom += this.em_height, d = c) : "d" == a.op && w > 0 && (g.top = g.bottom, g.bottom += this.em_height, f = g),
              a["lhs-y-start"] = this.draw_top_offset + c.top,
              "c" == a.op || "d" == a.op ? a["lhs-y-end"] = this.draw_top_offset + d.bottom: a["lhs-y-end"] = this.draw_top_offset + d.top,
              a["rhs-y-start"] = this.draw_top_offset + g.top,
              "c" == a.op || "a" == a.op ? a["rhs-y-end"] = this.draw_top_offset + f.bottom: a["rhs-y-end"] = this.draw_top_offset + f.top,
              this.trace("calc", "change calculated", l, a)
            } else delete a["lhs-y-start"],
            delete a["lhs-y-end"],
            delete a["rhs-y-start"],
            delete a["rhs-y-end"]
          }
          return s
        },
        _markup_changes: function(e, i, n) {
          this.element.find(".merge-button").remove();
          var h = this,
          o = this.editor[e],
          l = this.editor[i],
          a = this._current_diff,
          c = this._get_viewport_side(e),
          d = this._get_viewport_side(i);
          r.start(),
          o.operation(function() {
            for (var t = 0; t < n.length; ++t) {
              var e = n[t];
              if (this._is_change_in_view("lhs", c, e)) {
                var i = e["lhs-line-from"] >= 0 ? e["lhs-line-from"] : 0,
                s = e["lhs-line-to"] >= 0 ? e["lhs-line-to"] : 0,
                r = e["rhs-line-from"] >= 0 ? e["rhs-line-from"] : 0,
                d = (e["rhs-line-to"] >= 0 && e["rhs-line-to"], ["mergely", "lhs", e.op, "cid-" + t]);
                if (o.addLineClass(i, "background", "start"), o.addLineClass(s, "background", "end"), e["lhs-line-from"] < 0 && d.push("empty"), a == t && (i != s && o.addLineClass(i, "background", "current"), o.addLineClass(s, "background", "current")), 0 == i && 0 == s && 0 == r) o.addLineClass(i, "background", d.join(" ")),
                o.addLineClass(i, "background", "first");
                else for (var g = i; g <= s; ++g) o.addLineClass(g, "background", d.join(" ")),
                o.addLineClass(g, "background", d.join(" "));
                if (!l.getOption("readOnly")) {
                  var f = h.merge_rhs_button.clone();
                  f.button && f.button({
                    icons: {
                      primary: "ui-icon-triangle-1-e"
                    },
                    text: !1
                  }),
                  f.addClass("merge-button"),
                  f.attr("id", "merge-rhs-" + t),
                  o.setGutterMarker(i, "merge", f.get(0))
                }
              }
            }
          }.bind(this)),
          this.trace("change", "markup lhs-editor time", r.stop()),
          l.operation(function() {
            for (var t = 0; t < n.length; ++t) {
              var e = n[t];
              if (this._is_change_in_view("rhs", d, e)) {
                var i = e["lhs-line-from"] >= 0 ? e["lhs-line-from"] : 0,
                s = (e["lhs-line-to"] >= 0 && e["lhs-line-to"], e["rhs-line-from"] >= 0 ? e["rhs-line-from"] : 0),
                r = e["rhs-line-to"] >= 0 ? e["rhs-line-to"] : 0,
                c = ["mergely", "rhs", e.op, "cid-" + t];
                if (l.addLineClass(s, "background", "start"), l.addLineClass(r, "background", "end"), e["rhs-line-from"] < 0 && c.push("empty"), a == t && (s != r && l.addLineClass(s, "background", "current"), l.addLineClass(r, "background", "current")), 0 == s && 0 == r && 0 == i) l.addLineClass(s, "background", c.join(" ")),
                l.addLineClass(s, "background", "first");
                else for (var g = s; g <= r; ++g) l.addLineClass(g, "background", c.join(" ")),
                l.addLineClass(g, "background", c.join(" "));
                if (!o.getOption("readOnly")) {
                  var f = h.merge_lhs_button.clone();
                  f.button && f.button({
                    icons: {
                      primary: "ui-icon-triangle-1-w"
                    },
                    text: !1
                  }),
                  f.addClass("merge-button"),
                  f.attr("id", "merge-lhs-" + t),
                  l.setGutterMarker(s, "merge", f.get(0))
                }
              }
            }
          }.bind(this)),
          this.trace("change", "markup rhs-editor time", r.stop());
          var g, f = [];
          for (L = 0; this.settings.lcs && L < n.length; ++L) {
            var u = n[L],
            p = u["lhs-line-from"] >= 0 ? u["lhs-line-from"] : 0,
            m = u["lhs-line-to"] >= 0 ? u["lhs-line-to"] : 0,
            _ = u["rhs-line-from"] >= 0 ? u["rhs-line-from"] : 0,
            v = u["rhs-line-to"] >= 0 ? u["rhs-line-to"] : 0;
            if ("d" == u.op) {
              var y = p,
              w = m;
              if (this._is_change_in_view("lhs", c, u)) {
                var b = o.lineInfo(w);
                b && f.push([o, {
                  line: y,
                  ch: 0
                },
                {
                  line: w,
                  ch: b.text.length
                },
                {
                  className: "mergely ch d lhs"
                }])
              }
            } else if ("c" == u.op) for (k = p, g = _; k >= 0 && k <= m || g >= 0 && g <= v; ++k, ++g) {
              var x, C;
              if (g > v) x = o.getLine(k),
              f.push([o, {
                line: k,
                ch: 0
              },
              {
                line: k,
                ch: x.length
              },
              {
                className: "mergely ch d lhs"
              }]);
              else if (k > m) C = l.getLine(g),
              f.push([l, {
                line: g,
                ch: 0
              },
              {
                line: g,
                ch: C.length
              },
              {
                className: "mergely ch a rhs"
              }]);
              else x = o.getLine(k),
              C = l.getLine(g),
              new s.LCS(x, C, {
                ignoreaccents: !!this.settings.ignoreaccents
              }).diff((function(t, e) {
                h._is_change_in_view("rhs", d, u) && f.push([l, {
                  line: g,
                  ch: t
                },
                {
                  line: g,
                  ch: e
                },
                {
                  className: "mergely ch a rhs"
                }])
              }), (function(t, e) {
                h._is_change_in_view("lhs", c, u) && f.push([o, {
                  line: k,
                  ch: t
                },
                {
                  line: k,
                  ch: e
                },
                {
                  className: "mergely ch d lhs"
                }])
              }))
            }
          }
          this.trace("change", "LCS marktext time", r.stop()),
          o.operation((function() {
            for (var t = 0; t < f.length; ++t) {
              var e = f[t];
              e[0].doc.id == o.getDoc().id && h.chfns[h.id + "-lhs"].push(e[0].markText(e[1], e[2], e[3]))
            }
          })),
          l.operation((function() {
            for (var t = 0; t < f.length; ++t) {
              var e = f[t];
              e[0].doc.id == l.getDoc().id && h.chfns[h.id + "-rhs"].push(e[0].markText(e[1], e[2], e[3]))
            }
          })),
          this.trace("change", "LCS markup time", r.stop());
          var A = {
            lhs: o,
            rhs: l
          };
          this.element.find(".merge-button").on("click", (function(e) {
            var i = "rhs",
            s = "lhs";
            t(this).parents("#" + h.id + "-editor-lhs").length && (i = "lhs", s = "rhs");
            var r = A[i].coordsChar({
              left: e.pageX,
              top: e.pageY
            }),
            n = null,
            o = A[i].lineInfo(r.line);
            t.each(o.bgClass.split(" "), (function(t, e) {
              if (0 == e.indexOf("cid-")) return n = parseInt(e.split("-")[1], 10),
              !1
            }));
            var l = h.changes[n];
            return h._merge_change(l, i, s),
            !1
          }));
          var M, O, L, k, P = t("#mergely-lhs ~ .CodeMirror .CodeMirror-code .CodeMirror-linenumber.CodeMirror-gutter-elt"),
          T = t("#mergely-rhs ~ .CodeMirror .CodeMirror-code .CodeMirror-linenumber.CodeMirror-gutter-elt");
          T.removeClass("mergely current"),
          P.removeClass("mergely current");
          var S = parseInt(P.eq(0).text(), 10) - 1,
          E = parseInt(P.eq(P.length - 1).text(), 10),
          V = parseInt(T.eq(0).text(), 10) - 1,
          j = parseInt(T.eq(T.length - 1).text(), 10);
          for (L = 0; L < n.length; ++L) {
            if (u = n[L], a == L && "a" !== u.op) for (M = u["lhs-line-from"], O = u["lhs-line-to"] + 1, k = M; k < O; ++k) k >= S && k <= E && P.eq(k - S).addClass("mergely current");
            if (a == L && "d" !== u.op) for (M = u["rhs-line-from"], O = u["rhs-line-to"] + 1, k = M; k < O; ++k) k >= V && k <= j && T.eq(k - V).addClass("mergely current")
          }
          this.trace("change", "markup buttons time", r.stop())
        },
        _merge_change: function(t, i, s) {
          if (t) {
            var r, n = {
              lhs: this.editor[this.id + "-lhs"],
              rhs: this.editor[this.id + "-rhs"]
            },
            h = t[i + "-line-from"],
            o = t[i + "-line-to"],
            l = t[s + "-line-from"],
            a = t[s + "-line-to"],
            c = n[i].getDoc(),
            d = n[s].getDoc(),
            g = h >= 0 ? c.getLine(h).length + 1 : 0,
            f = o >= 0 ? c.getLine(o).length + 1 : 0,
            u = a >= 0 ? d.getLine(a).length + 1 : 0,
            p = l >= 0 ? d.getLine(l).length + 1 : 0;
            "c" === t.op ? (r = c.getRange(e.Pos(h, 0), e.Pos(o, f)), d.replaceRange(r, e.Pos(l, 0), e.Pos(a, u))) : "lhs" === s && "d" === t.op || "rhs" === s && "a" === t.op ? (h > 0 ? (r = c.getRange(e.Pos(h, g), e.Pos(o, f)), l += 1) : r = c.getRange(e.Pos(0, 0), e.Pos(o + 1, 0)), d.replaceRange(r, e.Pos(l - 1, 0), e.Pos(a + 1, 0))) : ("rhs" === s && "d" === t.op || "lhs" === s && "a" === t.op) && (h > 0 ? (g = c.getLine(h - 1).length + 1, r = c.getRange(e.Pos(h - 1, g), e.Pos(o, f))) : r = c.getRange(e.Pos(0, 0), e.Pos(o + 1, 0)), l < 0 && (l = 0), d.replaceRange(r, e.Pos(l, p))),
            this._scroll_to_change(t)
          }
        },
        _draw_info: function(e, i) {
          var s = t(this.editor[e].getScrollerElement()).height() + 17,
          r = t(this.editor[e].getScrollerElement()).children(":first-child").height(),
          n = document.getElementById(e + "-" + i + "-canvas");
          if (null == n) throw "Failed to find: " + e + "-" + i + "-canvas";
          var h = this.element.find("#" + this.id + "-lhs-margin"),
          o = this.element.find("#" + this.id + "-rhs-margin");
          return {
            visible_page_height: s,
            gutter_height: r,
            visible_page_ratio: s / r,
            margin_ratio: s / r,
            lhs_scroller: t(this.editor[e].getScrollerElement()),
            rhs_scroller: t(this.editor[i].getScrollerElement()),
            lhs_lines: this.editor[e].lineCount(),
            rhs_lines: this.editor[i].lineCount(),
            dcanvas: n,
            clhs: h,
            crhs: o,
            lhs_xyoffset: t(h).offset(),
            rhs_xyoffset: t(o).offset()
          }
        },
        _draw_diff: function(e, i, s) {
          var r = this._draw_info(e, i),
          n = r.clhs.get(0),
          h = r.crhs.get(0),
          o = r.dcanvas.getContext("2d"),
          l = n.getContext("2d"),
          a = h.getContext("2d");
          this.trace("draw", "visible_page_height", r.visible_page_height),
          this.trace("draw", "gutter_height", r.gutter_height),
          this.trace("draw", "visible_page_ratio", r.visible_page_ratio),
          this.trace("draw", "lhs-scroller-top", r.lhs_scroller.scrollTop()),
          this.trace("draw", "rhs-scroller-top", r.rhs_scroller.scrollTop()),
          t.each(this.element.find("canvas"), (function() {
            t(this).get(0).height = r.visible_page_height
          })),
          r.clhs.unbind("click"),
          r.crhs.unbind("click"),
          l.beginPath(),
          l.fillStyle = this.settings.bgcolor,
          l.strokeStyle = "#888",
          l.fillRect(0, 0, 6.5, r.visible_page_height),
          l.strokeRect(0, 0, 6.5, r.visible_page_height),
          a.beginPath(),
          a.fillStyle = this.settings.bgcolor,
          a.strokeStyle = "#888",
          a.fillRect(0, 0, 6.5, r.visible_page_height),
          a.strokeRect(0, 0, 6.5, r.visible_page_height);
          for (var c = this._get_viewport_side(e), d = this._get_viewport_side(i), g = 0; g < s.length; ++g) {
            var f = s[g],
            u = this.settings.fgcolor[f.op];
            this._current_diff === g && (u = this.current_diff_color),
            this.trace("draw", f);
            var p = (f["lhs-y-start"] + r.lhs_scroller.scrollTop()) * r.visible_page_ratio,
            m = (f["lhs-y-end"] + r.lhs_scroller.scrollTop()) * r.visible_page_ratio + 1,
            _ = (f["rhs-y-start"] + r.rhs_scroller.scrollTop()) * r.visible_page_ratio,
            v = (f["rhs-y-end"] + r.rhs_scroller.scrollTop()) * r.visible_page_ratio + 1;
            if (this.trace("draw", "marker calculated", p, m, _, v), l.beginPath(), l.fillStyle = u, l.strokeStyle = "#000", l.lineWidth = .5, l.fillRect(1.5, p, 4.5, Math.max(m - p, 5)), l.strokeRect(1.5, p, 4.5, Math.max(m - p, 5)), a.beginPath(), a.fillStyle = u, a.strokeStyle = "#000", a.lineWidth = .5, a.fillRect(1.5, _, 4.5, Math.max(v - _, 5)), a.strokeRect(1.5, _, 4.5, Math.max(v - _, 5)), this._is_change_in_view("lhs", c, f) || this._is_change_in_view("rhs", d, f)) {
              p = f["lhs-y-start"],
              m = f["lhs-y-end"],
              _ = f["rhs-y-start"],
              v = f["rhs-y-end"];
              o.beginPath(),
              o.strokeStyle = u,
              o.lineWidth = this._current_diff == g ? 1.5 : 1;
              var y = this.draw_lhs_width,
              w = m - p - 1,
              b = this.draw_lhs_min,
              x = p;
              o.moveTo(b, x),
              "Microsoft Internet Explorer" == navigator.appName ? (o.lineTo(this.draw_lhs_min + this.draw_lhs_width, p), o.lineTo(this.draw_lhs_min + this.draw_lhs_width, m + 1), o.lineTo(this.draw_lhs_min, m + 1)) : (w <= 0 ? o.lineTo(b + y, x) : (o.arcTo(b + y, x, b + y, x + 3, 3), o.arcTo(b + y, x + w, b + y - 3, x + w, 3)), o.lineTo(b, x + w)),
              o.stroke(),
              y = this.draw_rhs_width,
              w = v - _ - 1,
              b = this.draw_rhs_max,
              x = _,
              o.moveTo(b, x),
              "Microsoft Internet Explorer" == navigator.appName ? (o.lineTo(this.draw_rhs_max - this.draw_rhs_width, _), o.lineTo(this.draw_rhs_max - this.draw_rhs_width, v + 1), o.lineTo(this.draw_rhs_max, v + 1)) : (w <= 0 ? o.lineTo(b - y, x) : (o.arcTo(b - y, x, b - y, x + 3, 3), o.arcTo(b - y, x + w, b - 3, x + w, 3)), o.lineTo(b, x + w)),
              o.stroke();
              var C = this.draw_lhs_min + this.draw_lhs_width,
              A = p + (m + 1 - p) / 2,
              M = this.draw_rhs_max - this.draw_rhs_width,
              O = _ + (v + 1 - _) / 2;
              o.moveTo(C, A),
              A == O ? o.lineTo(M, O) : o.bezierCurveTo(C + 12, A - 3, M - 12, O - 3, M, O),
              o.stroke()
            }
          }
          l.fillStyle = this.settings.vpcolor,
          a.fillStyle = this.settings.vpcolor;
          var L = r.clhs.height() * r.visible_page_ratio,
          k = r.lhs_scroller.scrollTop() / r.gutter_height * r.clhs.height(),
          P = r.crhs.height() * r.visible_page_ratio,
          T = r.rhs_scroller.scrollTop() / r.gutter_height * r.crhs.height();
          this.trace("draw", "cls.height", r.clhs.height()),
          this.trace("draw", "lhs_scroller.scrollTop()", r.lhs_scroller.scrollTop()),
          this.trace("draw", "gutter_height", r.gutter_height),
          this.trace("draw", "visible_page_ratio", r.visible_page_ratio),
          this.trace("draw", "lhs from", k, "lhs to", L),
          this.trace("draw", "rhs from", T, "rhs to", P),
          l.fillRect(1.5, k, 4.5, L),
          a.fillRect(1.5, T, 4.5, P),
          r.clhs.click((function(t) {
            var e = t.pageY - r.lhs_xyoffset.top - L / 2,
            i = Math.max(0, e / n.height * r.lhs_scroller.get(0).scrollHeight);
            r.lhs_scroller.scrollTop(i)
          })),
          r.crhs.click((function(t) {
            var e = t.pageY - r.rhs_xyoffset.top - P / 2,
            i = Math.max(0, e / h.height * r.rhs_scroller.get(0).scrollHeight);
            r.rhs_scroller.scrollTop(i)
          }))
        },
        trace: function(t) {
          this.settings._debug.indexOf(t) >= 0 && (arguments[0] = t + ":", console.log([].slice.apply(arguments)))
        }
      }),
      t.pluginMaker = function(e) {
        t.fn[e.prototype.name] = function(i) {
          var s, r = t.makeArray(arguments),
          n = r.slice(1);
          if (this.each((function() {
            var h = this,
            o = t.data(this, e.prototype.name);
            if (o) {
              if ("string" == typeof i) s = o[i].apply(o, n);
              else if (o.update) return o.update.apply(o, r)
            } else {
              new e(this, i);
              t.fn["".concat(e.prototype.name, "Unregister")] = function() {
                t.data(h, e.prototype.name, null)
              }
            }
          })), null != s) return s
        }
      },
      t.pluginMaker(s.mergely)
    } (i(2), i(3))
  },
  function(t, e) {
    function i(t, e) {
      for (var i = 0; i < e.length; i++) {
        var s = e[i];
        s.enumerable = s.enumerable || !1,
        s.configurable = !0,
        "value" in s && (s.writable = !0),
        Object.defineProperty(t, s.key, s)
      }
    }
    var s = function() {
      function t() { !
        function(t, e) {
          if (! (t instanceof e)) throw new TypeError("Cannot call a class as a function")
        } (this, t)
      }
      var e, s, r;
      return e = t,
      r = [{
        key: "start",
        value: function() {
          t.t0 = Date.now()
        }
      },
      {
        key: "stop",
        value: function() {
          var e = Date.now(),
          i = e - t.t0;
          return t.t0 = e,
          i
        }
      }],
      (s = null) && i(e.prototype, s),
      r && i(e, r),
      t
    } ();
    s.t0 = 0,
    t.exports = s
  },
  function(e, i) {
    e.exports = t
  },
  function(t, i) {
    t.exports = e
  }])
}));