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
                    field: 'day_time',
                    title: '操作时间'
                },
                {
                    field: 'type',
                    title: '类型',
                    label: 'type_label'
                },
                {
                    field: 'money',
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
            Helper.fnCreatTable('#js-invoice-table', this.oRechargeInvoiceTitle, API_URL.broker_balance_apply, this._fnCustomColumn, 'dataTable', {
                ajaxOptions: {
                    type: 'GET'
                },
                postData: {
                    page_type: 'invoice'
                },
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
            this._fnInitFormShow();
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
                    nMoney += Number(dataTable.row($(this).parents('tr')[0]).data().money);
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
                url: API_URL.broker_balance_invoice_store,
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
