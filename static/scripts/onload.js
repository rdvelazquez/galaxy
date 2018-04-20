define("onload", ["layout/panel", "layout/modal", "utils/async-save-text", "ui/popupmenu", "ui/autocom_tagging", "mvc/tours", "mvc/webhooks", "utils/utils"], function(_panel, _modal, _asyncSaveText, _popupmenu, _autocom_tagging, _tours, _webhooks, _utils) {
    "use strict";

    var _panel2 = _interopRequireDefault(_panel);

    var _modal2 = _interopRequireDefault(_modal);

    var _asyncSaveText2 = _interopRequireDefault(_asyncSaveText);

    var _popupmenu2 = _interopRequireDefault(_popupmenu);

    var _autocom_tagging2 = _interopRequireDefault(_autocom_tagging);

    var _tours2 = _interopRequireDefault(_tours);

    var _webhooks2 = _interopRequireDefault(_webhooks);

    var _utils2 = _interopRequireDefault(_utils);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    // ============================================================================
    // Globals (temporary)
    // ============================================================================
    // HACK: add these to global scope until we stop asking for them there...
    // Via webpack: these are required here automatically by the provider plugin
    // Via script tag: these are redundant (identities) since they're already global
    window["jQuery"] = jQuery; // a weird form to prevent webpack from sub'ing 'window.jQuery' in the provider plugin
    window.$ = jQuery;
    window._ = _;
    window.Backbone = Backbone;
    // console.debug('globals loaded:', window.jQuery, window.Backbone, '...');

    // these are galaxy globals not defined in the provider (although they could be - but why encourage that?)

    window.panels = _panel2.default;

    // using extend bc there are multiple fns/objs to decorate the window with

    _.extend(window, _modal2.default);

    window.async_save_text = _asyncSaveText2.default;

    window.make_popupmenu = _popupmenu2.default.make_popupmenu;
    window.make_popup_menus = _popupmenu2.default.make_popup_menus;

    window.init_tag_click_function = _autocom_tagging2.default;

    // console.debug( 'galaxy globals loaded' );

    // ============================================================================
    // jquery on document ready
    // ============================================================================
    // Replace select box with a text input box + autocomplete.
    function replace_big_select_inputs(min_length, max_length, select_elts) {
        function refresh_select2(element) {
            var select_elt = $(element);
            var options = {
                placeholder: "Click to select",
                closeOnSelect: !select_elt.is("[MULTIPLE]"),
                dropdownAutoWidth: true,
                containerCssClass: "select2-minwidth"
            };
            return element.select2(options);
        }

        // To do replace, the select2 plugin must be loaded.
        if (!jQuery.fn.select2) {
            return;
        }

        // Set default for min_length and max_length
        if (min_length === undefined) {
            min_length = 20;
        }
        if (max_length === undefined) {
            max_length = 3000;
        }

        select_elts = select_elts || $("select");

        select_elts.each(function() {
            var select_elt = $(this).not("[multiple]");
            // Make sure that options is within range.
            var num_options = select_elt.find("option").length;
            if (num_options < min_length || num_options > max_length) {
                return;
            }

            if (select_elt.hasClass("no-autocomplete")) {
                return;
            }

            /* Replaced jQuery.autocomplete with select2, notes:
             * - multiple selects are supported
             * - the original element is updated with the value, convert_to_values should not be needed
             * - events are fired when updating the original element, so refresh_on_change should just work
             *
             * - should we still sort dbkey fields here?
             */
            refresh_select2(select_elt);
        });
    }

    // Initialize refresh events.
    function init_refresh_on_change() {
        $("select[refresh_on_change='true']").off("change").change(function() {
            var select_field = $(this);
            var select_val = select_field.val();
            var ref_on_change_vals = select_field.attr("refresh_on_change_values");
            if (ref_on_change_vals) {
                ref_on_change_vals = ref_on_change_vals.split(",");
                var last_selected_value = select_field.attr("last_selected_value");
                if ($.inArray(select_val, ref_on_change_vals) === -1 && $.inArray(last_selected_value, ref_on_change_vals) === -1) {
                    return;
                }
            }
            $(window).trigger("refresh_on_change");
            $(document).trigger("convert_to_values"); // Convert autocomplete text to values
            select_field.get(0).form.submit();
        });

        // checkboxes refresh on change
        $(":checkbox[refresh_on_change='true']").off("click").click(function() {
            var select_field = $(this);
            var select_val = select_field.val();
            var ref_on_change_vals = select_field.attr("refresh_on_change_values");
            if (ref_on_change_vals) {
                ref_on_change_vals = ref_on_change_vals.split(",");
                var last_selected_value = select_field.attr("last_selected_value");
                if ($.inArray(select_val, ref_on_change_vals) === -1 && $.inArray(last_selected_value, ref_on_change_vals) === -1) {
                    return;
                }
            }
            $(window).trigger("refresh_on_change");
            select_field.get(0).form.submit();
        });

        // Links with confirmation
        $("a[confirm]").off("click").click(function() {
            return confirm($(this).attr("confirm"));
        });
    }
    // used globally in grid-view
    window.init_refresh_on_change = init_refresh_on_change;

    $(document).ready(function() {
        // Refresh events for form fields.
        init_refresh_on_change();

        // Tooltips
        if ($.fn.tooltip) {
            // Put tooltips below items in panel header so that they do not overlap masthead.
            $(".unified-panel-header [title]").tooltip({
                placement: "bottom"
            });

            // default tooltip initialization, it will follow the data-placement tag for tooltip location
            // and fallback to 'top' if not present
            $("[title]").tooltip();
        }
        // Make popup menus.
        _popupmenu2.default.make_popup_menus();

        // Replace big selects.
        replace_big_select_inputs(20, 1500);

        // If galaxy_main frame does not exist and link targets galaxy_main,
        // add use_panels=True and set target to self.
        $("a").click(function() {
            var anchor = $(this);
            var galaxy_main_exists = window.parent.frames && window.parent.frames.galaxy_main;
            if (anchor.attr("target") == "galaxy_main" && !galaxy_main_exists) {
                var href = anchor.attr("href");
                if (href.indexOf("?") == -1) {
                    href += "?";
                } else {
                    href += "&";
                }
                href += "use_panels=True";
                anchor.attr("href", href);
                anchor.attr("target", "_self");
            }
            return anchor;
        });

        _tours2.default.activeGalaxyTourRunner();

        function onloadWebhooks() {
            if (Galaxy.root !== undefined) {
                if (Galaxy.config.enable_webhooks) {
                    // Load all webhooks with the type 'onload'
                    _webhooks2.default.load({
                        type: "onload",
                        callback: function callback(webhooks) {
                            webhooks.each(function(model) {
                                var webhook = model.toJSON();
                                if (webhook.activate && webhook.script) {
                                    _utils2.default.appendScriptStyle(webhook);
                                }
                            });
                        }
                    });
                }
            } else {
                setTimeout(onloadWebhooks, 100);
            }
        }
        onloadWebhooks();
    });
});
//# sourceMappingURL=../maps/onload.js.map
