/**
 *  @file campaign-editable.js
 *  @author xiaokl
 */
(function ($) {
    'use strict';
    $.fn.campaignutils = {
        bindLimitOper: function (obj, func) {
            obj.on('click', 'input[name=total_limit_check]', function () {
                if ($(this).is(':checked')) {
                    $(this).parents('.js-totallimit-div').find('input[name=total_limit]').attr('disabled', true);
                }
                else {
                    $(this).parents('.js-totallimit-div').find('input[name=total_limit]').attr('disabled', false);
                }
            });
        }
    };
})(window.jQuery);
(function ($) {
    'use strict';
    var LimitEdit = function (options) {
        this.init('limitedit', options, LimitEdit.defaults);
    };

     // inherit from Abstract input
    $.fn.editableutils.inherit(LimitEdit, $.fn.editabletypes.abstractinput);

    $.extend(LimitEdit.prototype, {
        /*
            加载模版表单对象
        */
        render: function () {
            $.fn.campaignutils.bindLimitOper(this.$input);
            this.$input.find('input[name=total_limit]').attr('datamax', this.options.datamax);
        },
        value2input: function (value) {
            if (parseInt(value, 10) === 0) {
                this.$input.find('input[name=total_limit_check]').prop('checked', true);
                this.$input.find('input[name=total_limit]').val('').attr('disabled', true);
            }
            else {
                this.$input.find('input[name=total_limit]').val(value);
            }
        },
        input2value: function () {
            // 设置总预算
            if (this.$input.find('input[name=total_limit_check]:checked').length === 0) {
                var limitObj = this.$input.find('input[name=total_limit]');
                var iVal  = parseInt(limitObj.val(), 10);
                var iMax = parseInt(limitObj.attr('datamax'), 10);
                if (isNaN(iVal) || iVal <= 200 || iVal > iMax) {
                    return ',' + iMax;
                }
                return iVal;
            }
            return 0;
        }
    });

    LimitEdit.defaults = {
        tpl: '<div class="js-totallimit-div">'
            + '<input type="text" class="form-control" name="total_limit" onkeyup="value=value.replace(/[^\\d]/g,\'\')"'
            + ' placeholder="输入大于200的整数" maxlength="32">'
            + '<label class="checkbox-inline" style="margin-left:4px;"><input type="checkbox" name="total_limit_check" data-name="total_limit_check">不限</label></div>',
        inputclass: '',
        datamax: ''
    };

    $.fn.editabletypes.limitedit = LimitEdit;
}(window.jQuery));
