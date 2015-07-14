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
      var that = this;
      this.menuItems = this.element.children(this.options.items);
      this.items = this.menuItems.children("button, a");
      this.menuItems.addClass("ui-menubar-item").attr("role", "presentation");
      // let only the first item receive focus
      this.items.slice(1).attr("tabIndex", -1);

      this.element
              .addClass("ui-menubar ui-widget-header ui-helper-clearfix")
              .attr("role", "menubar");
      this._focusable(this.items);
      this._hoverable(this.items);
      this.items.siblings(this.options.menuElement)
              .menu({
                position : {
                  within : this.options.position.within
                },
                select : function (event, ui) {
                  ui.item.parents("ul.ui-menu:last").hide();
                  that._close();
                  // TODO what is this targetting? there's probably a better way to access it
                  $(event.target).prev().focus();
                  that._trigger("select", event, ui);
                },
                menus : that.options.menuElement
              })
              .hide().attr({
                "aria-hidden" : "true",
                "aria-expanded" : "false"
              })
              .on("keydown.menubar", function (event) {
                var menu = $(this);
                if (menu.is(":hidden"))
                  return;
                switch (event.keyCode) {
                case $.ui.keyCode.LEFT:
                  that.previous(event);
                  c.preventDefault();
                  break;
                case $.ui.keyCode.RIGHT:
                  that.next(event);
                  event.preventDefault();
                  break;
                }
              });
      
        this.items.each(function () {
              var input = $(this),
                  // TODO menu var is only used on two places, doesn't quite justify the .each
                  menu = input.next(that.options.menuElement);

              input.on("click.menubar focus.menubar mouseenter.menubar", function (event) {
                if (event.type == "focus" && !event.originalEvent)
                  return;
                event.preventDefault();

                // TODO can we simplify or extractthis check? especially the last two expressions
                // there's a similar active[0] == menu[0] check in _open
                if (event.type == "click" && menu.is(":visible") && that.active && that.active[0] == menu[0]) {
                  that._close();
                  return;
                }
                if ((that.open && event.type == "mouseenter") || event.type == "click" || that.options.autoExpand) {
                  if ( that.options.autoExpand ) 
                    clearTimeout(that.closeTimer); 
                  that._open(event, menu);
                }
        })
        .on("keydown", function (event) {
              switch (event.keyCode) {
              case $.ui.keyCode.SPACE:
              case $.ui.keyCode.UP:
              case $.ui.keyCode.DOWN:
                that._open(event, $(this).next());
                event.preventDefault();
                break;
              case $.ui.keyCode.LEFT:
                that.previous(event, $(this));
                event.preventDefault();
                break;
              case $.ui.keyCode.RIGHT:
                that.next(event, $(this));
                event.preventDefault();
                break;
              }
        })
        .addClass("ui-button ui-widget ui-button-text-only ui-menubar-link")
        .attr("role", "menuitem")
        .attr("aria-haspopup", "true")
        .wrapInner("<span class='ui-button-text'></span>");
        
        // TODO review if these options are a good choice, maybe they can be merged
        if ( that.options.menuIcon ) {
          input.addClass("ui-state-default").append("<span class='ui-button-icon-secondary ui-icon ui-icon-triangle-1-s'></span>");
          input.removeClass("ui-button-text-only").addClass("ui-button-text-icon-secondary");
        }
        
        if ( that.options.buttons ) {
          // TODO ui-menubar-link is added above, not needed here?
          input.addClass("ui-menubar-link").removeClass("ui-state-default");
        }
      });
      that._on({
        keydown : function (event) {
          if (event.keyCode == $.ui.keyCode.ESCAPE && that.active && that.active.menu("collapse", event) !== true) {
            var active = that.active;
            that.active.blur();
            that._close(event);
            active.prev().focus();
          }
        },
        focusin : function (event) {
          clearTimeout(that.closeTimer);
        },
        focusout : function (event) {
          that.closeTimer = setTimeout(function () {
              that._close(event);
            }, 100);
        },
        "mouseleave .ui-menubar-item" : function (event) {
          if ( that.options.autoExpand ) { 
            that.closeTimer = setTimeout(function () {
                that._close(event);
              }, 100);
          }
        },
        "mouseenter .ui-menubar-item" : function (event) {
          clearTimeout(that.closeTimer);
        }
      });
    },
    _destroy : function () {
      this.menuItems
              .removeClass("ui-menubar-item")
              .removeAttr("role");
      this.element
              .removeClass("ui-menubar ui-widget-header ui-helper-clearfix")
              .removeAttr("role")
              .off(".menubar");
      this.items
              .off(".menubar")
              .removeClass("ui-button ui-widget ui-button-text-only ui-menubar-link ui-state-default")
              .removeAttr("role")
              .removeAttr("aria-haspopup")
              .children("span.ui-button-text").each(function (i, e) {
                      var item = $(this);
                      item.parent().html(item.html());
              })
              .end()
              .children(".ui-icon").remove();
      
      this.element.find(":ui-menu")
              .menu("destroy")
              .show()
              .removeAttr("aria-hidden")
              .removeAttr("aria-expanded")
              .removeAttr("tabindex")
              .off(".menubar");
    },
    _close : function () {
      if (!this.active || !this.active.length)
        return;
      this.active.menu("collapseAll").hide().attr({
        "aria-hidden" : "true",
        "aria-expanded" : "false"
      });
      this.active.prev().removeClass("ui-state-active").removeAttr("tabIndex");
      this.active = null;
      this.open = false;
    },
    _open : function (event, menu) {
      // on a single-button menubar, ignore reopening the same menu
      if (this.active && this.active[0] == menu[0])
        return;
        
      if ( this.active ) {
        // TODO refactor, almost the same as _close above, but don't remove tabIndex
        this.active.menu("collapseAll").hide().attr({
        "aria-hidden" : "true",
        "aria-expanded" : "false"
        }); 
        this.active.prev().removeClass("ui-state-active");
      }
      // set tabIndex -1 to have the button skipped on shift-tab when menu is open (it gets focus)
      var button = menu.prev().addClass("ui-state-active").attr("tabIndex", -1);
      this.active = menu.show().position($.extend({
            of : button
          }, this.options.position))
          .removeAttr("aria-hidden")
          .attr("aria-expanded", "true")
          .menu("focus", event, menu.children(".ui-menu-item").first())
          // TODO need a comment here why both events are triggered
          .focus()
          .focusin();
      this.open = true;
    },
    next : function (event) {
      this._move("next", "first", event);
    },
    previous : function (event) {
      this._move("prev", "last", event);
    },
    _move : function (b, c, event) {
      var e, f;
      if ( this.open ) {
        e = this.active.closest(".ui-menubar-item")[b + "All"](this.options.items).first().children(".ui-menu").eq(0);
        f = this.menuItems[c]().children(".ui-menu").eq(0);
      }
      else if ( event ) {
        e = $(event.target).closest(".ui-menubar-item")[b + "All"](this.options.items).children(".ui-menubar-link").eq(0);
        f = this.menuItems[c]().children(".ui-menubar-link").eq(0);
      }
      else
        e = f = this.menuItems.children("a").eq(0);
      if ( e.length ) {
        if ( this.open ) 
          this._open(event, e);
        else
          e.removeAttr("tabIndex")[0].focus();
      }
      else {
        if ( this.open ) 
          this._open(event, f);
        else
          f.removeAttr("tabIndex")[0].focus();
      }
    }
});

}( jQuery ));
