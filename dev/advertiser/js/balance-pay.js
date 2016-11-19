/**
 * @file balance-pay.js
 * @author xiaokl
 */
var pay = (function ($) {
    var Pay = function () {};

    Pay.prototype = {
        fnInit: function () {
            // 获取活动消息
            $.get(API_URL.advertiser_pay_activity, function (json) {
                var evalText = doT.template($('#tpl-activity').text());
                $('#js-activity').html(evalText(json));
            });

            // 显示充值金额表单
            $('#js-recharge').html(doT.template($('#tpl-recharge').text())({
                payUrl: API_URL.advertiser_pay
            }));
            $('#js-rechargeForm').delegate('#js-payMoney', 'focus', function () {
                $('#js-rechargeOther').prop('checked', true);
            });
            // 自定义表单验证
            $.fn.validation.addMethod('isPayMoney', function (value) {
                if ($('#js-rechargeOther').filter(':checked').length > 0) {
                    var money = $('#js-payMoney').val();
                    if (money.length === 0 || parseInt(money, 10) < 2000) {
                        return true;
                    }
                }
                return false;
            }, '请输入整数，最少2000元');

            this._fnAfterPay();

            Helper.fnInitValid('js-rechargeForm', 'js-submitRecharge', function () {
                $.fn.modalable.show();
            });
        },
        _fnAfterPay: function () { // 点击下一步后的操作
            $('#js-submitRecharge').modalable({
                type: 'others',
                title: '提示信息',
                autoshow: false,
                showBody: false,
                cancelButton: '支付失败, 重新支付',
                submitButton: '支付成功',
                submitUrl: 'index.html?list=recharge'
            });
        }
    };
    return new Pay();
})(window.jQuery);
$(function () {
    pay.fnInit();
});
