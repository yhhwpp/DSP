/**
 * @file advertisermodel.js
 * @author xiaokl
 * @description 广告主管理model
 */
(function ($) {
    'use strict';

    $.fn.advertisermodel = function () {};

    var AdvertiserModel = function (data) {
        this.data = $.extend({}, AdvertiserModel.defaults, data || {});
    };

    $.fn.basemodelutils.inherit(AdvertiserModel, $.fn.basemodel.abstractmodel);

    $.extend(AdvertiserModel.prototype, {
        setAdModel: function (formObj) {
            var inputObj;
            for (var key in AdvertiserModel.defaults) {
                inputObj = formObj.find('[data-name=' + key + ']');
                if (inputObj && inputObj.length > 0) {
                    if (key === 'revenue_type') {
                        var aryRevenueType = 0;
                        /* eslint no-loop-func: [0]*/
                        formObj.find('[data-name=' + key + ']:checked').each(function () {
                            aryRevenueType += parseInt($(this).val(), 10);
                        });
                        this.setData(key, aryRevenueType);
                    }
                    else {
                        this.setData(key, inputObj.val());
                    }
                }
                inputObj = null;
            }
        }
    });

    AdvertiserModel.defaults = {
        clientname: '', // 广告主名称
        brief_name: '', // 广告主简称
        username: '', // 登录账号
        password: '', // 密码
        contact: '', // 联系人
        email: '', // 邮箱
        phone: '', // 手机号
        qq: '', // QQ
        revenue_type: '' // 计费类型
    };

    $.extend($.fn.advertisermodel, {
        Model: AdvertiserModel
    });

}(window.jQuery));
