/**
 * @file balance-index.js
 * @author xiaokl
 * @description 充值明细
 */
var rechargeIndex = (function ($) {
    var RechargeIndex = function () {};
    RechargeIndex.prototype = {
        oRechargeTitle: {
            res: 0,
            obj: {
                footer: [
                    '汇总',
                    '-',
                    '-',
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
                    field: 'apply_time',
                    title: '申请时间'
                },
                {
                    field: 'contact_name',
                    title: '申请人'
                },
                {
                    field: 'clientname',
                    title: '充值对象'
                },
                {
                    field: 'amount',
                    title: '充值金额(元)',
                    render: $.fn.dataTable.render.number(',', '.', 2, '')
                },
                {
                    field: 'way',
                    title: '广告主充值方式',
                    render: function (data, type, full) {
                        return LANG.recharge_way[data];
                    }
                },
                {
                    field: 'account_info',
                    title: '广告主充值账号'
                },
                {
                    field: 'date',
                    title: '广告主充值日期'
                },
                {
                    field: 'status',
                    title: '状态',
                    render: function (data, type, full) {
                        return LANG.recharge_status[data];
                    }
                },
                {
                    field: 'id',
                    title: '操作',
                    render: function (data, type, full) {
                        if (full.status === CONSTANT.recharge_status_pending_approval) { // 待审核
                            return '<button type="button" class="btn btn-default js-accept">通过审核</button>'
                                + '<button type="button" class="btn btn-default js-reject">驳回</button>';
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
        _fnInitHandle: function () {
            var _this = this;
            $('#js-balance-table').delegate('.js-accept', 'click', function () { // 审核通过
                var oData = dataTable.row($(this).parents('tr')[0]).data();
                Helper.fnConfirm('您确定该充值信息审核通过吗?', function () {
                    Helper.load_ajax();
                    $.post(API_URL.trafficker_balance_recharge_update, {id: oData.id, field: 'status', value: CONSTANT.recharge_status_passed}, function (json) {
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
            });
            $('#js-reject-modal form').validation();
            $('#js-balance-table').delegate('.js-reject', 'click', function () { // 驳回
                $('input[name=reject-id]').val(dataTable.row($(this).parents('tr')[0]).data().id);
                $('#js-reject-modal').modal({backdrop: 'static'});
            });
            $('#js-reject-modal').delegate('#js-reject-btn', 'click', function () {
                if (!$('#js-reject-modal form').valid()) {
                    return false;
                }
                Helper.load_ajax();
                $.post(API_URL.trafficker_balance_recharge_update, {id: $('input[name=reject-id]').val(), field: 'status', value: CONSTANT.recharge_status_rejected, content: $('#reject-content').val()}, function (json) {
                    Helper.close_ajax();
                    if (json && json.res === 0) {
                        _this._fnFreshNum();
                        $('#js-reject-modal').modal('hide');
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
        fnInit: function () {
            this._fnFreshNum();
            Helper.fnCreatTable('#js-balance-table', this.oRechargeTitle, API_URL.trafficker_balance_recharge_index, function (td, sData, oData, row, col, table) {
            }, 'dataTable', {
                fnCustomOper: this._fnCustomOper
            });
            this._fnInitHandle();
        }
    };
    return new RechargeIndex();
})(window.jQuery);
$(function () {
    rechargeIndex.fnInit();
});
