/**
 * @file gift-index.js
 * @author xiaokl
 * @description 广告主代理商/赠送申请
 */
var giftIndex = (function ($) {
    var GiftIndex = function () {};
    GiftIndex.prototype = {
        oGiftTitle: {
            res: 0,
            obj: {
                footer: [
                    '汇总',
                    '-',
                    '-',
                    '-',
                    '-',
                    '-',
                    '-'
                ]
            },
            list: [
                {
                    field: 'created_at',
                    title: '申请时间'
                },
                {
                    field: 'contact_name',
                    title: '申请人'
                },
                {
                    field: 'clientname',
                    title: '赠送对象'
                },
                {
                    field: 'amount',
                    title: '赠送金额(元)',
                    render: $.fn.dataTable.render.number(',', '.', 2, '')
                },
                {
                    field: 'gift_info',
                    title: '赠送原因'
                },
                {
                    field: 'status',
                    title: '状态',
                    render: function (data, type, full) {
                        return LANG.gift_status[data];
                    }
                },
                {
                    field: 'id',
                    title: '操作',
                    render: function (data, type, full) {
                        if (full.status === CONSTANT.recharge_status_pending_approval) { // 待审核
                            return '<button type="button" class="btn btn-default js-accept" data-tips="确定要通过审核此赠送申请吗?">通过审核</button>'
                                + '<button type="button" class="btn btn-default js-reject" data-tips="确定要驳回此赠送申请吗?">驳回</button>';
                        }
                        return '-';
                    }
                }
            ]
        },
        _fnFreshNum: function () {
            $.get(API_URL.trafficker_common_balance_pending_audit, function (data) {
                var cNum = data.obj.recharge_count ? data.obj.recharge_count : 0;
                var mNum = data.obj.gift_count ? data.obj.gift_count : 0;
                var num = cNum + mNum;
                $('#menu [data-type="trafficker-self-balance"] .badge').html(num > 0 ? num : '');
                $('#tab-type-wrapper [data-type="recharge-num"]').html(cNum > 0 ? cNum : '');
                $('#tab-type-wrapper [data-type="gift-num"]').html(mNum > 0 ? mNum : '');
            });
        },
        _fnCustomOper: function (json) {
            if (json && json.res === 0 && json.obj) {
                var oTFoot = this.find('tfoot tr td');
                if (oTFoot) {
                    oTFoot.eq(3).html(json.obj.total === '' ? '-' : Helper.fnFormatMoney(json.obj.total));
                }
            }
        },
        _fnInvoiceUpdate: function (params, tips) {
            var _this = this;
            Helper.fnConfirm(tips, function () {
                Helper.load_ajax();
                $.post(API_URL.trafficker_balance_gift_update, params, function (json) {
                    Helper.close_ajax();
                    if (json && json.res === 0) {
                        _this._fnFreshNum();
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
            this._fnFreshNum();
            Helper.fnCreatTable('#js-balance-table', this.oGiftTitle, API_URL.trafficker_balance_gift_index, function (td, sData, oData, row, col, table) {
            }, 'dataTable', {
                fnCustomOper: this._fnCustomOper
            });
            this._fnInitHandle();
        }
    };
    return new GiftIndex();
})(window.jQuery);
$(function () {
    giftIndex.fnInit();
});
