/**
 * @file balanceindex.js
 * @author xiaokl
 */
var balanceIndex = (function ($) {
    var BalanceIndex = function () {};

    BalanceIndex.prototype = {
        oPayoutTitle: {
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
                    field: 'action_label',
                    title: '类型'
                },
                {
                    field: 'revenue',
                    title: '发生金额'
                }
            ]
        },
        oRechargeTitle: {
            res: 0,
            msg: '操作成功',
            obj: {
                footer: [
                    '汇总',
                    '-',
                    '-',
                    '-',
                    '-'
                ]
            },
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
                    field: 'comment',
                    title: '交易来源'
                },
                {
                    field: 'contact_name',
                    title: '操作员'
                }
            ]
        },
        oInvoiceHistoryTitle: {
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
                    field: 'money',
                    title: '金额(元)'
                },
                {
                    field: 'title',
                    title: '发票抬头'
                },
                {
                    field: 'receiver',
                    title: '收件人'
                },
                {
                    field: 'address',
                    title: '地址'
                },
                {
                    field: 'status',
                    title: '状态'
                }
            ]
        },
        _fnInitHandle: function () { // 初始化操作
            $('ul.js-balanceTab').delegate('li', 'click', function (e) {
                $('ul.js-balanceTab li').removeClass('active');
                $(this).addClass('active');
            });
        },
        _fnInitBalance: function () { // 显示账户明细余额
            $.get(API_URL.balance_value, function (json) {
                var evalText = doT.template($('#tpl-overall').text());
                $('.overall').html(evalText(json));
            }, 'json');
        },
        _fnDrawCallbackRecharge: function () {
            var trigger;
            $('.rechargeMoney').hover(function (e) {
                var _this = $(this);
                trigger = setTimeout(function () {
                    if (_this.attr('data-on') === '1') {
                        Helper.load_ajax();
                        var param = {
                            invoice_id: dataTable.row(_this.parents('tr')[0]).data().invoice_id
                        };
                        $.get(API_URL.advertiser_balance_invoice, param, function (result) {
                            Helper.close_ajax();
                            if (result && result.res === 0 && result.list && result.list.length > 0) {
                                // 获取模版 tpl-recharge-money
                                _this.attr('data-on', '0');
                                result = $.extend(result, param);
                                _this.attr('data-content', doT.template($('#tpl-recharge-money').text())(result));
                                _this.popover('show');
                            }

                        });
                    }

                }, 400);
            }, function () {
                clearTimeout(trigger);
            });

            $('[data-toggle="popover"]').popover({
                html: true
            });
            $('[data-toggle="tooltip"]').tooltip();
        },
        _fnCustomColumn: function (td, sData, oData, row, col, table) {
            var thisCol = table.nameList[col];
            if (thisCol === 'money') {
                $(td).html(Helper.fnGetPopoverOrTooltip({
                    'class': 'rechargeMoney',
                    'data-on': '1',
                    'data-toggle': 'popover',
                    'data-trigger': 'hover',
                    'data-placement': 'top'
                }, '￥&nbsp;' + sData));
            }
            else if (thisCol === 'status') {
                if (oData.status === 3) {
                    $(td).html(Helper.fnGetPopoverOrTooltip({
                        'data-toggle': 'tooltip',
                        'data-trigger': 'hover',
                        'data-placement': 'top',
                        'title': oData.comment
                    }, oData.status_label + '&nbsp;<i class="fa fa-exclamation-circle"></i>'));
                }
                else {
                    $(td).html(oData.status_label);
                }
            }

        },
        _fnInitTable: function () {
            // 显示balanceTab项(推广金支出明细、充值明细、发票申请明细)
            // 根据url参数获取tab页
            var list = Helper.fnGetQueryParam('list');
            if (list === null || list === '') {
                list = 'payout';
            }

            $('.tabbox').html((doT.template($('#tpl-balance').text()))(list));
            // 初始化表格数据
            var objPostOpt = {
                fnCustomOper: function (json) {
                    if (json && json.res === 0 && json.obj) {
                        var oTFoot = this.find('tfoot tr td');
                        if (oTFoot) {
                            oTFoot.eq(2).html(json.obj.total);
                        }
                    }
                }
            };
            if (list === 'payout') {
                Helper.fnCreatTable('#js-balance-table', this.oPayoutTitle, API_URL.advertiser_balance_payout, function () {}, 'dataTable', objPostOpt);
            }
            else if (list === 'recharge') {
                Helper.fnCreatTable('#js-balance-table', this.oRechargeTitle, API_URL.advertiser_balance_recharge, function () {}, 'dataTable', objPostOpt);
            }
            else if (list === 'invoice_history') {
                $('#js-balance-table').after('<div class="remark">注：审核通过的，请联系媒体查询发票寄送状态。</div>');

                Helper.fnCreatTable('#js-balance-table', this.oInvoiceHistoryTitle, API_URL.advertiser_balance_invoice_history, this._fnCustomColumn, 'dataTable', $.extend({}, objPostOpt, {
                    fnDrawCallback: this._fnDrawCallbackRecharge
                }));
            }

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
