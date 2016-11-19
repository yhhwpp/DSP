/**
 * @file balance-index.js
 * @author xiaokl
 */
var balanceIndex = (function ($) {
    var BalanceIndex = function () {
        this.balanceObj = {};
        this.type = '';
    };

    BalanceIndex.prototype = {
        oPayoutTitle: {
            res: 0,
            msg: '操作成功',
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
                    field: 'day_time',
                    title: '日期'
                },
                {
                    field: 'revenue',
                    title: '总支出'
                },
                {
                    field: 'price',
                    title: '充值金支出'
                },
                {
                    field: 'gift',
                    title: '赠送金支出'
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
                    '-'
                ]
            },
            list: [
                {
                    field: 'create_time',
                    title: '操作时间'
                },
                {
                    field: 'amount',
                    title: '充值金额(元)'
                },
                {
                    field: 'type_label',
                    title: '充值类型'
                },
                {
                    field: 'contact_name',
                    title: '操作员'
                }
            ]
        },
        oGiftTitle: {
            res: 0,
            msg: '操作成功',
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
                    title: '操作时间'
                },
                {
                    field: 'amount',
                    title: '赠送金额(元)'
                },
                {
                    field: 'comment',
                    title: '赠送原因'
                },
                {
                    field: 'contact_name',
                    title: '操作员'
                }
            ]
        },
        _fnInitBalance: function () { // 显示账户明细余额
            var _this = this;
            if (!(_this.balanceObj && _this.balanceObj.res === 0)) {
                $.get(API_URL.balance_value, function (json) {
                    if (json && json.res === 0) {
                        _this.balanceObj = json;
                    }
                    var evalText = doT.template($('#tpl-overall').text());
                    $('.overall').html(evalText(json));
                }, 'json');
            }
        },
        _fnInitTable: function () {
            if (typeof dataTable === 'object') {
                dataTable.destroy();
                $('#js-balance-table').empty();
            }
            var _type = this.type;
            var _title = this.oPayoutTitle;
            var _url = API_URL.advertiser_balance_payout;
            // 初始化表格数据
            var _postOpt = {
                fnCustomOper: function (json) {
                    if (json && json.res === 0 && json.obj) {
                        var oTFoot = this.find('tfoot tr td');
                        if (oTFoot) {
                            oTFoot.eq(1).html(json.obj.total);
                            oTFoot.eq(2).html(json.obj.priceTotal);
                            oTFoot.eq(3).html(json.obj.giftTotal);
                        }
                    }
                }
            };
            if (_type === 'recharge' || _type === 'gift') {
                _title = this.oRechargeTitle;
                if (_type === 'gift') {
                    _title = this.oGiftTitle;
                }
                _url = API_URL.advertiser_balance_self_recharge;
                _postOpt = {
                    fnCustomOper: function (json) {
                        if (json && json.res === 0 && json.obj) {
                            var oTFoot = this.find('tfoot tr td');
                            if (oTFoot) {
                                oTFoot.eq(1).html(json.obj.total);
                            }
                        }
                    },
                    postData: {
                        type: _type
                    }
                };
            }
            Helper.fnCreatTable('#js-balance-table', _title, _url, function () {}, 'dataTable', _postOpt);
        },
        _fnInitHandle: function () {
            var _this = this;
            $('#js-balance-tab').delegate('li', 'click', function () {
                _this.type = $(this).attr('role');
                // 移除active
                $('#js-balance-tab li').removeClass('active');
                $(this).addClass('active');
                _this._fnInitBalance();
                _this._fnInitTable();
            });
            $('#js-balance-tab li[role=payout]').trigger('click');
        },
        fnInit: function () {
            this._fnInitHandle();
        }
    };

    return new BalanceIndex();
})(window.jQuery);
$(function () {
    balanceIndex.fnInit();
});
