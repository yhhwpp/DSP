/**
 * @file invoicemodel.js
 * @description 发票申请记录model
 * @author xiaokl
 */
(function ($) {
    'use strict';

    $.fn.invoicemodel = function () {};

    var InvoiceModel = function (data) {
        this.data = $.extend({}, InvoiceModel.defaults, data || {});
    };

    $.fn.basemodelutils.inherit(InvoiceModel, $.fn.basemodel.abstractmodel);

    InvoiceModel.defaults = {
        prov: '', // 省
        city: '', // 市
        dist: '', // 地区
        address: '', // 详细地址
        receiver: '', // 收件人
        tel: '', // 手机号
        title: null, // 发票抬头
        ids: null, // 发票ids
        type: null // 发票类弄
    };

    $.extend($.fn.invoicemodel, {
        Model: InvoiceModel
    });

}(window.jQuery));
