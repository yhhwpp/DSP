/**
 *  @file advertiser-editable.js
 *  @author xiaokl
 */
(function ($) {
    'use strict';
    var RevenueTypeEdit = function (options) {
        this.init('revenuetypeedit', options, RevenueTypeEdit.defaults);
    };

     // inherit from Abstract input
    $.fn.editableutils.inherit(RevenueTypeEdit, $.fn.editabletypes.checkbox);

    $.extend(RevenueTypeEdit.prototype, {
        /*
            加载模版表单对象
        */
        render: function () {
        },
        value2input: function (value) {
            this.$input.find('input[name=revenue_type]').prop('checked', false);
            if ($.isArray(value) && value.length) {
                this.$input.find('input[name=revenue_type]').each(function (i, el) {
                    var $el = $(el);
                    $.each(value, function (j, val) {
                        if ((+$el.val()) === (+val)) {
                            $el.prop('checked', true);
                        }
                    });
                });
            }
        },
        input2value: function () {
            var iRevenueType = 0;
            this.$input.find('input[name=revenue_type]').filter(':checked').each(function (i, el) {
                iRevenueType += parseInt($(el).val(), 10);
            });
            return iRevenueType;
        }
    });

    RevenueTypeEdit.defaults = {
        tpl: '',
        inputclass: ''
    };

    $.fn.editabletypes.revenuetypeedit = RevenueTypeEdit;
}(window.jQuery));
