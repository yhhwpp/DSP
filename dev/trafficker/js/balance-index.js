/**
 * @file balance-index.js
 * @author xiaokl
 */
var balanceIndex = (function ($) {
    var BalanceIndex = function () {};

    BalanceIndex.prototype = {
        oWithdrawTitle: {
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
                    field: 'pay_type_label',
                    title: '类型'
                },
                {
                    field: 'money',
                    title: '发生金额'
                },
                {
                    field: 'bank',
                    title: '交易对象'
                },
                {
                    field: 'contact_name',
                    title: '操作员'
                },
                {
                    field: 'status',
                    title: '状态',
                    label: 'status_label'
                }
            ]
        },
        oSettlementTitle: {
            res: 0,
            msg: '操作成功',
            obj: {
                footer: [
                    '汇总',
                    '-',
                    '-'
                ]
            },
            map: null,
            list: [
                {
                    field: 'day_time',
                    title: '操作时间'
                },
                {
                    field: 'type_label',
                    title: '类型'
                },
                {
                    field: 'amount',
                    title: '发生金额'
                }/* ,
                {
                    field: 'blance',
                    title: '账号余额'
                }*/
            ]
        },
        oIncomeTitle: {
            res: 0,
            msg: '操作成功',
            obj: {
                footer: [
                    '汇总',
                    '-',
                    '-'
                ]
            },
            map: null,
            list: [
                {
                    field: 'day_time',
                    title: '日期'
                },
                {
                    field: 'type_label',
                    title: '类型'
                },
                {
                    field: 'amount',
                    title: '发生金额'
                }
            ]
        },
        _fnInitHandle: function () { // 初始化操作
            $('ul.js-balance-tab').delegate('li', 'click', function (e) {
                $('ul.js-balance-tab li').removeClass('active');
                $(this).addClass('active');
            });
        },
        _fnInitBalance: function () { // 显示账户明细余额
            $.get(API_URL.trafficker_common_balance_value, function (json) {
                if (json && json.res === 0) {
                    $('.js-balance-total').html(json.obj.balance_total);
                    $('.js-balance').html(json.obj.balance);
                }
            }, 'json');
        },
        _fnInitTable: function () {
            // 显示balanceTab项(提款明细、结算明细、收入明细)
            // 根据url参数获取tab页
            var option = Helper.fnGetQueryParam('option');
            if (option === null || option === '') {
                option = 'withdraw';
            }
            $('.tabbox').html((doT.template($('#tpl-trafficker-balance').text()))(option));
            // 初始化表格数据
            var objPostOpt = {
                searching: false,
                ajaxOptions: {
                    type: 'GET'
                },
                postData: {
                    option: option
                }
            };
            var _fnCustomColumn;
            var oTitle = this.oWithdrawTitle;
            var sUrl = '';
            if (option === 'withdraw') {
                oTitle = this.oWithdrawTitle;
                sUrl = API_URL.trafficker_balance_withdraw;
                _fnCustomColumn = function (td, sData, oData, row, col, table) {
                    var thisCol = table.nameList[col];
                    if (thisCol === 'bank') {
                        $(td).html('开户行：' + oData.bank + '<br />账户名：' + oData.payee + '<br />账号：' + oData.bank_account);
                    }
                };
            }
            else if (option === 'settlement') {
                oTitle = this.oSettlementTitle;
                sUrl = API_URL.trafficker_balance_settlement;
                _fnCustomColumn = function () {};
                objPostOpt = $.extend({}, objPostOpt, {
                    fnCustomOper: function (json) {
                        if (json && json.res === 0 && json.obj) {
                            var oTFoot = this.find('tfoot tr td');
                            if (oTFoot) {
                                oTFoot.eq(2).html(json.obj.total);
                            }
                        }
                    }
                });
            }
            else if (option === 'income') {
                oTitle = this.oIncomeTitle;
                sUrl = API_URL.trafficker_balance_income;
                _fnCustomColumn = function () {};
            }
            Helper.fnCreatTable('#js-balance-table', oTitle, sUrl, _fnCustomColumn, 'dataTable', objPostOpt);
        },
        fnInit: function () {
            this._fnInitBalance();
            this._fnInitTable();
            this._fnInitHandle();
        }
    };

    return new BalanceIndex();
})(window.jQuery);
$(function () {
    balanceIndex.fnInit();
});
