define("mvc/ui/ui-modal", ["exports"], function(exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    var View = exports.View = Backbone.View.extend({
        className: "ui-modal",

        // defaults
        optionsDefault: {
            container: "body",
            title: "ui-modal",
            cls: "ui-modal",
            body: "",
            backdrop: true,
            height: null,
            width: null,
            closing_events: false,
            closing_callback: null,
            title_separator: true
        },

        // button list
        buttonList: {},

        // initialize
        initialize: function initialize(options) {
            this.options = _.defaults(options || {}, this.optionsDefault);
            $(this.options.container).prepend(this.el);
            // optional render
            if (options) {
                this.render();
            }
        },

        /**
         * Displays modal
         */
        show: function show(options) {
            var _this = this;

            if (options) {
                this.options = _.defaults(options, this.optionsDefault);
                this.render();
            }
            if (!this.visible) {
                this.visible = true;
                this.$el.fadeIn("fast");
            }
            if (this.options.closing_events) {
                $(document).on("keyup.ui-modal", function(e) {
                    if (e.keyCode == 27) {
                        _this.hide(true);
                    }
                });
                this.$backdrop.on("click", function() {
                    _this.hide(true);
                });
            }
        },

        /**
         * Hide modal
         */
        hide: function hide(canceled) {
            this.visible = false;
            this.$el.fadeOut("fast");
            if (this.options.closing_callback) {
                this.options.closing_callback(canceled);
            }
            $(document).off("keyup.ui-modal");
            this.$backdrop.off("click");
        },

        /**
         * Render modal
         */
        render: function render() {
            var self = this;
            this.$el.html(this._template());

            // link elements
            this.$header = this.$(".modal-header");
            this.$dialog = this.$(".modal-dialog");
            this.$body = this.$(".modal-body");
            this.$footer = this.$(".modal-footer");
            this.$backdrop = this.$(".modal-backdrop");
            this.$buttons = this.$(".buttons");

            if (this.options.body == "progress") {
                this.options.body = $('<div class="progress progress-striped active">' + '<div class="progress-bar progress-bar-info" style="width:100%"/>' + "</div>");
            }

            // fix main content
            this.$el.removeClass().addClass("modal").addClass(this.options.cls);
            this.$header.find(".title").html(this.options.title);
            this.$body.html(this.options.body);

            // append buttons
            this.$buttons.empty();
            this.buttonList = {};
            if (this.options.buttons) {
                var counter = 0;
                $.each(this.options.buttons, function(name, callback) {
                    var $button = $("<button/>").attr("id", "button-" + counter++).text(name).click(callback);
                    self.$buttons.append($button).append("&nbsp;");
                    self.buttonList[name] = $button;
                });
            } else {
                this.$footer.hide();
            }

            // configure background, separator line
            this.$backdrop[this.options.backdrop && "addClass" || "removeClass"]("in");
            this.$header[!this.options.title_separator && "addClass" || "removeClass"]("no-separator");

            // fix dimensions
            // note: because this is a singleton, we need to clear inline styles from any previous invocations
            this.$body.removeAttr("style");
            if (this.options.height) {
                this.$body.css("height", this.options.height);
                this.$body.css("overflow", "hidden");
            } else {
                this.$body.css("max-height", $(window).height() / 2);
            }
            if (this.options.width) {
                this.$dialog.css("width", this.options.width);
            }
        },

        /**
         * Returns the button dom
         * @param{String}   name    - Button name/title
         */
        getButton: function getButton(name) {
            return this.buttonList[name];
        },

        /**
         * Enables a button
         * @param{String}   name    - Button name/title
         */
        enableButton: function enableButton(name) {
            this.getButton(name).prop("disabled", false);
        },

        /**
         * Disables a button
         * @param{String}   name    - Button name/title
         */
        disableButton: function disableButton(name) {
            this.getButton(name).prop("disabled", true);
        },

        /**
         * Show a button
         * @param{String}   name    - Button name/title
         */
        showButton: function showButton(name) {
            this.getButton(name).show();
        },

        /**
         * Hide a button
         * @param{String}   name    - Button name/title
         */
        hideButton: function hideButton(name) {
            this.getButton(name).hide();
        },

        /**
         * Returns scroll top for body element
         */
        scrollTop: function scrollTop() {
            return this.$body.scrollTop();
        },

        /**
         * Returns the modal template
         */
        _template: function _template() {
            return '<div class="modal-backdrop fade"/>' + '<div class="modal-dialog">' + '<div class="modal-content">' + '<div class="modal-header">' + '<h4 class="title"/>' + "</div>" + '<div class="modal-body"/>' + '<div class="modal-footer">' + '<div class="buttons"/>' + "</div>" + "</div>" + "</div>";
        }
    });

    exports.default = {
        View: View
    };
});
//# sourceMappingURL=../../../maps/mvc/ui/ui-modal.js.map
