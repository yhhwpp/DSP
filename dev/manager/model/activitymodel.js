/**
 * @file activitymodel.js
 * @author xiaokl
 * @description 活动管理model
 */
(function ($) {
    'use strict';

    $.fn.activitymodel = function () {};

    var ActivityModel = function (data) {
        this.data = $.extend({}, ActivityModel.defaults, data || {});
    };

    $.fn.basemodelutils.inherit(ActivityModel, $.fn.basemodel.abstractmodel);

    $.extend(ActivityModel.prototype, {
        setModel: function (formObj) {
            var inputObj;
            for (var key in ActivityModel.defaults) {
                inputObj = formObj.find('[data-name=' + key + ']');
                if (inputObj && inputObj.length > 0) {
                    this.setData(key, inputObj.val());
                }
                inputObj = null;
            }
        }
    });

    ActivityModel.defaults = {
        id: 0, // 主键
        title: '', // 活动名称
        imageurl: '', // 活动图片
        startdate: '', // 活动开始日期
        enddate: '', // 活动结束日期
        content: '', // 活动规则说明
        role: 'A' // 角色
    };

    $.extend($.fn.activitymodel, {
        Model: ActivityModel
    });

}(window.jQuery));
