/**
 * @file audit-advertiser.js
 * @author xiaokl
 * @description 广告主数据审计
 */
var auditAdvertiser = (function ($) {
    var AuditAdvertiser = function () {
        this.operationList = '';
    };
    AuditAdvertiser.prototype = {
        oAdvertiserTitle: {
            res: 0,
            obj: null,
            list: [
                {
                    field: 'date',
                    title: '日期'
                },
                {
                    field: 'clientname',
                    title: '广告主'
                },
                {
                    field: 'products_name',
                    title: '产品',
                    render: function (data, type, full) {
                        if ((+full.products_type) === CONSTANT.products_type_package) {
                            if (full.icon) {
                                return '<img src="' + full.icon + '" width="40" height="40"/>' + data;
                            }
                            return '<img src="" width="40" height="40"/>' + data;
                        }
                        return data;
                    }
                },
                {
                    field: 'app_name',
                    title: '广告'
                },
                {
                    field: 'campaignid',
                    title: '投放数据',
                    render: function (data, type, full) {
                        return '<button type="button" class="btn btn-default js-delivery">查看</button>';
                    }
                },
                {
                    field: 'status',
                    title: '状态',
                    render: function (data, type, full) {
                        return (data != null && data !== '') ? LANG.advertiser_audit_status[data] : '';
                    }
                },
                {
                    field: 'check_date',
                    title: '生效时间'
                },
                {
                    field: 'id',
                    title: '操作'
                }
            ]
        },
        oDeliveryTitle: {
            res: 0,
            obj: null,
            list: [
                {
                    field: 'name',
                    title: '媒体商'
                },
                {
                    field: 'platform',
                    title: '平台',
                    render: function (data, type, full) {
                        if ((+data) === 3) {
                            return 'iOS';
                        }
                        return LANG.platform_group[data];
                    }
                },
                {
                    field: 'mode',
                    title: '投放类型',
                    render: function (data, type, full) {
                        return LANG.mode[data];
                    }
                },
                {
                    field: 'impressions',
                    title: '展示量'
                },
                {
                    field: 'conversions',
                    title: '下载量'
                },
                {
                    field: 'total_revenue',
                    title: '收入'
                },
                {
                    field: 'af_income',
                    title: '支出'
                }
            ]
        },
        _fnInitTab: function () { // 初始化Tab
            var self = this;
            /* eslint no-undef: [0]*/
            fnIsLogin(function (json) {
                var revenueType = Helper.fnGetQueryParam('revenue_type');
                var aryRevenueType = [];
                if (revenueType === undefined || revenueType == null || revenueType === '') {
                    revenueType = '';
                }
                else {
                    aryRevenueType.push(revenueType);
                }
                $('.js-audit-tab').html((doT.template($('#tpl-audittab').text()))($.extend({}, json, {revenue_type: revenueType})));

                if (!revenueType) {
                    $('.revenue-type').html($.tmpl('#tpl-revenue-type', {
                        revenue_type: revenueType
                    }));
                }
                self.operationList = json.obj.operation_list ? json.obj.operation_list : '';
                self._fnInitTable(aryRevenueType);
            }, function () {});
        },
        _fnCustomColumn: function (td, sData, oData, row, col, table) {
            var self = this;
            var thisCol = table.nameList[col];
            if (thisCol === 'id') {
                var sHtml = '';
                if (oData.status === CONSTANT.audit_adv_status_no_update || oData.status === CONSTANT.audit_adv_status_rejected) { // 未更新, 未通过
                    sHtml += '<button type="button" class="btn btn-default js-update" data-value="1" data-field="status" data-tips="确定要更新吗？">更新</button>';
                }
                else if (oData.status === CONSTANT.audit_adv_status_pending_approval) { // 待审核
                    if (self.operationList.indexOf(OPERATION_LIST.manager_client_audit_check) > -1) { // 判断是否有广告数据审计审核的权限
                        sHtml += '<button type="button" class="btn btn-default js-accept" data-field="status" data-value="2" data-tips="审核通过后，数据将无法修改">通过</button>';
                        sHtml += '<button type="button" class="btn btn-default js-reject" data-field="status" data-value="3" data-tips="审计结果将被驳回，是否确定驳回">驳回</button>';
                    }
                }
                else if (oData.status === CONSTANT.audit_adv_status_passed) { // 通过
                    sHtml += '已通过，无法再更新';
                }
                $(td).html(sHtml);
            }
            else if (thisCol === 'date') {
                if (oData.status === CONSTANT.audit_adv_status_no_update || oData.status === CONSTANT.audit_adv_status_pending_approval) {
                    $(td).html('<label class="checkbox-inline"><input type="checkbox" name="check_date" data-type="select-ad" data-cid="' + oData.campaignid + '" data-date="' + oData.date + '" data-status="' + oData.status + '">' + sData + '</label>');
                }
                else {
                    $(td).html('<label class="checkbox-inline"><input type="checkbox" name="check_date" data-cid="' + oData.campaignid + '" data-date="' + oData.date + '" data-status="' + oData.status + '" disabled>' + sData + '</label>');
                }
            }
        },
        _fnBindSelect: function (mData, obj) {
            $('<select data-name="' + mData + '"><option value="">所有</option></select>').appendTo(obj).on('change', function (evt) {
                evt.stopPropagation();
                $('input[name=' + $(this).attr('data-name') + ']').val($(this).val());
                dataTable.reload();
            }).on('focus', function (evt) {
                $(this).val($('input[name=' + $(this).attr('data-name') + ']').val());
            });
        },
        _fnInitComplete: function (settings, json, obj) {
            var self = this;
            var aoColumns = settings.aoColumns;
            var api = obj.api();
            for (var i = 0, j = aoColumns.length; i < j; i++) {
                var mData = aoColumns[i].mData;
                if (mData === 'status') {
                    var column = api.column(i);
                    var $span = $('<span class="addselect">▾</span>').appendTo($(column.header()));
                    self._fnBindSelect(mData, $span);
                }
            }
            if ($('select[data-name=status]') && $('select[data-name=status]').length > 0) { // 获取平台
                var objPlatform = $('select[data-name=status]');
                var options = '';
                for (var key in LANG.advertiser_audit_status) {
                    options += '<option value="' + key + '">' + LANG.advertiser_audit_status[key] + '</option>';
                }
                objPlatform.append(options);
            }
        },
        _fnInitTable: function (aryRevenueType) {
            var self = this;
            Helper.fnCreatTable('#js-advertiser-table', this.oAdvertiserTitle, API_URL.manager_audit_advertiser_index, function (td, sData, oData, row, col, table) {
                self._fnCustomColumn(td, sData, oData, row, col, table);
            }, 'dataTable', {
                sDom: '<\'row\'<\'col-sm-6\'><\'col-sm-6\'f>><\'row\'<\'col-sm-12\'tr>><\'row\'<\'col-sm-5\'l><\'col-sm-7\'p>>',
                fnInitComplete: function (settings, json) {
                    self._fnInitComplete(settings, json, this);
                },
                postData: {
                    revenueType: function () {
                        var revenueType = Helper.fnGetQueryParam('revenue_type');
                        if (!revenueType) {
                            if ($('select[name=revenue-type]').val() !== '') {
                                aryRevenueType[0] = $('select[name=revenue-type]').val();
                            }
                        }
                        return aryRevenueType;
                    },
                    status: function () {
                        return $('input[name=status]').val();
                    },
                    start: function () {
                        return $('#startdate').val();
                    },
                    end: function () {
                        return $('#enddate').val();
                    },
                    platform: function () {
                        if ($('select[name="platform"]').val()) {
                            return $('select[name="platform"]').val();
                        }
                    }
                },
                fnDrawCallback: function () {
                    $('#js-search').attr('disabled', false);
                    $('#adv-select-all').prop('checked', false);
                }
            });
        },
        _fnAuditUpdate: function (params, tips) { // 更新广告主数据审计
            Helper.fnConfirm(tips, function () {
                Helper.load_ajax();
                $.post(API_URL.manager_audit_advertiser_update, params, function (json) {
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
        _fnGetYmd: function (date) {
            var sMonth = date.getMonth() + 1;
            if (sMonth < 10) {
                sMonth = '0' + sMonth;
            }
            var sDay = date.getDate();
            if (sDay < 10) {
                sDay = '0' + sDay;
            }
            var sYear = date.getFullYear();
            return sYear + '-' + sMonth + '-' + sDay;
        },
        _fnInitDate: function () {
            var sDate = new Date();
            sDate.setDate(sDate.getDate() - 7);
            $('#startdate').val(this._fnGetYmd(sDate));
            var eDate = new Date();
            $('#enddate').val(this._fnGetYmd(eDate));
            $('#js-search').click(function () {
                $(this).attr('disabled', true);
                dataTable.reload();
            });
        },
        _fnInitHandle: function () { // 初始化操作
            var self = this;
            self._fnInitDate(); // 初始化日期
            $('#js-batch-ope').delegate('#adv-select-all', 'click', function () { // 全选操作，仅对待审核、
                if ($(this).is(':checked')) {
                    $('#js-advertiser-table input[data-type="select-ad"]').prop('checked', true);
                }
                else {
                    $('#js-advertiser-table input[data-type="select-ad"]').prop('checked', false);
                }
            });
            $('#js-batch-ope').delegate('#js-update-batch', 'click', function () { // 批量更新并通过
                var arr = [];
                $('#js-advertiser-table input[data-type="select-ad"]:checked').each(function () {
                    var $this = $(this);
                    arr.push({
                        campaignid: $this.attr('data-cid'),
                        field: 'status',
                        value: 2,
                        date: $this.attr('data-date')
                    });
                });
                if (arr.length === 0) {
                    Helper.fnPrompt('请先选择需要更新的广告！');
                    return;
                }
                Helper.load_ajax();
                $.post(API_URL.manager_audit_advertiser_update_batch, {data: JSON.stringify(arr)}, function (json) {
                    $('#adv-select-all').prop('checked', false);
                    Helper.close_ajax();
                    Helper.fnPrompt(json.msg);
                    dataTable.reload();
                }).fail(function () {
                    Helper.close_ajax();
                });
            });
            $('#js-advertiser-table').delegate('.js-update,.js-accept,.js-reject', 'click', function () { // 更新，通过，驳回
                var oData = dataTable.row($(this).parents('tr')[0]).data();
                self._fnAuditUpdate({
                    campaignid: oData.campaignid,
                    field: $(this).attr('data-field'),
                    value: $(this).attr('data-value'),
                    date: oData.date
                }, $(this).attr('data-tips'));
            });
            $('#js-advertiser-table').delegate('.js-delivery', 'click', function () { // 查看广告主投放数据
                var oData = dataTable.row($(this).parents('tr')[0]).data();
                var nrevenueType = Helper.fnGetQueryParam('revenue_type') || '';
                var oTitle = $.extend(true, {}, self.oDeliveryTitle);
                if (+nrevenueType === CONSTANT.revenue_type_cpt || +nrevenueType === CONSTANT.revenue_type_cps) {
                    oTitle.list.splice(3, 2);
                }
                else if (+nrevenueType === CONSTANT.revenue_type_cpa) {
                    oTitle.list[4] = {
                        field: 'cpa',
                        title: 'CPA量'
                    };
                }
                $('#js-products-icon').attr('src', oData.icon).css('display', (+oData.products_type) === CONSTANT.products_type_package ? 'inline' : 'none');
                $('#js-products-name').text(oData.products_name);
                $('#js-app-name').text(oData.app_name);
                $('#js-delivery-modal input[name=campaignid]').val(oData.campaignid);
                $('#js-delivery-modal input[name=date]').val(oData.date);
                $('#js-delivery-modal').modal({backdrop: 'static'}).off('shown.bs.modal').on('shown.bs.modal', function () {
                    if (window.deliveryTable) {
                        window.deliveryTable.reload();
                    }
                    else {
                        Helper.fnCreatTable('#js-delivery-table', oTitle, API_URL.manager_audit_advertiser_delivery, function (td, sData, oData, row, col, table) {
                        }, 'deliveryTable', {
                            searching: false,
                            info: false,
                            fixedHeader: false,
                            scrollY: '400px',
                            scrollCollapse: true,
                            postData: {
                                campaignid: function () {
                                    return $('#js-delivery-modal input[name=campaignid]').val();
                                },
                                date: function () {
                                    return $('#js-delivery-modal input[name=date]').val();
                                }
                            }
                        });
                    }
                });
            });
            $(window).resize(function (event) {
                /* Act on the event */
                if (window.deliveryTable) {
                    window.deliveryTable.columns.adjust();
                }
            });
        },
        fnInit: function () {
            this._fnInitHandle();
            this._fnInitTab();
        }
    };

    return new AuditAdvertiser();
})(window.jQuery);
$(function () {
    auditAdvertiser.fnInit();
});
