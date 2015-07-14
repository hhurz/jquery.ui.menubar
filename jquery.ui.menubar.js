/*
 * jQuery UI Menubar @VERSION
 *
 * Copyright 2012, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 */
(function( $ ) {

$.widget( "ui.menubar", {
    version : "@VERSION",
    options : {
      autoExpand : false,
      buttons : false,
      items : "li",
      menuElement : "ul",
      menuIcon : false,
      position : {
        my : "left top",
        at : "left bottom"
      }
    },
    _create : function () {
      var b = this;
      this.menuItems = this.element.children(this.options.items),
      this.items = this.menuItems.children("button, a"),
      this.menuItems.addClass("ui-menubar-item").attr("role", "presentation"),
      this.items.slice(1).attr("tabIndex", -1),
      this.element.addClass("ui-menubar ui-widget-header ui-helper-clearfix").attr("role", "menubar"),
      this._focusable(this.items),
      this._hoverable(this.items),
      this.items.siblings(this.options.menuElement).menu({
        position : {
          within : this.options.position.within
        },
        select : function (c, d) {
          d.item.parents("ul.ui-menu:last").hide(),
          b._close(),
          a(c.target).prev().focus(),
          b._trigger("select", c, d)
        },
        menus : b.options.menuElement
      }).hide().attr({
        "aria-hidden" : "true",
        "aria-expanded" : "false"
      }).bind("keydown.menubar", function (c) {
        var d = a(this);
        if (d.is(":hidden"))
          return;
        switch (c.keyCode) {
        case a.ui.keyCode.LEFT:
          b.previous(c),
          c.preventDefault();
          break;
        case a.ui.keyCode.RIGHT:
          b.next(c),
          c.preventDefault()
        }
      }),
      this.items.each(function () {
        var c = a(this),
        d = c.next(b.options.menuElement);
        c.bind("click.menubar focus.menubar mouseenter.menubar", function (a) {
          if (a.type == "focus" && !a.originalEvent)
            return;
          a.preventDefault();
          if (a.type == "click" && d.is(":visible") && b.active && b.active[0] == d[0]) {
            b._close();
            return
          }
          if (b.open && a.type == "mouseenter" || a.type == "click" || b.options.autoExpand)
            b.options.autoExpand && clearTimeout(b.closeTimer), b._open(a, d)
        }).bind("keydown", function (c) {
          switch (c.keyCode) {
          case a.ui.keyCode.SPACE:
          case a.ui.keyCode.UP:
          case a.ui.keyCode.DOWN:
            b._open(c, a(this).next()),
            c.preventDefault();
            break;
          case a.ui.keyCode.LEFT:
            b.previous(c),
            c.preventDefault();
            break;
          case a.ui.keyCode.RIGHT:
            b.next(c),
            c.preventDefault()
          }
        }).addClass("ui-button ui-widget ui-button-text-only ui-menubar-link").attr("role", "menuitem").attr("aria-haspopup", "true").wrapInner("<span class='ui-button-text'></span>"),
        b.options.menuIcon && (c.addClass("ui-state-default").append("<span class='ui-button-icon-secondary ui-icon ui-icon-triangle-1-s'></span>"), c.removeClass("ui-button-text-only").addClass("ui-button-text-icon-secondary")),
        b.options.buttons || c.addClass("ui-menubar-link").removeClass("ui-state-default")
      }),
      b._bind({
        keydown : function (c) {
          if (c.keyCode == a.ui.keyCode.ESCAPE && b.active && b.active.menu("collapse", c) !== !0) {
            var d = b.active;
            b.active.blur(),
            b._close(c),
            d.prev().focus()
          }
        },
        focusin : function (a) {
          clearTimeout(b.closeTimer)
        },
        focusout : function (a) {
          b.closeTimer = setTimeout(function () {
              b._close(a)
            }, 150)
        },
        "mouseleave .ui-menubar-item" : function (a) {
          b.options.autoExpand && (b.closeTimer = setTimeout(function () {
                b._close(a)
              }, 150))
        },
        "mouseenter .ui-menubar-item" : function (a) {
          clearTimeout(b.closeTimer)
        }
      })
    },
    _destroy : function () {
      this.menuItems.removeClass("ui-menubar-item").removeAttr("role"),
      this.element.removeClass("ui-menubar ui-widget-header ui-helper-clearfix").removeAttr("role").unbind(".menubar"),
      this.items.unbind(".menubar").removeClass("ui-button ui-widget ui-button-text-only ui-menubar-link ui-state-default").removeAttr("role").removeAttr("aria-haspopup").children("span.ui-button-text").each(function (b, c) {
        var d = a(this);
        d.parent().html(d.html())
      }).end().children(".ui-icon").remove(),
      this.element.find(":ui-menu").menu("destroy").show().removeAttr("aria-hidden").removeAttr("aria-expanded").removeAttr("tabindex").unbind(".menubar")
    },
    _close : function () {
      if (!this.active || !this.active.length)
        return;
      this.active.menu("collapseAll").hide().attr({
        "aria-hidden" : "true",
        "aria-expanded" : "false"
      }),
      this.active.prev().removeClass("ui-state-active").removeAttr("tabIndex"),
      this.active = null,
      this.open = false
    },
    _open : function (b, c) {
      if (this.active && this.active[0] == c[0])
        return;
      this.active && (this.active.menu("collapseAll").hide().attr({
          "aria-hidden" : "true",
          "aria-expanded" : "false"
        }), this.active.prev().removeClass("ui-state-active"));
      var d = c.prev().addClass("ui-state-active").attr("tabIndex", -1);
      this.active = c.show().position(a.extend({
            of : d
          }, this.options.position)).removeAttr("aria-hidden").attr("aria-expanded", "true").menu("focus", b, c.children(".ui-menu-item").first()).focus().focusin(),
      this.open = !0
    },
    next : function (a) {
      this._move("next", "first", a)
    },
    previous : function (a) {
      this._move("prev", "last", a)
    },
    _move : function (b, c, d) {
      var e,
      f;
      this.open ? (e = this.active.closest(".ui-menubar-item")[b + "All"](this.options.items).first().children(".ui-menu").eq(0), f = this.menuItems[c]().children(".ui-menu").eq(0)) : d ? (e = a(d.target).closest(".ui-menubar-item")[b + "All"](this.options.items).children(".ui-menubar-link").eq(0), f = this.menuItems[c]().children(".ui-menubar-link").eq(0)) : e = f = this.menuItems.children("a").eq(0),
      e.length ? this.open ? this._open(d, e) : e.removeAttr("tabIndex")[0].focus() : this.open ? this._open(d, f) : f.removeAttr("tabIndex")[0].focus()
    }
});

}( jQuery ));
