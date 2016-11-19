/**
 * @file balance-invoice.js
 * @author xiaokl
 * @description 广告主代理商/充值申请
 */
var invoiceIndex = (function ($) {
    var InvoiceIndex = function () {};
    InvoiceIndex.prototype = {
        oInvoiceTitle: {
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
                    field: 'create_time',
                    title: '申请时间'
                },
                {
                    field: 'client_type',
                    title: '类型',
                    render: function (data, type, full) {
                        return LANG.client_type[data];
                    }
                },
                {
                    field: 'contact_name',
                    title: '联系人'
                },
                {
                    field: 'invoice_type',
                    title: '发票类型',
                    render: function (data, type, full) {
                        return LANG.invoice_type[data];
                    }
                },
                {
                    field: 'money',
                    title: '发票金额'
                },
                {
                    field: 'title',
                    title: '发票抬头'
                },
                {
                    field: 'prov',
                    title: '邮寄信息'
                },
                {
                    field: 'status',
                    title: '发票状态',
                    render: function (data, type, full) {
                        return LANG.invoice_status[data];
                    }
                },
                {
                    field: 'id',
                    title: '操作',
                    render: function (data, type, full) {
                        if (full.status === CONSTANT.invoice_status_applying) { // 申请中
                            return '<button type="button" class="btn btn-default js-accept">审核通过</button>'
                                + '<button type="button" class="btn btn-default js-reject">驳回</button>';
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
                    oTFoot.eq(4).html(json.obj.total === '' ? '-' : '￥' + Helper.fnFormatMoney(json.obj.total));
                }
            }
        },
        _fnInitHandle: function () {
            $('#js-balance-table').delegate('.js-accept', 'click', function () { // 审核通过
                var oData = dataTable.row($(this).parents('tr')[0]).data();
                Helper.load_ajax();
                $.post(API_URL.manager_balance_invoice_update, {id: oData.id, field: 'status', value: CONSTANT.invoice_status_passed}, function (json) {
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
                $.post(API_URL.manager_balance_invoice_update, {id: $('input[name=reject-id]').val(), field: 'status', value: CONSTANT.invoice_status_rejected, content: $('#reject-content').val()}, function (json) {
                    Helper.close_ajax();
                    if (json && json.res === 0) {
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
        _fnCustomColumn: function (td, sData, oData, row, col, table) {
            var thisCol = table.nameList[col];
            if (thisCol === 'money') {
                $(td).html(Helper.fnGetPopoverOrTooltip({
                    'class': 'rechargeMoney',
                    'data-on': '1',
                    'data-toggle': 'popover',
                    'data-trigger': 'hover',
                    'data-placement': 'top'
                }, '￥&nbsp;' + Number(sData).toFixed(2)));
            }
            else if (thisCol === 'prov') {
                $(td).html('<span style="display:block;">' + oData.prov + '&nbsp;' + oData.city + '&nbsp;' + oData.dist + '</span><span style="display:block;">' + oData.receiver + '</span><span  style="display:block;">' + oData.tel + '</span>');
            }
        },
        _fnDrawCallback: function () {
            var trigger;
            $('.rechargeMoney').hover(function (e) {
                var _this = $(this);
                trigger = setTimeout(function () {
                    if (_this.attr('data-on') === '1') {
                        Helper.load_ajax();
                        var param = {
                            id: dataTable.row(_this.parents('tr')[0]).data().id
                        };
                        $.post(API_URL.manager_balance_invoice_detail, param, function (result) {
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
            $('[data-toggle="tooltip"]').tooltip();
            $('[data-toggle="popover"]').popover({
                html: true
            });
        },
        fnInit: function () {
            var self = this;
            Helper.fnCreatTable('#js-balance-table', this.oInvoiceTitle, API_URL.manager_balance_invoice_index, function (td, sData, oData, row, col, table) {
                self._fnCustomColumn(td, sData, oData, row, col, table);
            }, 'dataTable', {
                fnCustomOper: this._fnCustomOper,
                fnDrawCallback: this._fnDrawCallback
            });
            this._fnInitHandle();
        }
    };
    return new InvoiceIndex();
})(window.jQuery);
$(function () {
    invoiceIndex.fnInit();
});
