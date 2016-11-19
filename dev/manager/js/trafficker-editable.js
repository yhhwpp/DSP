/**
 *  @file trafficker-editable.js
 *  @author xiaokl
 */
(function ($) {
    'use strict';
    $.fn.trafutils = {
        bindIncomeOper: function (obj, func) {
            obj.on('focus', '[name=income-custom-input]', function () {
                obj.find('input.income-custom').prop('checked', true);
            });
            obj.on('blur', '[name=income-custom-input]', function () {
                var v = parseFloat($.trim($(this).val()));
                if (isNaN(v) || v < 0) {
                    v = 0;
                }
                if (v > 100) {
                    v = 100;
                }
                v = v.toFixed(2);
                $(this).val(v);
                obj.find('input.income-custom').val(v);
                func && func.call();
            });
            obj.on('click', '[name=income_rate]', function () {
                if (!$(this).hasClass('income-custom')) {
                    obj.find('input.income-custom').val('');
                    obj.find('input[name=income-custom-input]').val('');
                }
                func && func.call();
            });
        },
        getDelivery: function (obj) {
            var aryDelivery = [];
            var iAdtype = 0;
            var iRevnue = 0;
            // var bRatio = false;
            obj.find('input[name=ad_type]:checked').each(function () {
                iAdtype++;
                var adType = $(this).val();
                obj.find('.js-adtype' + $(this).val() + ' input[name=revenue_type]:checked').each(function () {
                    var objDelivery = {};
                    objDelivery.ad_type = adType;
                    objDelivery.revenue_type = $(this).val();
                    iRevnue++;
                    // if (parseInt($(this).val(), 10) === CONSTANT.revenue_type_cpd) {
                    //     objDelivery.num = 1;
                    // }
                    // else {
                    //     var iNum = $(this).next('[name=num]').val();
                    //     if (isNaN(parseInt(iNum, 10)) || parseInt(iNum, 10) < 1 || parseInt(iNum, 10) > 1000) {
                    //         bRatio = true;
                    //         return;
                    //     }
                    //     objDelivery.num = iNum;
                    // }
                    aryDelivery.push(objDelivery);
                });
                if (iRevnue === 0) {
                    return;
                }
            });
            if (iAdtype === 0 || aryDelivery.length === 0) {
                return null;
            }
            if (iRevnue === 0) {
                return 'revenue_type';
            }
            // if (bRatio) {
            //     return 'num';
            // }
            return JSON.stringify(aryDelivery);
        },
        bindDeliveryOper: function (obj, func) {
            obj.on('click', 'input[name=ad_type]', function () {
                if (this.checked) {
                    obj.find('.js-adtype' + $(this).val() + ' input[name=revenue_type]').eq(0).prop('checked', true);
                }
                else {
                    obj.find('.js-adtype' + $(this).val() + ' input[name=revenue_type]').prop('checked', false);
                    // obj.find('.js-adtype' + $(this).val() + ' input[name=num]').val('');
                }
                func && func.call();
            });
            obj.on('click', 'input[name=revenue_type]', function () {
                if (this.checked) {
                    obj.find('input[name=ad_type][value=' + $(this).parents('.revenuetype-checkbox').attr('data-adtype') + ']').prop('checked', true);
                }
                // else {
                //     if (parseInt(this.value, 10) !== CONSTANT.revenue_type_cpd) {
                //         $(this).next('[name=num]').val('');
                //     }
                // }
                func && func.call();
            });
            // obj.on('focus', 'input[name=num]', function () {
            //     $(this).prev().prop('checked', true);
            //     obj.find('input[name=ad_type][value=' + $(this).prev().parents('.revenuetype-checkbox').attr('data-adtype') + ']').prop('checked', true);
            // });
            // obj.on('blur', 'input[name=num]', function () {
            //     func && func.call();
            // });
        },
        bindModeOper: function (obj, func) {
            obj.on('change', 'select[name=mode]', function () {
                if (parseInt($(this).val(), 10) === 3) {
                    obj.find('.js-audit').show();
                }
                else {
                    obj.find('.js-audit').hide();
                }
            });
        }
    };
})(window.jQuery);
(function ($) {
    'use strict';
    var IncomeRateEdit = function (options) {
        this.init('rateedit', options, IncomeRateEdit.defaults);
    };

     // inherit from Abstract input
    $.fn.editableutils.inherit(IncomeRateEdit, $.fn.editabletypes.abstractinput);

    $.extend(IncomeRateEdit.prototype, {
        /*
            加载模版表单对象
        */
        render: function () {
            $.fn.trafutils.bindIncomeOper(this.$input);
        },
        value2input: function (value) {
            if (!value) {
                return;
            }
            var iCheck = 0;
            this.$input.find('input[name=income_rate]').each(function () {
                if (Number(value) === Number($(this).val())) {
                    iCheck++;
                    $(this).prop('checked', true);
                    return;
                }
            });
            if (iCheck === 0) {
                this.$input.find('input.income-custom').val(value).prop('checked', true);
                this.$input.find('input[name=income-custom-input]').val(value);
            }
        },
        input2value: function () {
            var nRate = this.$input.find('input[name=income_rate]:checked').val();
            return nRate;
        }
    });

    IncomeRateEdit.defaults = $.extend({}, $.fn.editabletypes.abstractinput.defaults, {
        tpl: '',
        inputclass: null,
        separator: ','
    });
    $.fn.editabletypes.rateedit = IncomeRateEdit;
}(window.jQuery));
(function ($) {
    'use strict';
    var DeliveryEdit = function (options) {
        this.init('deliveryedit', options, DeliveryEdit.defaults);
    };

     // inherit from Abstract input
    $.fn.editableutils.inherit(DeliveryEdit, $.fn.editabletypes.abstractinput);

    $.extend(DeliveryEdit.prototype, {
        /*
            加载模版表单对象
        */
        render: function () {
            $.fn.trafutils.bindDeliveryOper(this.$input);
        },
        value2input: function (value) {
            if (value) {
                var objDelivery = value.delivery;
                var objPlatform = value.app_platform;
                if (objDelivery) {
                    for (var i = 0, j = objDelivery.length; i < j; i++) {
                        if ($.inArray(objDelivery[i].ad_type, CONSTANT.ad_type_no_done) > -1) {
                            continue;
                        }
                        this.$input.find('[name=ad_type][value=' + objDelivery[i].ad_type + ']').prop('checked', true);
                        var oRevenueType = this.$input.find('.js-adtype' + objDelivery[i].ad_type + ' [name=revenue_type][value=' + objDelivery[i].revenue_type + ']');
                        oRevenueType.prop('checked', true);
                        // oRevenueType.next('[name=num]').val(value[i].num);
                    }
                }
                if (objPlatform) {
                    if ($.inArray(CONSTANT.platform_type_android, objPlatform) > -1) {
                        this.$input.find('.js-adtype71-div').hide();
                        this.$input.find('input[name=ad_type][value=' + CONSTANT.ad_type_app_store + ']').prop('checked', false);
                        this.$input.find('.js-adtype71 input[name=revenue_type]').prop('checked', false);
                    }
                    else if ($.inArray(CONSTANT.platform_type_iphone_copyright, objPlatform) > -1
                            || $.inArray(CONSTANT.platform_type_ipad, objPlatform) > -1) {
                        this.$input.find('.js-adtype71-div').show();
                    }
                    else {
                        this.$input.find('.js-adtype71-div').hide();
                        this.$input.find('input[name=ad_type][value=' + CONSTANT.ad_type_app_store + ']').prop('checked', false);
                        this.$input.find('.js-adtype71 input[name=revenue_type]').prop('checked', false);
                    }
                }
            }
        },
        input2value: function () {
            return $.fn.trafutils.getDelivery(this.$input);
        }
    });

    DeliveryEdit.defaults = {
        tpl: '',
        inputclass: ''
    };

    $.fn.editabletypes.deliveryedit = DeliveryEdit;
}(window.jQuery));
(function ($) {
    'use strict';
    var ModeEdit = function (options) {
        this.init('modeedit', options, ModeEdit.defaults);
    };

     // inherit from Abstract input
    $.fn.editableutils.inherit(ModeEdit, $.fn.editabletypes.abstractinput);

    $.extend(ModeEdit.prototype, {
        /*
            加载模版表单对象
        */
        render: function () {
            $.fn.trafutils.bindModeOper(this.$input);
        },
        value2input: function (value) {
            if (!value) {
                return;
            }
            $('.js-mode-div select[name=mode]').val(value.mode);
            if (+value.mode === CONSTANT.mode_storage_no) {
                $('.js-mode-div .js-audit').show();
                $('.js-mode-div input[name=audit][value=' + value.audit + ']').prop('checked', true);
            }
            else {
                $('.js-mode-div .js-audit').hide();
            }
        },
        input2value: function () {
            var mode = $('.js-mode-div select[name=mode]').val();
            if (!mode) {
                return null;
            }
            if (+mode === CONSTANT.mode_storage_no) {
                var audit = $('.js-mode-div input[name=audit]:checked').val();
                if (!audit) {
                    return 'mode';
                }
                return mode + '|' + audit;
            }
            return mode + '|' + '1';
        }
    });

    ModeEdit.defaults = {
        tpl: '',
        inputclass: ''
    };

    $.fn.editabletypes.modeedit = ModeEdit;
}(window.jQuery));
