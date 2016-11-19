/**
 * @file traffickermodel.js
 * @author xiaokl
 * @description 广告主管理model
 */
(function ($) {
    'use strict';

    $.fn.traffickermodel = function () {};

    var TraffickerModel = function (data) {
        this.data = $.extend({}, TraffickerModel.defaults, data || {});
    };

    $.fn.basemodelutils.inherit(TraffickerModel, $.fn.basemodel.abstractmodel);

    $.extend(TraffickerModel.prototype, {
        setTraffModel: function (formObj) {
            var inputObj;
            for (var key in TraffickerModel.defaults) {
                inputObj = formObj.find('[data-name=' + key + ']');
                if (inputObj && inputObj.length > 0) {
                    this.setData(key, inputObj.val());
                }
                inputObj = null;
            }
        }
    });

    TraffickerModel.defaults = {
        username: '', // 登录账号
        password: '', // 密码
        name: '', // 媒体全称
        brief_name: '', // 媒体简称
        contact: '', // 联系人
        email: '', // 邮箱
        contact_phone: '', // 手机号
        qq: '', // QQ
        creator_uid: '' // 销售
    };

    $.extend($.fn.traffickermodel, {
        Model: TraffickerModel
    });

}(window.jQuery));
