/**
 * @file operation-common.js
 * @author xiaokl
 * @description 媒体商数据审计和运营明细公共
 */
(function ($) {
    $.fn.commonindex = {};
    var CommonIndex = function (params) {
        this.operationList = '';
        this.indexUrl = params.indexUrl;
        this.updateUrl = params.updateUrl;
        this.importUrl = params.importUrl;
        this.exportUrl = params.exportUrl;
        this.extendsions = params.extendsions;
        this.oAuditTitle = {
            res: 0,
            msg: '操作成功',
            obj: null,
            map: null,
            list: [{
                field: 'name',
                title: '广告主名称'
            }, {
                field: 'app_name',
                title: '应用名称'
            }, {
                field: 'zonename',
                title: '广告位名称'
            }, {
                field: 'total',
                title: '总数量'
            }, {
                field: 'zoneid',
                title: '扣减量'
            }]
        };
    };
    CommonIndex.prototype = {
        oTitle: {
            res: 0,
            obj: null,
            list: [
                {
                    field: 'day_time',
                    sClass: 'mtable-col-bdr'
                }, {
                    field: 'clients'
                }, {
                    field: 'traffickers'
                }, {
                    field: 'partners',
                    sClass: 'mtable-col-bdr'
                }, {
                    field: 'manual_clients'
                }, {
                    field: 'manual_traffickers'
                }, {
                    field: 'manual_partners',
                    sClass: 'mtable-col-bdr'
                }, {
                    field: 'audit_traffickers',
                    render: function (data, type, full) {
                        if (full.status === CONSTANT.audit_status_pending_audit && Number(data) === 0) {
                            return '-';
                        }
                        return data;
                    }
                }, {
                    field: 'audit_partners',
                    sClass: 'mtable-col-bdr',
                    render: function (data, type, full) {
                        if (full.status === CONSTANT.audit_status_pending_audit && Number(data) === 0) {
                            return '-';
                        }
                        return data;
                    }
                }, {
                    field: 'status',
                    render: function (data, type, full) {
                        return LANG.audit_status[data];
                    },
                    sClass: 'mtable-col-bdr'
                }, {
                    field: 'id',
                    sClass: 'mtable-col-bdr'
                }
            ]
        },
        _fnInitTab: function () { // 初始化Tab
            var self = this;
            var tab = Helper.fnGetQueryParam('tab');
            tab = tab ? tab : 'audit';
            /* eslint no-undef: [0]*/
            fnIsLogin(function (json) {
                $('.js-audit-tab').html((doT.template($('#tpl-audittab').text()))(json));
                self.operationList = json.obj.operation_list ? json.obj.operation_list : '';
                self._fnInitTable();
            }, function () {});
        },
        _fnCustomColumn: function (td, sData, oData, row, col, table) {
            var self = this;
            var thisCol = table.nameList[col];
            if (thisCol === 'id') {
                var sHtml = '';
                if (self.operationList.indexOf(OPERATION_LIST.manager_trafficker_audit) > -1) {
                    if (oData.status === CONSTANT.audit_status_pending_audit || oData.status === CONSTANT.audit_status_rejected || oData.status === CONSTANT.audit_status_waiting_audit) { // 待审计, 驳回
                        sHtml += '<div class="btn-bg-div"><span class="btn-bg"></span></div>';
                        sHtml += '<button type="button" class="btn btn-default js-audit-check" data-value="1" data-tips="提交审核后，无法修改">提交审核</button>';
                    }
                }
                if (self.operationList.indexOf(OPERATION_LIST.manager_audit_check) > -1) {
                    if (oData.status === CONSTANT.audit_status_pending_approval) { // 待审核
                        sHtml += '<button type="button" class="btn btn-default js-accept" data-value="6" data-tips="提交审核通过后，数据将无法修改">通过</button>';
                        sHtml += '<button type="button" class="btn btn-default js-reject" data-value="2" data-tips="审计结果将被驳回，是否确定驳回">驳回</button>';
                    }
                    else if (oData.status === CONSTANT.audit_status_pending_gene_report || oData.status === CONSTANT.audit_status_gene_report || oData.status === CONSTANT.audit_status_gene_settlement) {
                        sHtml += '已通过审核，无法修改';
                    }
                }
                $(td).html(sHtml);
            }
        },
        _fnAudutCustomColumn: function (td, sData, oData, row, col, table) {
            var thisCol = table.nameList[col];
            if (thisCol === 'zoneid') {
                $(td).html('<input class="form-control audit-modify" type="number" min="0" max="' + oData.total + '" data-campaignid="' + oData.campaignid + '" data-zoneid="' + oData.zoneid + '" data-min="0" data-max="' + oData.total + '">');
            }
        },
        _fnCustomOper: function (json) {
            if (json && json.res === 0 && json.obj) {
                var oTFoot = this.find('tfoot tr td');
                if (oTFoot) {
                    oTFoot.eq(1).html(json.obj.clients_total);
                    oTFoot.eq(2).html(json.obj.traffickers_total);
                    oTFoot.eq(3).html(json.obj.partners_total);
                    oTFoot.eq(4).html(json.obj.manual_clients_total);
                    oTFoot.eq(5).html(json.obj.manual_traffickers_total);
                    oTFoot.eq(6).html(json.obj.manual_partners_total);
                    oTFoot.eq(7).html(json.obj.audit_traffickers_total);
                    oTFoot.eq(8).html(json.obj.audit_partners_total);
                }
            }
        },
        _fnInitTable: function () {
            var self = this;
            Helper.fnCreatTable('#js-audit-table', this.oTitle, self.indexUrl, function (td, sData, oData, row, col, table) {
                self._fnCustomColumn(td, sData, oData, row, col, table);
            }, 'dataTable', {
                searching: false,
                fnCustomOper: this._fnCustomOper
            });
        },
        _fnAuditUpdate: function (params, tips) {
            var self = this;
            Helper.fnConfirm(tips, function () {
                Helper.load_ajax();
                $.post(self.updateUrl, params, function (json) {
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
        _fnInitHandle: function () { // 初始化操作
            var self = this;
            $('#js-audit-table').delegate('.js-export-detail', 'click', function () { // 导出明细
                var oData = dataTable.row($(this).parents('tr')[0]).data();
                if (Number(oData.clients) === 0) {
                    Helper.fnPrompt(oData.day_time + '无投放明细记录');
                    return;
                }
                window.location.href = encodeURI(self.exportUrl + '?date=' + oData.day_time);
            });
            var up_datas;
            $('#js-file-up').uploadFile({
                url: self.importUrl,
                fileName: 'file',
                dynamicFormData: function () {
                    this.user_data = $.extend({}, up_datas || {});
                    delete up_datas.dom;
                    return $.extend({}, up_datas || {});
                },
                multiple: false,
                allowedTypes: self.extendsions,
                onFilter: function (file, error, dom) {
                    Helper.fnPrompt(error);
                },
                onError: function (files, json, xhr) {
                    $(this.user_data.dom).attr('disabled', false);
                    $(this.user_data.dom).parent().find('.btn-bg-div').hide();
                },
                onSuccess: function (files, json, xhr) {
                    $(this.user_data.dom).attr('disabled', false);
                    var data = json;
                    var oParentDom = $(this.user_data.dom).parent();
                    oParentDom.find('.btn-bg-div').hide();
                    oParentDom.find('.btn-bg').width('100%');
                    if (data && data.res === 0) {
                        dataTable.reload(null, false);
                    }
                    else {
                        Helper.fnPrompt(data.msg);
                        $(this.user_data.dom).parent().find('.btn-bg-div').hide();
                    }
                },
                onProgress: function (percent) {
                    $(this.user_data.dom).attr('disabled', true);
                    $(this.user_data.dom).parent().find('.btn-bg-div').show();
                    $(this.user_data.dom).parent().find('.btn-bg').width(percent + '%');
                }
            });
            $('#js-audit-table').delegate('.js-import-detail', 'click', function () { // 导入明细
                up_datas = {};
                up_datas.dom = $(this);
                up_datas.date = dataTable.row($(this).parents('tr')[0]).data().day_time;
                $('.ajax-file-upload input[type=file]:last').trigger('click');
            });
            $('#js-audit-table').delegate('.js-accept,.js-reject', 'click', function () { // 提交审核, 通过, 驳回
                self._fnAuditUpdate({
                    id: dataTable.row($(this).parents('tr')[0]).data().id,
                    field: 'status',
                    value: $(this).attr('data-value')
                }, $(this).attr('data-tips'));
            });
            $('#js-audit-table').delegate('.js-audit-check', 'click', function () { // 媒体商数据审计审核
                self.date = dataTable.row($(this).parents('tr')[0]).data().day_time;
                var opt = {
                    bPaginate: false,
                    bInfo: false,
                    scrollY: '400px',
                    scrollX: true,
                    scrollCollapse: true,
                    fixedHeader: false,
                    serverSide: false,
                    postData: {
                        date: function () {
                            return self.date;
                        }
                    }
                };
                $('.js-audit-modal').modal('show').off('shown.bs.modal').on('shown.bs.modal', function () {
                    window.autditTb && window.autditTb.destroy();
                    Helper.fnCreatTable('#js-audit-modal-table', self.oAuditTitle, API_URL.manager_audit_expense_data, self._fnAudutCustomColumn, 'autditTb', opt);
                });
            });

            $('.js-audit-modal').delegate('.audit-modify', 'keyup', function (e) {
                var keyCode = e.keyCode;
                var _max = $(this).data('max');
                var _v = $(this).val();
                if (_v >= _max) {
                    _v = _max;
                }
                if (!((keyCode >= 48 && keyCode <= 57) || (keyCode >= 96 && keyCode <= 105))) {
                    _v = '';
                }
                $(this).val(_v);
            });

            $('.js-audit-modal').delegate('.trafficker-audit-modify', 'click', function () {
                var oPostJson = {
                    date: self.date,
                    arr: []
                };
                var _arr = oPostJson.arr;
                var n = 0;
                $('.audit-modify').each(function (i, v) {
                    var _v = $(v).val();
                    if (_v) {
                        _arr[n] = {
                            campaignid: $(v).data('campaignid'),
                            zoneid: $(v).data('zoneid'),
                            num: _v
                        };
                        n++;
                    }
                });

                oPostJson.arr = JSON.stringify(oPostJson.arr);
                Helper.load_ajax();
                $.post(API_URL.manager_audit_pass, oPostJson, function (response) {
                    if (response && response.res === 0) {
                        Helper.close_ajax();
                        $('.js-audit-modal').modal('hide');
                        dataTable.reload(null, false);
                    }
                    else {
                        Helper.fnPrompt(response.msg);
                    }
                });
            });


        },
        fnInit: function () {
            this._fnInitTab();
            this._fnInitHandle();
        }
    };
    $.fn.commonindex.Obj = CommonIndex;
})(window.jQuery);
