/**
 * @file income-index.js
 * @author xiaokl
 * @description 广告主代理商/赠送申请
 */
var incomeIndex = (function ($) {
    var IncomeIndex = function () {};
    IncomeIndex.prototype = {
        oIncomeTitle: {
            res: 0,
            obj: {
                footer: [
                    '汇总',
                    '-',
                    '-',
                    '-'
                ]
            },
            list: [
                {
                    field: 'create_time',
                    title: '申请时间'
                },
                {
                    field: 'pay_type',
                    title: '类型'
                },
                {
                    field: 'name',
                    title: '交易对象'
                },
                {
                    field: 'amount',
                    title: '发生金额',
                    render: $.fn.dataTable.render.number(',', '.', 2, '')
                }
            ]
        },
        _fnCustomOper: function (json) {
            if (json && json.res === 0 && json.obj) {
                var oTFoot = this.find('tfoot tr td');
                if (oTFoot) {
                    oTFoot.eq(3).html('<span class="text-danger">收入：+' + (json.obj.total_income === '' ? '0.00' : Helper.fnFormatMoney(json.obj.total_income, 2)) + '</span><br/><span class="text-success">支出：-' + (json.obj.total_pay === '' ? '0.00' : Helper.fnFormatMoney(json.obj.total_pay, 2)) + '</span>');
                }
            }
        },
        _fnCustomColumn: function (td, sData, oData, row, col, table) {
            var thisCol = table.nameList[col];
            if (thisCol === 'pay_type') {
                var sHtml = '未知类型';
                if (oData.pay_type === 0 && oData.balance_type === 0 && oData.client_type === 0) {
                    sHtml = '广告主在线充值';
                }
                else if (oData.pay_type === 1 && oData.balance_type === 0 && oData.client_type === 0) {
                    sHtml = '广告主线下充值';
                }
                else if (oData.pay_type === 0 && oData.balance_type === 0 && oData.client_type === 1) {
                    sHtml = '代理商在线充值';
                }
                else if (oData.pay_type === 1 && oData.balance_type === 0 && oData.client_type === 1) {
                    sHtml = '代理商线下充值';
                }
                else if (oData.pay_type === 0 && oData.balance_type === 1) {
                    sHtml = '赠送推广金';
                }
                else if (oData.pay_type === 2 && oData.balance_type === 2) {
                    sHtml = '媒体分成月结';
                }
                else if (oData.pay_type === 3 && oData.balance_type === 3) {
                    sHtml = '赠送推广金充值';
                }
                $(td).html(sHtml);
            }
        },
        fnInit: function () {
            var self = this;
            Helper.fnCreatTable('#js-balance-table', this.oIncomeTitle, API_URL.manager_balance_income_index, function (td, sData, oData, row, col, table) {
                self._fnCustomColumn(td, sData, oData, row, col, table);
            }, 'dataTable', {
                fnCustomOper: this._fnCustomOper
            });
        }
    };
    return new IncomeIndex();
})(window.jQuery);
$(function () {
    incomeIndex.fnInit();
});
