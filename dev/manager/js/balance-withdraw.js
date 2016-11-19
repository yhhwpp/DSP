/**
 * @file withdraw-index.js
 * @author xiaokl
 * @description 广告主代理商/赠送申请
 */
var withdrawIndex = (function ($) {
    var WithdrawIndex = function () {};
    WithdrawIndex.prototype = {
        oWithdrawTitle: {
            res: 0,
            obj: {
                footer: [
                    '汇总',
                    '-',
                    '-',
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
                    field: 'name',
                    title: '媒体商'
                },
                {
                    field: 'money',
                    title: '金额',
                    render: $.fn.dataTable.render.number('', '.', 2, '')
                },
                {
                    field: 'bank',
                    title: '收款信息',
                    render: function (data, type, full) {
                        return '<span style="display:block;">开户行: ' + full.bank + '</span><span style="display:block;">账号: '
                            + full.bank_account + '</span><span style="display:block;">账户名: ' + full.payee + '</span>';
                    }
                },
                {
                    field: 'status',
                    title: '状态',
                    render: function (data, type, full) {
                        return LANG.invoice_status[data];
                    }
                },
                {
                    field: 'id',
                    title: '操作',
                    render: function (data, type, full) {
                        if (full.status === CONSTANT.recharge_status_pending_approval) { // 待审核
                            return '<button type="button" class="btn btn-default js-accept" data-tips="确定审核通过此提款申请吗?">审核通过</button>'
                                + '<button type="button" class="btn btn-default js-reject" data-tips="确定要驳回此提款申请吗?">驳回</button>';
                        }
                        return '-';
                    }
                }
            ]
        },
        _fnCustomOper: function (json) {
            if (json && json.res === 0 && json.obj) {
                var oTFoot = this.find('tfoot tr td');
                if (oTFoot) {
                    if (json.obj.total && json.obj.total.indexOf('-') > -1) {
                        oTFoot.eq(2).html('￥-' + Helper.fnFormatMoney(json.obj.total.substring(1), 2));
                    }
                    else {
                        oTFoot.eq(2).html(json.obj.total === '' ? '-' : '￥' + Helper.fnFormatMoney(json.obj.total, 2));
                    }
                }
            }
        },
        _fnInvoiceUpdate: function (params, tips) {
            Helper.fnConfirm(tips, function () {
                Helper.load_ajax();
                $.post(API_URL.manager_balance_withdrawal_update, params, function (json) {
                    Helper.close_ajax();
                    if (json && json.res === 0) {
                        dataTable.reload(null, false);
                    }
                    else {
                        Helper.fnPrompt(json.msg);
                    }
                }).fail(function () {
                    Helper.close_ajax();
                });
            });
        },
        _fnInitHandle: function () {
            var self = this;
            $('#js-balance-table').delegate('.js-accept', 'click', function () { // 审核通过
                var oData = dataTable.row($(this).parents('tr')[0]).data();
                self._fnInvoiceUpdate({id: oData.id, field: 'status', value: CONSTANT.recharge_status_passed}, $(this).attr('data-tips'));
            });
            $('#js-balance-table').delegate('.js-reject', 'click', function () { // 驳回
                self._fnInvoiceUpdate({id: dataTable.row($(this).parents('tr')[0]).data().id, field: 'status', value: CONSTANT.recharge_status_rejected}, $(this).attr('data-tips'));
            });
        },
        fnInit: function () {
            Helper.fnCreatTable('#js-balance-table', this.oWithdrawTitle, API_URL.manager_balance_withdrawal_index, function (td, sData, oData, row, col, table) {
            }, 'dataTable', {
                fnCustomOper: this._fnCustomOper
            });
            this._fnInitHandle();
        }
    };
    return new WithdrawIndex();
})(window.jQuery);
$(function () {
    withdrawIndex.fnInit();
});
