/**
 * @file balance-withdraw.js
 * @author hehe
 */
var balanceWithdraw = (function ($) {
    var BalanceWithdraw = function () {};
    BalanceWithdraw.prototype = {
        _fnInitPage: function () {
            var _this = this;
            var $form = $('.widthdraw .form-horizontal');
            $.get(API_URL.trafficker_draw_balance, function (a) {
                0 === a.res && ($('.draw-balance').html(a.obj.balance), _this.balance = a.obj.balance);
                $('.widthdraw .form-horizontal').html($.tmpl('#tpl-widthdraw', _this));
                if (_this.balance > 0) {
                    $.fn.validation.addMethod('checkmoney', function (value) {
                        if (value > +$('.draw-balance').text() || value < 0) {
                            return true;
                        }
                        return false;
                    }, '请输入小于等于余额的提款金额');
                    $form.validation();
                }
            });
            $('.widthdraw').delegates({
                '.js-widthdraw-submit': function () {
                    if (_this.balance > 0) {
                        if (!$form.valid()) {
                            return !1;
                        }
                        $.post(API_URL.trafficker_balance_draw, $form.serializeJson(), function (response) {
                            0 === response.res ? (Helper.fnPrompt(response.msg, window.location.href)) : Helper.fnPrompt(response.msg);
                        });
                    }
                },
                '.js-widthdraw-reset': function () {
                    $form[0].reset();
                    $('.help-block').remove();
                }
            });
        },
        fnInit: function () {
            this._fnInitPage();
        }
    };
    return new BalanceWithdraw();
})(window.jQuery);
$(function () {
    balanceWithdraw.fnInit();
});
