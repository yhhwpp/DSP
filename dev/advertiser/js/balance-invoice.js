 /**
 * @file balance-invoice.js
 * @description 申请发票
 * @author xiaokl
 */
var balanceInvoice = (function ($) {
    var BalanceInvoice = function () {
        this.invoiceModel = new $.fn.invoicemodel.Model();
    };

    BalanceInvoice.prototype = {
        oRechargeInvoiceTitle: {
            res: 0,
            msg: '操作成功',
            obj: null,
            map: null,
            list: [
                {
                    field: 'create_time',
                    title: '操作时间'
                },
                {
                    field: 'action_label',
                    title: '类型'
                },
                {
                    field: 'amount',
                    title: '发生金额'
                },
                {
                    field: 'status_label',
                    title: '发票状态'
                },
                {
                    field: 'status',
                    title: '选择'
                }
            ]
        },
        fnInit: function () {
            this._fnInitTable(); // 初始化充值明细表格
            this._fnInitForm(); // 初始化表单页面
        },
        _fnInitTable: function () {
            Helper.fnCreatTable('#js-invoice-table', this.oRechargeInvoiceTitle, API_URL.advertiser_balance_recharge_invoice, this._fnCustomColumn, 'dataTable', {
                searching: false
            });
        },
        _fnCustomColumn: function (td, sData, oData, row, col, table) {
            var thisCol = table.nameList[col];
            if (thisCol === 'status') {
                if (sData === CONSTANT.invoice_status_apply) {
                    $(td).html('-');
                }
                else {
                    $(td).html('<input type="checkbox" name="check_money"/>');
                }
            }

        },
        _fnInitFormShow: function () { // 初始化表单加载
            $('#js-invoice-form').html(doT.template($('#tpl-invoiceform').text())({
                invoiceModel: this.invoiceModel.data
            }));
            this._fnInitHandle();
        },
        _fnInitForm: function () {
            var _this = this;
            $.get(API_URL.invoice_receiver_info, function (json) {
                if (json && json.res === 0) {
                    $('#js-invoice-form').html(doT.template($('#tpl-invoiceform').text())({
                        invoiceModel: $.extend({}, _this.invoiceModel.data, json.obj)
                    }));

                    _this._fnInitHandle(json.obj);
                    _this = null;
                }
                else {
                    _this._fnInitFormShow();
                    _this = null;
                }
            }).fail(function () {
                _this._fnInitFormShow();
                _this = null;
            });
        },
        _fnInitHandle: function (data) {
            $('#js-citySelect').citySelect($.extend({
                prov: '北京',
                city: '东城区',
                dist: '',
                nodata: 'none'
            }, data || {}));

            $('#js-invoice-table').delegate('input[name="check_money"]', 'click', function () { // invoiceMoney
                var nMoney = 0;
                var index = 0;
                $('input[name="check_money"]:checked').each(function () {
                    index++;
                    nMoney += Number(dataTable.row($(this).parents('tr')[0]).data().amount);
                });
                if (index > 0) {
                    $('input[name="invoiceMoney"]').val(nMoney.toFixed(2)).trigger('blur');
                }
                else {
                    $('input[name="invoiceMoney"]').val(null).trigger('blur');
                }
            });
            $('#js-invoice-form').delegate('#cancelForm', 'click', function () {
                $('input[name="check_money"]').removeAttr('checked');
            });
            var _this = this;

            Helper.fnInitValid('js-invoice-form', 'js-submit', function () {
                _this._fnSubmit();
            });
        },
        _fnSubmit: function () {
            Helper.load_ajax();
            this.invoiceModel.setData('title', $('input[name="title"').val());
            this.invoiceModel.setData('type', $('select[name="type"').val());
            this.invoiceModel.setData('prov', $('select[name="prov"').val());
            this.invoiceModel.setData('city', $('select[name="city"').val());
            this.invoiceModel.setData('dist', $('select[name="dist"').val());
            this.invoiceModel.setData('address', $('input[name="address"').val());
            this.invoiceModel.setData('receiver', $('input[name="receiver"').val());
            this.invoiceModel.setData('tel', $('input[name="tel"').val());
            var ids = [];
            $('input[name="check_money"]:checked').each(function () {
                ids.push(dataTable.row($(this).parents('tr')[0]).data().id);
            });
            this.invoiceModel.setData('ids', ids.join(','));
            this.invoiceModel.save({
                url: API_URL.invoice_store,
                data: this.invoiceModel.getPostData()
            }, function (json) {
                Helper.close_ajax();
                if (json && json.res === 0) {
                    location.href = 'index.html?list=invoice_history';
                }
                else {
                    Helper.fnPrompt(json.msg);
                }
            });
        }
    };

    return new BalanceInvoice();
})(jQuery);
$(function () {
    balanceInvoice.fnInit();
});
