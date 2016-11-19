/**
 * @file accountmodel.js
 * @author xiaokl
 * @description 账号管理model
 */
(function ($) {
    'use strict';

    $.fn.accountmodel = function () {};

    var AccountModel = function (data) {
        this.data = $.extend({}, AccountModel.defaults, data || {});
    };

    $.fn.basemodelutils.inherit(AccountModel, $.fn.basemodel.abstractmodel);

    AccountModel.defaults = {
        username: '', // 登录账号
        password: '', // 密码
        contact_name: '', // 联系人
        email_address: '', // 邮箱
        phone: '', // 手机号
        qq: '', // QQ
        account_sub_type_id: null, // 部门
        operation_list: null // 权限
    };

    $.extend($.fn.accountmodel, {
        Model: AccountModel
    });

}(window.jQuery));
